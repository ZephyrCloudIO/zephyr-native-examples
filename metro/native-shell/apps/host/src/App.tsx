import React from 'react';
import {
  Image,
  LayoutAnimation,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import {RemoteSlot} from './RemoteSlot';
import {tractorRed} from './tractorImage';
import {VersionPill} from './VersionPill';
const BlueCard = React.lazy(() => import('remote_blue/BlueCard'));
const GreenCard = React.lazy(() => import('remote_green/GreenCard'));

const ACCENT = '#E53935';

// MF Metro records each loaded entry URL here; its runtime types omit native state.
function sourceUrlOf(name: string) {
  const federationGlobal = globalThis as typeof globalThis & {
    __FEDERATION__?: {__NATIVE__?: Record<string, {origin?: string}>};
  };
  return federationGlobal.__FEDERATION__?.__NATIVE__?.[name]?.origin;
}

const SOURCES = [
  {name: 'host', color: ACCENT},
  {name: 'remote_blue', color: '#1E88E5'},
  {name: 'remote_green', color: '#43A047'},
];

export default function App() {
  const [showBoundaries, setShowBoundaries] = React.useState(false);
  const [showSources, setShowSources] = React.useState(false);

  function toggleSources() {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setShowSources(open => !open);
  }

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={styles.content}>
        <View
          testID="host-frame"
          style={[styles.frame, showBoundaries && styles.boundary]}>
          {showBoundaries && <Text style={styles.boundaryTag}>host</Text>}
          <View style={styles.titleRow}>
            <Text style={styles.title}>
              {process.env.ZE_PUBLIC_HOST_TITLE ?? 'Tractor Host'}
            </Text>
            <VersionPill color={ACCENT} />
          </View>
          <Text style={styles.subtitle}>
            One store binary, three apps loaded at runtime.
          </Text>

          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>Show app boundaries</Text>
            <Switch
              testID="host-boundaries-toggle"
              value={showBoundaries}
              onValueChange={setShowBoundaries}
              trackColor={{true: ACCENT}}
              thumbColor="white"
            />
          </View>

          <View style={styles.card}>
            <View style={styles.imageTile}>
              <Image
                source={tractorRed}
                style={styles.image}
                resizeMode="contain"
                accessibilityLabel="Red tractor drawing"
              />
            </View>
            <View style={styles.cardBody}>
              <Text style={styles.cardTitle}>Red tractor</Text>
              <Text style={styles.cardSubtitle}>Served by the host</Text>
              <View style={styles.envRow}>
                <Text style={styles.envKey}>ZE_PUBLIC_DEMO</Text>
                <Text testID="host-demo" style={styles.envValue}>
                  {process.env.ZE_PUBLIC_DEMO ?? 'not set (local dev)'}
                </Text>
              </View>
            </View>
          </View>

          <RemoteSlot
            name="remote_blue"
            label="Blue tractor"
            color="#1E88E5"
            tint="#E3F2FD">
            <BlueCard showBoundary={showBoundaries} />
          </RemoteSlot>
          <RemoteSlot
            name="remote_green"
            label="Green tractor"
            color="#43A047"
            tint="#E8F5E9">
            <GreenCard showBoundary={showBoundaries} />
          </RemoteSlot>

          <View style={styles.sources}>
            <Pressable
              testID="host-sources-toggle"
              onPress={toggleSources}
              style={styles.sourcesHeader}
              accessibilityRole="button"
              accessibilityState={{expanded: showSources}}>
              <Text style={styles.sourcesTitle}>Bundle sources</Text>
              <Text style={styles.chevron}>{showSources ? '▾' : '▸'}</Text>
            </Pressable>
            {showSources &&
              SOURCES.map(source => (
                <View key={source.name} style={styles.sourceRow}>
                  <View
                    style={[styles.sourceDot, {backgroundColor: source.color}]}
                  />
                  <View style={styles.sourceText}>
                    <Text style={styles.sourceName}>{source.name}</Text>
                    <Text
                      testID={`${source.name.replace('_', '-')}-source-url`}
                      style={styles.sourceUrl}
                      selectable>
                      {sourceUrlOf(source.name) ?? 'Not loaded'}
                    </Text>
                  </View>
                </View>
              ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {flex: 1, backgroundColor: '#F4F6F8'},
  // SafeAreaView only insets on iOS; on Android, clear the translucent status bar ourselves.
  content: {
    padding: 16,
    paddingTop:
      16 + (Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) : 0),
  },
  frame: {
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'transparent',
    padding: 12,
  },
  // Only the color changes: border width and padding stay reserved, so toggling doesn't shift layout.
  boundary: {borderColor: ACCENT, borderStyle: 'dashed'},
  boundaryTag: {
    position: 'absolute',
    top: -11,
    left: 16,
    zIndex: 1,
    backgroundColor: ACCENT,
    color: 'white',
    fontSize: 11,
    fontWeight: '700',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    overflow: 'hidden',
  },
  titleRow: {flexDirection: 'row', alignItems: 'center', gap: 10},
  title: {fontSize: 28, fontWeight: '800', color: '#0B1F33', flexShrink: 1},
  subtitle: {marginTop: 4, fontSize: 15, color: '#5B6B7B'},
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'transparent',
    marginTop: 16,
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
    backgroundColor: '#FDECEA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {width: 72, height: (72 * tractorRed.height) / tractorRed.width},
  cardBody: {flex: 1, marginLeft: 12},
  cardTitle: {fontSize: 17, fontWeight: '700', color: '#0B1F33'},
  cardSubtitle: {marginTop: 1, fontSize: 13, color: '#5B6B7B'},
  envRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginTop: 8,
    backgroundColor: '#FDECEA',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  envKey: {fontSize: 11, fontWeight: '700', color: ACCENT, marginRight: 6},
  envValue: {fontSize: 11, color: '#0B1F33'},
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  toggleLabel: {fontSize: 15, fontWeight: '600', color: '#0B1F33'},
  sources: {
    marginTop: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
  },
  sourcesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  sourcesTitle: {fontSize: 15, fontWeight: '600', color: '#0B1F33'},
  chevron: {fontSize: 16, color: '#5B6B7B'},
  sourceRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  sourceDot: {width: 10, height: 10, borderRadius: 5, marginTop: 4},
  sourceText: {flex: 1, marginLeft: 10},
  sourceName: {fontSize: 13, fontWeight: '700', color: '#0B1F33'},
  sourceUrl: {marginTop: 2, fontSize: 12, color: '#5B6B7B'},
});
