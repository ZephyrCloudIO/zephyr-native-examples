import React from 'react';
import {Image, StyleSheet, Text, View} from 'react-native';
import {tractorBlue} from './tractorImage';
import {VersionPill} from './VersionPill';

const ACCENT = '#1E88E5';

type Props = {showBoundary?: boolean};

export default function BlueCard({showBoundary = false}: Props) {
  return (
    <View
      testID="remote-blue-card"
      style={[styles.card, showBoundary && styles.boundary]}>
      {showBoundary && <Text style={styles.boundaryTag}>remote_blue</Text>}
      <View style={styles.imageTile}>
        <Image
          source={tractorBlue}
          style={styles.image}
          resizeMode="contain"
          accessibilityLabel="Blue tractor drawing"
        />
      </View>
      <View style={styles.body}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>Blue tractor</Text>
          <VersionPill color={ACCENT} />
        </View>
        <Text style={styles.subtitle}>Served by the blue remote</Text>
        <View style={styles.envRow}>
          <Text style={styles.envKey}>ZE_PUBLIC_DEMO</Text>
          <Text testID="remote-blue-demo" style={styles.envValue}>
            {process.env.ZE_PUBLIC_DEMO ?? 'not set (local dev)'}
          </Text>
        </View>
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
  boundary: {borderColor: ACCENT, borderStyle: 'dashed'},
  boundaryTag: {
    position: 'absolute',
    top: 6,
    right: 6,
    zIndex: 1,
    backgroundColor: ACCENT,
    color: 'white',
    fontSize: 10,
    fontWeight: '700',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 999,
    overflow: 'hidden',
  },
  imageTile: {
    width: 88,
    height: 72,
    borderRadius: 12,
    backgroundColor: '#E3F2FD',
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: 72,
    height: (72 * tractorBlue.height) / tractorBlue.width,
  },
  body: {flex: 1, marginLeft: 12},
  titleRow: {flexDirection: 'row', alignItems: 'center', gap: 8},
  title: {fontSize: 17, fontWeight: '700', color: '#0B1F33'},
  subtitle: {marginTop: 1, fontSize: 13, color: '#5B6B7B'},
  envRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginTop: 8,
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  envKey: {fontSize: 11, fontWeight: '700', color: ACCENT, marginRight: 6},
  envValue: {fontSize: 11, color: '#0B1F33'},
});
