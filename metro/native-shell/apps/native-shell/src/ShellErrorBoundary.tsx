import React from 'react';
import {Button, Text, View} from 'react-native';
import ZephyrNativeCache from 'zephyr-native-cache';
type State = {failed: boolean};
export class ShellErrorBoundary extends React.Component<
  React.PropsWithChildren,
  State
> {
  state: State = {failed: false};
  static getDerivedStateFromError(): State {
    return {failed: true};
  }
  componentDidCatch(error: Error) {
    console.error('[native-shell] Host failed to load', error);
  }
  render() {
    if (this.state.failed)
      return (
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <Text testID="shell-host-error">Could not load the Host</Text>
          <Button title="Retry" onPress={() => ZephyrNativeCache.reloadApp()} />
        </View>
      );
    return this.props.children;
  }
}
