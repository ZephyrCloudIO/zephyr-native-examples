import {pluginMetroModuleFederation} from '@module-federation/metro-plugin-rnef';
import {platformAndroid} from '@rnef/platform-android';
import {platformIOS} from '@rnef/platform-ios';
import {pluginMetro} from '@rnef/plugin-metro';
import {zephyrMetroRNEFPlugin} from 'zephyr-metro-plugin';
import distribution from '../../scripts/lib/zephyr-build.cjs';
const {isZephyrBuild} = distribution;
export default {
  bundler: pluginMetro(),
  platforms: {ios: platformIOS(), android: platformAndroid()},
  remoteCacheProvider: null,
  plugins: [
    isZephyrBuild() ? zephyrMetroRNEFPlugin() : pluginMetroModuleFederation(),
  ],
};
