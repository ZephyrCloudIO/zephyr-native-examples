const path = require('node:path');
const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');
const {withModuleFederation} = require('@module-federation/metro');
const {
  isZephyrBuild,
  zephyrTarget,
} = require('../../scripts/lib/zephyr-build.cjs');
const config = {
  resolver: {
    extraNodeModules: {
      '@babel/runtime': path.resolve(__dirname, 'node_modules/@babel/runtime'),
    },
    useWatchman: false,
  },
  watchFolders: [path.resolve(__dirname, '../../../../node_modules')],
};
const mfConfig = {
  name: 'remote_green',
  filename: 'remote_green.bundle',
  exposes: {'./GreenCard': './src/GreenCard.tsx'},
  shared: {
    react: {
      singleton: true,
      eager: false,
      requiredVersion: '19.1.0',
      version: '19.1.0',
      import: false,
    },
    'react-native': {
      singleton: true,
      eager: false,
      requiredVersion: '0.80.0',
      version: '0.80.0',
      import: false,
    },
  },
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
