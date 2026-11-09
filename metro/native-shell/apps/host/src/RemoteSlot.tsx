import React from 'react';
import {ActivityIndicator, StyleSheet, Text, View} from 'react-native';
type Props = {name: string; children: React.ReactNode};
type State = {failed: boolean};
class ErrorBoundary extends React.Component<Props, State> {
  state: State = {failed: false};
  static getDerivedStateFromError(): State {
    return {failed: true};
  }
  componentDidCatch(error: Error) {
    console.error('[host] remote failed', this.props.name, error);
  }
  render() {
    if (this.state.failed)
      return (
        <View style={styles.placeholder}>
          <Text testID={`${this.props.name}-unavailable`} style={styles.text}>
            {this.props.name} unavailable
          </Text>
        </View>
      );
    return (
      <React.Suspense
        fallback={
          <View style={styles.placeholder}>
            <ActivityIndicator />
            <Text style={styles.text}>Loading {this.props.name}…</Text>
          </View>
        }>
        {this.props.children}
      </React.Suspense>
    );
  }
}
export function RemoteSlot(props: Props) {
  return <ErrorBoundary {...props} />;
}

const styles = StyleSheet.create({
  placeholder: {
    marginTop: 16,
    minHeight: 120,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    borderRadius: 16,
  },
  text: {marginTop: 8, color: '#5B6B7B'},
});
