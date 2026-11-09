const path = require('node:path');
const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');
const {withModuleFederation} = require('@module-federation/metro');
const {
  isZephyrBuild,
  zephyrTarget,
  buildInfoResolver,
} = require('../../scripts/lib/zephyr-build.cjs');
const {consumerShared} = require('../../scripts/lib/federation.cjs');
const config = {
  resolver: {
    extraNodeModules: {
      '@babel/runtime': path.resolve(__dirname, 'node_modules/@babel/runtime'),
    },
    useWatchman: false,
    resolveRequest: buildInfoResolver(__dirname),
  },
  watchFolders: [path.resolve(__dirname, '../../../../node_modules')],
};
const mfConfig = {
  name: 'remote_blue',
  filename: 'remote_blue.bundle',
  exposes: {'./BlueCard': './src/BlueCard.tsx'},
  shared: consumerShared(__dirname),
  shareStrategy: 'version-first',
};
const mfFlags = {
  flags: {
    unstable_patchHMRClient: true,
    unstable_patchInitializeCore: true,
    unstable_patchRuntimeRequire: true,
  },
};
async function buildZephyrConfig() {
  const {withZephyr} = require('zephyr-metro-plugin');
  const baseConfig = mergeConfig(getDefaultConfig(__dirname), config);
  const enhanced = await withZephyr({
    name: mfConfig.name,
    target: zephyrTarget(),
  })(baseConfig);
  return withModuleFederation(enhanced, mfConfig, mfFlags);
}
module.exports = isZephyrBuild()
  ? buildZephyrConfig()
  : withModuleFederation(
      mergeConfig(getDefaultConfig(__dirname), config),
      mfConfig,
      mfFlags,
    );
