'use strict';
/**
 * The Module Federation share policy for every app, derived from the apps' `package.json` files.
 * The Native Shell is the only app in a store binary, so it is the only one that can link native
 * code. It provides `react` and each native-backed package it depends on; the Host and remotes
 * take those from it (`import: false`) and never bundle their own.
 *
 * The shell shares only what some Host or remote depends on. A package shared eagerly from the
 * shell that no consumer declares (as `zephyr-native-cache` would be) makes the remotes' container
 * initialization fail in @module-federation/metro 2.9.0 (`_targetShared.get is not a function`).
 *
 * A Host or remote that depends on a native-backed package the shell doesn't provide, or on a
 * different version of one, fails at Metro config load: its JS would call native code missing
 * from (or different in) the installed binary. This checks build time only: a bundle published
 * against one shell can still reach an older installed shell, so publish to an environment only
 * shells with the same native dependencies follow.
 *
 * Module Federation shares by exact specifier. If a remote's dependency imports a package's
 * internals by deep path (some native libraries import `react-native/Libraries/...`), add that
 * path to DEEP_IMPORTS, or the remote bundles a second copy of it.
 */
const fs = require('node:fs');
const path = require('node:path');

const APPS_DIR = path.resolve(__dirname, '../../apps');
const SHELL_DIR = path.join(APPS_DIR, 'native-shell');

/** Every Host and remote: the other apps under apps/. */
function consumerDirs() {
  return fs
    .readdirSync(APPS_DIR, {withFileTypes: true})
    .filter(entry => entry.isDirectory() && entry.name !== 'native-shell')
    .map(entry => path.join(APPS_DIR, entry.name))
    .filter(dir => fs.existsSync(path.join(dir, 'package.json')));
}

/** Shared even though it has no native code: two Reacts in one runtime break every hook. */
const ALWAYS_SHARED = ['react'];

/** Deep imports shared with their package's version, e.g. `react-native/Libraries/...`. */
const DEEP_IMPORTS = [];

function readPackageJson(dir) {
  return JSON.parse(fs.readFileSync(path.join(dir, 'package.json'), 'utf8'));
}

function installedPackageDir(name, fromDir) {
  return path.dirname(
    require.resolve(`${name}/package.json`, {paths: [fromDir]}),
  );
}

/** Autolinking links a package with an iOS podspec or an Android project. */
function hasNativeCode(packageDir) {
  return (
    fs.existsSync(path.join(packageDir, 'android')) ||
    fs.readdirSync(packageDir).some(file => file.endsWith('.podspec'))
  );
}

function versionIn(name, fromDir) {
  return readPackageJson(installedPackageDir(name, fromDir)).version;
}

/** Package name → version, for everything the shell provides. */
function shellProvided() {
  const names = Object.keys(readPackageJson(SHELL_DIR).dependencies ?? {});
  const provided = new Map();
  for (const name of names) {
    if (
      ALWAYS_SHARED.includes(name) ||
      hasNativeCode(installedPackageDir(name, SHELL_DIR))
    )
      provided.set(name, versionIn(name, SHELL_DIR));
  }
  for (const deep of DEEP_IMPORTS) {
    const owner = deep.startsWith('@')
      ? deep.split('/').slice(0, 2).join('/')
      : deep.split('/')[0];
    const version = provided.get(owner);
    if (version === undefined)
      throw new Error(
        `DEEP_IMPORTS lists ${deep}, but the Native Shell does not provide ${owner}.`,
      );
    provided.set(deep, version);
  }
  return provided;
}

/** `shared` for the Native Shell: what it provides that some consumer uses, eagerly. */
function shellShared() {
  const used = new Set(
    consumerDirs().flatMap(dir =>
      Object.keys(readPackageJson(dir).dependencies ?? {}),
    ),
  );
  return Object.fromEntries(
    [...shellProvided()]
      .filter(([name]) =>
        used.has(
          DEEP_IMPORTS.includes(name)
            ? name
                .split('/')
                .slice(0, name.startsWith('@') ? 2 : 1)
                .join('/')
            : name,
        ),
      )
      .map(([name, version]) => [
        name,
        {singleton: true, eager: true, requiredVersion: version, version},
      ]),
  );
}

/**
 * `shared` for a Host or remote in `appDir`: the provided packages it depends on, taken from the
 * shell. Throws for a native-backed dependency the shell doesn't provide at the same version.
 */
function consumerShared(appDir) {
  const provided = shellProvided();
  const app = readPackageJson(appDir);
  const shared = {};
  const problems = [];
  for (const name of Object.keys(app.dependencies ?? {})) {
    const version = versionIn(name, appDir);
    const shellVersion = provided.get(name);
    if (shellVersion === undefined) {
      if (hasNativeCode(installedPackageDir(name, appDir)))
        problems.push(
          `${name}@${version} has native code, but the Native Shell doesn't depend on it`,
        );
      continue;
    }
    if (version !== shellVersion) {
      problems.push(
        `${name}@${version}, but the Native Shell provides ${shellVersion}`,
      );
      continue;
    }
    shared[name] = {
      singleton: true,
      eager: false,
      import: false,
      requiredVersion: version,
      version,
    };
  }
  for (const deep of DEEP_IMPORTS) {
    const owner = Object.keys(shared).find(name => deep.startsWith(`${name}/`));
    if (owner) shared[deep] = {...shared[owner]};
  }
  if (problems.length > 0)
    throw new Error(
      `${app.name} can't run in the Native Shell:\n- ${problems.join('\n- ')}\n` +
        'Add the package to apps/native-shell/package.json at the same version, then rebuild the shell.',
    );
  return shared;
}

module.exports = {shellShared, consumerShared};
