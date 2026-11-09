import React from 'react';
import {SafeAreaView, ScrollView, Text, View} from 'react-native';
import {RemoteSlot} from './RemoteSlot';
const BlueCard = React.lazy(() => import('remote_blue/BlueCard'));
const GreenCard = React.lazy(() => import('remote_green/GreenCard'));
export default function App() {
  // MF Metro records the loaded entry URL here; its runtime types omit native state.
  const federationGlobal = globalThis as typeof globalThis & {
    __FEDERATION__?: {__NATIVE__?: Record<string, {origin?: string}>};
  };
  const sourceUrl = federationGlobal.__FEDERATION__?.__NATIVE__?.host?.origin;
  return (
    <SafeAreaView style={{flex: 1, backgroundColor: 'white'}}>
      <ScrollView>
        <View
          testID="host-frame"
          style={{
            borderWidth: 3,
            borderColor: '#E53935',
            borderRadius: 8,
            margin: 16,
            padding: 16,
          }}>
          <Text style={{color: '#E53935'}}>host</Text>
          <Text style={{fontWeight: 'bold'}}>
            {process.env.ZE_PUBLIC_HOST_TITLE ?? 'Tractor Host'}
          </Text>
          <Text testID="host-source-url" selectable>
            {sourceUrl ?? 'Source URL unavailable'}
          </Text>
          <Text testID="host-demo">
            ZE_PUBLIC_DEMO:{' '}
            {process.env.ZE_PUBLIC_DEMO ?? 'not set (local dev)'}
          </Text>
          <RemoteSlot name="remote_blue">
            <BlueCard />
          </RemoteSlot>
          <RemoteSlot name="remote_green">
            <GreenCard />
          </RemoteSlot>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
