import React from 'react';
import {Button, SafeAreaView, Text, View} from 'react-native';
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

  return (
    <View style={{flex: 1, backgroundColor: 'white'}}>
      <React.Suspense fallback={null}>
        <Host />
      </React.Suspense>
      <SafeAreaView>
        <View style={{paddingHorizontal: 16, paddingVertical: 8}}>
          <View style={{flexDirection: 'row', justifyContent: 'space-evenly'}}>
            <Button
              title={refreshing ? 'Refreshing cache…' : 'Refresh cache'}
              testID="shell-refresh-cache"
              disabled={refreshing || status.isPolling}
              onPress={refreshCache}
            />
            <Button
              title="Reload app"
              testID="shell-reload-app"
              disabled={refreshing || status.isPolling}
              onPress={() => ZephyrNativeCache.reloadApp()}
            />
          </View>
          {refreshMessage !== null && (
            <Text
              testID="shell-cache-status"
              accessibilityLiveRegion="polite"
              style={{textAlign: 'center', color: '#333'}}>
              {refreshMessage}
            </Text>
          )}
        </View>
      </SafeAreaView>
    </View>
  );
}
