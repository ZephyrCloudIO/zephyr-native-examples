import {withAsyncStartup} from '@module-federation/metro/bootstrap';
import React from 'react';
import {AppRegistry} from 'react-native';
import ZephyrNativeCache from 'zephyr-native-cache';
import {name as appName} from './app.json';
import {ShellErrorBoundary} from './src/ShellErrorBoundary';

ZephyrNativeCache.register();
const AsyncShell = withAsyncStartup(() => require('./src/NativeShell'))();
function Root() {
  return React.createElement(
    ShellErrorBoundary,
    null,
    React.createElement(AsyncShell),
  );
}
AppRegistry.registerComponent(appName, () => Root);
