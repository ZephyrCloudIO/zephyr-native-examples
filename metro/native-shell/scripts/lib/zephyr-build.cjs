'use strict';
const fs = require('node:fs');
const path = require('node:path');

function isZephyrBuild(env = process.env) {
  return env.ZEPHYR_BUILD === '1';
}
function zephyrTarget(env = process.env) {
  return env.ZEPHYR_TARGET === 'android' ? 'android' : 'ios';
}

/**
 * Metro `resolveRequest` for `zephyr-build-info`: the `{applicationUid, buildId}` of the Zephyr
 * build being published, which the patched zephyr-metro-plugin writes to
 * node_modules/.zephyr-metro/build-info.json once the build is registered, before Metro bundles.
 * Outside a Zephyr publish (local dev, plain builds) it's an empty module, which the apps show as
 * "local".
 */
function buildInfoResolver(appDir) {
  const buildInfoPath = path.join(
    appDir,
    'node_modules',
    '.zephyr-metro',
    'build-info.json',
  );
  return (context, moduleName, platform) => {
    if (moduleName !== 'zephyr-build-info')
      return context.resolveRequest(context, moduleName, platform);
    return isZephyrBuild() && fs.existsSync(buildInfoPath)
      ? {type: 'sourceFile', filePath: buildInfoPath}
      : {type: 'empty'};
  };
}

module.exports = {isZephyrBuild, zephyrTarget, buildInfoResolver};
