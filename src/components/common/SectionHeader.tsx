import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemeColors } from '../../styles/theme';

interface SectionHeaderProps {
  code: string;
  title: string;
  description?: string;
  isComplete: boolean;
  completedItems: number;
  totalItems: number;
  percent: number;
  theme: ThemeColors;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  code,
  title,
  description,
  isComplete,
  completedItems,
  totalItems,
  percent,
  theme,
}) => {
  return (
    <View style={[styles.container, { backgroundColor: theme.surfaceAlt, borderColor: theme.border }]}>
      <View style={styles.topRow}>
        <View style={styles.badgeAndTitle}>
          <View
            style={[
              styles.codeBadge,
              {
                backgroundColor: isComplete ? theme.success : theme.primary,
              },
            ]}
          >
            <Text style={styles.codeText}>{code}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.title, { color: theme.text }]}>
              {title}
            </Text>
            {description ? (
              <Text style={[styles.description, { color: theme.textMuted }]}>
                {description}
              </Text>
            ) : null}
          </View>
        </View>

        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor: isComplete ? theme.successLight : theme.badgeBg,
              borderColor: isComplete ? theme.success : theme.border,
            },
          ]}
        >
          {isComplete ? (
            <View style={styles.statusRow}>
              <Ionicons name="checkmark-circle" size={14} color={theme.success} />
              <Text style={[styles.statusText, { color: theme.success }]}>
                Complete
              </Text>
            </View>
          ) : (
            <Text style={[styles.statusText, { color: theme.textMuted }]}>
              {completedItems}/{totalItems}
            </Text>
          )}
        </View>
      </View>

      {/* Progress Bar */}
      <View style={[styles.progressTrack, { backgroundColor: theme.border }]}>
        <View
          style={[
            styles.progressBar,
            {
              width: `${Math.min(100, Math.max(0, percent))}%`,
              backgroundColor: isComplete ? theme.success : theme.primary,
            },
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 14,
    borderRadius: 10,
    borderWidth: 1.5,
    marginBottom: 14,
    marginTop: 8,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10,
  },
  badgeAndTitle: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    flex: 1,
  },
  codeBadge: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  codeText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
  },
  description: {
    fontSize: 12,
    marginTop: 2,
    lineHeight: 16,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  progressTrack: {
    height: 5,
    borderRadius: 3,
    marginTop: 10,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 3,
  },
});
