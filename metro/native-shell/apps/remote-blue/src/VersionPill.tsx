import React from 'react';
import {StyleSheet, Text} from 'react-native';
import buildInfo from 'zephyr-build-info';

/** The Zephyr build this bundle was published as (`#5684`), or "local" outside a publish. */
export function VersionPill({color}: {color: string}) {
  return (
    <Text
      testID="remote-blue-version"
      style={[styles.pill, {color, borderColor: color}]}>
      {buildInfo.buildId ? `#${buildInfo.buildId}` : 'local'}
    </Text>
  );
}

const styles = StyleSheet.create({
  pill: {
    fontSize: 11,
    fontWeight: '700',
    paddingHorizontal: 7,
    paddingVertical: 1,
    borderWidth: 1,
    borderRadius: 999,
    overflow: 'hidden',
  },
});
