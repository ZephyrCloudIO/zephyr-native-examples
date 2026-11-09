import React from 'react';
import {Text} from 'react-native';
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
        <Text testID={`${this.props.name}-unavailable`}>
          {this.props.name} unavailable
        </Text>
      );
    return (
      <React.Suspense fallback={<Text>Loading {this.props.name}…</Text>}>
        {this.props.children}
      </React.Suspense>
    );
  }
}
export function RemoteSlot(props: Props) {
  return <ErrorBoundary {...props} />;
}
