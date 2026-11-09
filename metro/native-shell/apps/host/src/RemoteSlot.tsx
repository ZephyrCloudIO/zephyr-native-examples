import React from 'react';
import {ActivityIndicator, StyleSheet, Text, View} from 'react-native';
type Props = {
  name: string;
  /** Card title while the remote isn't rendered, e.g. "Blue tractor". */
  label: string;
  color: string;
  tint: string;
  children: React.ReactNode;
};
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
    const {name, label, color, tint, children} = this.props;
    if (this.state.failed)
      return (
        <PlaceholderCard
          tint={tint}
          title={label}
          icon={<Text style={styles.icon}>!</Text>}
          message={
            <Text testID={`${name}-unavailable`} style={styles.text}>
              {name} unavailable
            </Text>
          }
        />
      );
    return (
      <React.Suspense
        fallback={
          <PlaceholderCard
            tint={tint}
            title={label}
            icon={<ActivityIndicator color={color} />}
            message={
              <Text testID={`${name}-loading`} style={styles.text}>
                Loading {name}…
              </Text>
            }
          />
        }>
        {children}
      </React.Suspense>
    );
  }
}
export function RemoteSlot(props: Props) {
  return <ErrorBoundary {...props} />;
}

// Same footprint as the remotes' cards, so the layout doesn't jump when a remote arrives.
function PlaceholderCard({
  tint,
  title,
  icon,
  message,
}: {
  tint: string;
  title: string;
  icon: React.ReactNode;
  message: React.ReactNode;
}) {
  return (
    <View style={styles.card}>
      <View style={[styles.imageTile, {backgroundColor: tint}]}>{icon}</View>
      <View style={styles.body}>
        <Text style={styles.title}>{title}</Text>
        {message}
        <View style={[styles.bar, {backgroundColor: tint}]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'transparent',
    marginTop: 12,
    padding: 12,
    shadowColor: '#0B1F33',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: {width: 0, height: 4},
    elevation: 2,
  },
  imageTile: {
    width: 88,
    height: 72,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {fontSize: 24, fontWeight: '800', color: '#5B6B7B'},
  body: {flex: 1, marginLeft: 12},
  title: {fontSize: 17, fontWeight: '700', color: '#0B1F33'},
  text: {marginTop: 1, fontSize: 13, color: '#5B6B7B'},
  bar: {marginTop: 8, height: 22, width: '70%', borderRadius: 8},
});
