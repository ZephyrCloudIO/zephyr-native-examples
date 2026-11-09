import React from 'react';
import {Text, View} from 'react-native';
export default function GreenCard() {
  // MF Metro records the loaded entry URL here; its runtime types omit native state.
  const federationGlobal = globalThis as typeof globalThis & {
    __FEDERATION__?: {__NATIVE__?: Record<string, {origin?: string}>};
  };
  const sourceUrl =
    federationGlobal.__FEDERATION__?.__NATIVE__?.remote_green?.origin;
  return (
    <View
      testID="remote-green-card"
      style={{
        borderWidth: 3,
        borderColor: '#43A047',
        borderRadius: 8,
        padding: 16,
        marginTop: 16,
      }}>
      <Text style={{color: '#43A047', fontWeight: 'bold'}}>Green remote</Text>
      <Text testID="remote-green-source-url" selectable>
        {sourceUrl ?? 'Source URL unavailable'}
      </Text>
      <Text testID="remote-green-demo">
        ZE_PUBLIC_DEMO: {process.env.ZE_PUBLIC_DEMO ?? 'not set (local dev)'}
      </Text>
    </View>
  );
}
