import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemeColors } from '../../styles/theme';
import { OfflineBadge } from './OfflineBadge';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  theme: ThemeColors;
  isHighContrast: boolean;
  onToggleHighContrast: () => void;
  lastSavedAt?: string | null;
  onOpenHistory?: () => void;
  onOpenSchemaManager?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  title = 'Site Commissioning',
  subtitle = 'Cost Plus, Inc. · Field Ops',
  theme,
  isHighContrast,
  onToggleHighContrast,
  lastSavedAt,
  onOpenHistory,
  onOpenSchemaManager,
}) => {
  const formatTime = (isoString?: string | null) => {
    if (!isoString) return 'Not saved yet';
    try {
      const d = new Date(isoString);
      return `Saved ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`;
    } catch {
      return 'Saved';
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
      <View style={styles.topRow}>
        <View style={styles.titleArea}>
          <View style={styles.logoRow}>
            <Ionicons name="sunny" size={20} color={theme.solarGold} />
            <Text style={[styles.brandText, { color: theme.primaryDark }]}>
              CPI FIELD OPS
            </Text>
          </View>
          <Text style={[styles.title, { color: theme.text }]}>
            {title}
          </Text>
        </View>

        <View style={styles.actionsRow}>
          {/* High Contrast Sunlight Toggle */}
          <TouchableOpacity
            onPress={onToggleHighContrast}
            style={[
              styles.iconButton,
              {
                backgroundColor: isHighContrast ? theme.primaryLight : theme.surfaceAlt,
                borderColor: isHighContrast ? theme.primary : theme.border,
              },
            ]}
            accessibilityLabel="Toggle High Contrast Sunlight Mode"
          >
            <Ionicons
              name={isHighContrast ? 'contrast' : 'contrast-outline'}
              size={20}
              color={isHighContrast ? theme.primary : theme.text}
            />
          </TouchableOpacity>

          {/* Schema Remote / Live Manager */}
          {onOpenSchemaManager && (
            <TouchableOpacity
              onPress={onOpenSchemaManager}
              style={[styles.iconButton, { backgroundColor: theme.surfaceAlt, borderColor: theme.border }]}
              accessibilityLabel="Schema & Live Change Inspector"
            >
              <Ionicons name="code-slash-outline" size={20} color={theme.text} />
            </TouchableOpacity>
          )}

          {/* Submissions / History */}
          {onOpenHistory && (
            <TouchableOpacity
              onPress={onOpenHistory}
              style={[styles.iconButton, { backgroundColor: theme.surfaceAlt, borderColor: theme.border }]}
              accessibilityLabel="Submissions History"
            >
              <Ionicons name="file-tray-full-outline" size={20} color={theme.text} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.bottomRow}>
        <OfflineBadge theme={theme} />
        <View style={styles.saveStatus}>
          <Ionicons name="cloud-offline" size={14} color={theme.textMuted} />
          <Text style={[styles.saveText, { color: theme.textMuted }]}>
            {formatTime(lastSavedAt)}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 10,
    borderBottomWidth: 1.5,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleArea: {
    flex: 1,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  brandText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  saveStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  saveText: {
    fontSize: 12,
    fontWeight: '500',
  },
});
