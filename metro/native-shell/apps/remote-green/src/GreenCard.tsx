import React from 'react';
import {Image, StyleSheet, Text, View} from 'react-native';
import {tractorGreen} from './tractorImage';

const ACCENT = '#43A047';

type Props = {showBoundary?: boolean};

export default function GreenCard({showBoundary = false}: Props) {
  return (
    <View
      testID="remote-green-card"
      style={[styles.card, showBoundary && styles.boundary]}>
      {showBoundary && <Text style={styles.boundaryTag}>remote_green</Text>}
      <View style={styles.imageTile}>
        <Image
          source={tractorGreen}
          style={styles.image}
          resizeMode="contain"
          accessibilityLabel="Green tractor drawing"
        />
      </View>
      <View style={styles.body}>
        <Text style={styles.title}>Green tractor</Text>
        <Text style={styles.subtitle}>Served by the green remote</Text>
        <View style={styles.envRow}>
          <Text style={styles.envKey}>ZE_PUBLIC_DEMO</Text>
          <Text testID="remote-green-demo" style={styles.envValue}>
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
    backgroundColor: '#E8F5E9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: 72,
    height: (72 * tractorGreen.height) / tractorGreen.width,
  },
  body: {flex: 1, marginLeft: 12},
  title: {fontSize: 17, fontWeight: '700', color: '#0B1F33'},
  subtitle: {marginTop: 1, fontSize: 13, color: '#5B6B7B'},
  envRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginTop: 8,
    backgroundColor: '#E8F5E9',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  envKey: {fontSize: 11, fontWeight: '700', color: ACCENT, marginRight: 6},
  envValue: {fontSize: 11, color: '#0B1F33'},
});
