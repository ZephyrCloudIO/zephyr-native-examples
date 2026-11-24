# Zephyr Native Shell + Host

A React Native proof of the Native Shell + Host architecture. This is a pnpm/Turbo project within the repository root workspace; each app under `apps/` is its own workspace project.

| Layer        | Responsibility                                                            | Distribution           | Native modules            |
| ------------ | ------------------------------------------------------------------------- | ---------------------- | ------------------------- |
| Native Shell | Store binary; loads the Host and owns recovery/reload controls            | App Store / Play Store | May add native modules    |
| Host         | Red UI; composes remotes; owns remote selectors and its own `ZE_PUBLIC_*` | Zephyr                 | Cannot add native modules |
| Remotes      | Blue and green UI components; each owns its own `ZE_PUBLIC_*`             | Zephyr                 | Cannot add native modules |

## Apps and Metro ports

| App                                                     | Role         | Port |
| ------------------------------------------------------- | ------------ | ---: |
| `metro/native-shell/apps/native-shell` (`native_shell`) | Native Shell | 8081 |
| `metro/native-shell/apps/host` (`host`)                 | Host         | 8082 |
| `metro/native-shell/apps/remote-blue` (`remote_blue`)   | Blue remote  | 8083 |
| `metro/native-shell/apps/remote-green` (`remote_green`) | Green remote | 8084 |

## Setup

The workspace uses published `0.0.0-canary.81` versions of `zephyr-metro-plugin`, `zephyr-agent`, `zephyr-edge-contract`, `zephyr-native-internal`, and `zephyr-native-cache`. Local tarballs and a sibling `zephyr-packages` checkout are no longer required.

No `pnpm.overrides` are required: each app pins its direct Module Federation dependencies to `2.9.0` and Zephyr packages to `0.0.0-canary.81`; the canary packages declare matching exact versions for their Zephyr transitive dependencies. pnpm overrides are root-only, so placing them in this project manifest would not apply.

- `pnpm install` from the repository root
- `pnpm pods` from `metro/native-shell` (macOS with CocoaPods/Bundler)

## Local development

Run commands from `metro/native-shell`: `pnpm dev` starts all four Metro servers; run `pnpm ios` for iOS, or `pnpm adbreverse && pnpm android` for Android. Shared formatting runs from the repository root with `pnpm format` or `pnpm format:check`.

## Native modules and shared packages

Only the Native Shell ships in a binary, so only it can link native code. `scripts/lib/federation.cjs` derives every app's Module Federation `shared` config from the shell's `dependencies`:

- The shell provides, eagerly, `react` and each dependency with native code (an Android project or an iOS podspec) that some Host or remote depends on: today `react` and `react-native`. It doesn't share packages only it uses, such as `zephyr-native-cache`: @module-federation/metro 2.9.0 fails remote container initialization (`_targetShared.get is not a function`) when the shell eagerly shares a package no consumer declares.
- The Host and remotes take the provided packages they depend on from the shell (`import: false`), at the shell's version.
- A Host or remote that depends on a native package the shell doesn't provide, or on a different version of one, fails at Metro config load with the list of offending packages. Add the package to `apps/native-shell/package.json` at the same version and rebuild the shell.

This is a build-time check. A bundle published against one shell can still reach an older installed binary, so publish to an environment that only shells with the same native dependencies follow. If a remote's dependency imports a package's internals by deep path (for example `react-native/Libraries/...`), add that path to `DEEP_IMPORTS` in `federation.cjs`.

`patches/@module-federation__metro@2.9.0.patch` (root `pnpm.patchedDependencies`) fixes one upstream bug on this branch:

- A shared module required synchronously before its async load finished got an empty `{}` placeholder for good. It now resolves from the share scope synchronously. This only triggers once a shared package other than `react`/`react-native` is required during startup.

The entry URL rewrite fix that `main` carries is left out to reproduce [module-federation/core#5288](https://github.com/module-federation/core/issues/5288): the rewrite replaces the first occurrence of the entry name anywhere in the URL, so the HMR client's `http://localhost:8082/host.bundle` for the remote named `host` becomes `http://localnode_modules/...` and crashes the Host's Metro.

## Zephyr builds and the demo environment

Set `ZEPHYR_BUILD=1` to enable Zephyr mode; `ZEPHYR_TARGET` selects `ios` or `android` (defaults to iOS). Zephyr builds upload their bundles and require Zephyr login and a git repository with at least one commit (branch and commit come from git).

Each app's Zephyr settings live in its `zephyr.config.cjs`, not in `package.json`:

| App            | `zephyr.config.cjs`                                                                                |
| -------------- | -------------------------------------------------------------------------------------------------- |
| `native_shell` | `org`, `project`; `remoteDependencies` `host@demo-${target}`; `runtimeManifest` `@demo-${target}`  |
| `host`         | `org`, `project`; `remoteDependencies` `remote_blue@demo-${target}`, `remote_green@demo-${target}` |
| `remote_blue`  | `org`, `project`                                                                                   |
| `remote_green` | `org`, `project`                                                                                   |

`org` (`zephyrcloudio`) and `project` (`zephyr-native-examples`) are explicit, so builds don't depend on the git origin naming the GitHub repository. Zephyr replaces `${target}` with the build platform, so an iOS build resolves `demo-ios` and an Android build `demo-android`; the selectors are written in plain quotes, not template literals. These selectors apply only to Zephyr builds; plain `pnpm dev` still uses localhost.

Run Metro/Turbo and deployment commands from `metro/native-shell`; the four apps remain separate pnpm workspace projects.

### The demo environments

Every app has two Zephyr environments, `demo-ios` and `demo-android`. An environment holds a single version, so one `demo` shared by both platforms would hand the last-published platform's bundle to the other. Create both environments on `native-shell`, `host`, `remote-blue`, and `remote-green` in the Zephyr dashboard before the first build.

The shell follows its own environment at runtime (`runtimeManifest`): each launch applies the `zephyr-manifest.json` that the previous launch fetched from `native-shell`'s `demo-ios` or `demo-android`, then fetches a fresh copy. To point installed shells at another Host, or to change the shell's `ZE_PUBLIC_*` values, edit that environment in the Zephyr dashboard (remote override for `host`); the change applies on the second launch after it, or after **Reload app**, with no rebuild. The first launch of a new binary uses the build-time `host@demo-${target}`.

To publish the current apps to `demo-ios`, then rebuild and launch the shell:

```bash
ZE_ENV=demo-ios pnpm build:zephyr:ios
ZE_ENV=demo-ios pnpm --filter native_shell ios:zephyr --local
```

The first command publishes blue and green before the Host. `ZE_ENV` selects the deployment environment; the dependency selectors alone do not select where a build is published. Without `ZE_ENV`, assign deployments to the environment separately in Zephyr. For Android, use `demo-android` with `build:zephyr:android` and `android:zephyr`.

A shell build fails while `native-shell` has no version in that platform's environment, because `runtimeManifest` can't resolve. For the first shell build on each platform, remove `runtimeManifest` from `apps/native-shell/zephyr.config.cjs`, publish with `ZE_ENV=demo-ios` (or `demo-android`), then put it back and rebuild.

`--local` forces the shell to build locally instead of reusing an RNEF cached native binary.

## On-screen diagnostics

The shell's **Refresh cache** button calls `ZephyrNativeCache.checkForUpdates()`, matching the sample's **Check Updates** control. It checks cached modules and downloads available updates without clearing the cache or automatically reloading. Progress and results appear below the buttons; use **Reload app** to apply downloaded updates. Both controls are disabled while an update check is running.

The shell's **Reload app** button calls `ZephyrNativeCache.reloadApp()`, matching the native-cache test sample. It reloads the React Native JS context without terminating the native app. It does not clear the cache or explicitly check for updates.

The Host's **Bundle sources** panel (collapsed by default) lists each app's actual Module Federation entry bundle URL from the native runtime (`__FEDERATION__.__NATIVE__[appName].origin`), not a hardcoded port or deployment URL. **Show app boundaries** outlines the Host and each remote card in its app's color and labels it with the app name; the Host passes the setting to the remotes as a `showBoundary` prop.

The tractor drawings are CC0 ([Green tractor.svg](https://commons.wikimedia.org/wiki/File:Green_tractor.svg); the blue one is recolored and mirrored, the Host's red one recolored), embedded in the app that shows them as a PNG data URI (`src/tractorImage.ts`). @module-federation/metro 2.9.0 resolves a remote's `require`d image against the shell's dev server and doesn't emit assets from `bundle-mf-remote`, so a bundled asset would not load; inline, the image ships and updates with its app.

While the Host bundle downloads, the shell shows a loading screen above its bar. While a remote downloads, the Host shows a placeholder card in the remote's color with the same footprint as the remote's card, and the same card with "unavailable" if the remote fails to load.

The Host and each remote show a pill next to their title with the Zephyr build they were published as (`#5684`, the number in the version URL and the dashboard), or `local` when it isn't a Zephyr publish. Nothing at runtime carries that number, so `patches/zephyr-metro-plugin@0.0.0-canary.81.patch` has the publish command write `node_modules/.zephyr-metro/build-info.json` once Zephyr registers the build, before Metro bundles; `buildInfoResolver` in `scripts/lib/zephyr-build.cjs` maps the `zephyr-build-info` import to that file in Zephyr builds and to an empty module otherwise.

Each app's iOS and Android build scripts set `ZE_PUBLIC_DEMO`:

| App            | Build value               |
| -------------- | ------------------------- |
| `host`         | `host_from_build`         |
| `remote_blue`  | `remote_blue_from_build`  |
| `remote_green` | `remote_green_from_build` |

In Zephyr builds these values are compiled as fallbacks for app-scoped runtime env lookups. Setting `ZE_PUBLIC_DEMO` for one app in Zephyr overrides only that app's value. Plain local dev does not run the Zephyr env transformer and displays `not set (local dev)`.

`ZE_PUBLIC_HOST_TITLE` remains Host-owned and controls the Host title at runtime; its default is “Tractor Host”.
