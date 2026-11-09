import React from 'react';
import {Pressable, SafeAreaView, StyleSheet, Text, View} from 'react-native';
import ZephyrNativeCache, {useCacheStatus} from 'zephyr-native-cache';
const Host = React.lazy(() => import('host/App'));
export default function NativeShell() {
  const {status} = useCacheStatus();
  const [refreshing, setRefreshing] = React.useState(false);
  const [refreshMessage, setRefreshMessage] = React.useState<string | null>(
    null,
  );
  const refreshInFlight = React.useRef(false);

  async function refreshCache() {
    if (refreshInFlight.current || ZephyrNativeCache.getStatus()?.isPolling)
      return;
    refreshInFlight.current = true;
    setRefreshing(true);
    setRefreshMessage('Checking cached modules for updates…');
    try {
      const result = await ZephyrNativeCache.checkForUpdates();
      setRefreshMessage(
        result.updated > 0
          ? `${result.updated} module update${result.updated === 1 ? '' : 's'} ready. Reload app to apply.`
          : result.checked === 0
            ? 'No cached modules to check.'
            : 'No module update was reported.',
      );
    } catch (error) {
      setRefreshMessage('Unable to refresh cache. Try again.');
      console.error('[native-shell] Failed to refresh cache', error);
    } finally {
      refreshInFlight.current = false;
      setRefreshing(false);
    }
  }

  const busy = refreshing || status.isPolling;
  return (
    <View style={styles.screen}>
      <React.Suspense fallback={null}>
        <Host />
      </React.Suspense>
      <SafeAreaView style={styles.bar}>
        <View style={styles.barContent}>
          <Text style={styles.caption}>NATIVE SHELL</Text>
          <View style={styles.buttons}>
            <ShellButton
              title={refreshing ? 'Refreshing…' : 'Refresh cache'}
              testID="shell-refresh-cache"
              disabled={busy}
              onPress={refreshCache}
            />
            <ShellButton
              title="Reload app"
              testID="shell-reload-app"
              disabled={busy}
              onPress={() => ZephyrNativeCache.reloadApp()}
              primary
            />
          </View>
          {refreshMessage !== null && (
            <Text
              testID="shell-cache-status"
              accessibilityLiveRegion="polite"
              style={styles.status}>
              {refreshMessage}
            </Text>
          )}
        </View>
      </SafeAreaView>
    </View>
  );
}

type ShellButtonProps = {
  title: string;
  testID: string;
  disabled: boolean;
  onPress: () => void;
  primary?: boolean;
};

function ShellButton({
  title,
  testID,
  disabled,
  onPress,
  primary = false,
}: ShellButtonProps) {
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityState={{disabled}}
      disabled={disabled}
      onPress={onPress}
      style={({pressed}) => [
        styles.button,
        primary && styles.buttonPrimary,
        (pressed || disabled) && styles.buttonDimmed,
      ]}>
      <Text style={[styles.buttonText, primary && styles.buttonTextPrimary]}>
        {title}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: {flex: 1, backgroundColor: '#F4F6F8'},
  bar: {backgroundColor: '#0B1F33'},
  barContent: {paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8},
  caption: {
    color: '#8FA3B8',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
    textAlign: 'center',
  },
  buttons: {flexDirection: 'row', marginTop: 10, gap: 12},
  button: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2E4A66',
  },
  buttonPrimary: {backgroundColor: 'white', borderColor: 'white'},
  buttonDimmed: {opacity: 0.6},
  buttonText: {color: 'white', fontSize: 15, fontWeight: '600'},
  buttonTextPrimary: {color: '#0B1F33'},
  status: {marginTop: 8, textAlign: 'center', color: '#C7D3DF', fontSize: 13},
});
