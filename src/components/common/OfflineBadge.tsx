import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemeColors } from '../../styles/theme';

interface OfflineBadgeProps {
  theme: ThemeColors;
  isAirplaneMode?: boolean;
}

export const OfflineBadge: React.FC<OfflineBadgeProps> = ({
  theme,
  isAirplaneMode = true,
}) => {
  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: theme.successLight,
          borderColor: theme.success,
        },
      ]}
    >
      <Ionicons name="airplane" size={14} color={theme.success} />
      <Text style={[styles.text, { color: theme.success }]}>
        100% Offline Ready
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    gap: 4,
  },
  text: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
