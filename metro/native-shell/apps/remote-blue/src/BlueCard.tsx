import React from 'react';
import {Text, View} from 'react-native';
export default function BlueCard() {
  // MF Metro records the loaded entry URL here; its runtime types omit native state.
  const federationGlobal = globalThis as typeof globalThis & {
    __FEDERATION__?: {__NATIVE__?: Record<string, {origin?: string}>};
  };
  const sourceUrl =
    federationGlobal.__FEDERATION__?.__NATIVE__?.remote_blue?.origin;
  return (
    <View
      testID="remote-blue-card"
      style={{
        borderWidth: 3,
        borderColor: '#1E88E5',
        borderRadius: 8,
        padding: 16,
        marginTop: 16,
      }}>
      <Text style={{color: '#1E88E5', fontWeight: 'bold'}}>Blue remote</Text>
      <Text testID="remote-blue-source-url" selectable>
        {sourceUrl ?? 'Source URL unavailable'}
      </Text>
      <Text testID="remote-blue-demo">
        ZE_PUBLIC_DEMO: {process.env.ZE_PUBLIC_DEMO ?? 'not set (local dev)'}
      </Text>
    </View>
  );
}
