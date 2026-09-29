import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ValidationErrorItem } from '../../types/schema';
import { ThemeColors } from '../../styles/theme';

interface ValidationBannerProps {
  brokenRules: ValidationErrorItem[];
  missingPhotoSlots: { slotId: string; groupTitle: string; label: string }[];
  missingFields: ValidationErrorItem[];
  theme: ThemeColors;
  onJumpToField?: (fieldId: string) => void;
}

export const ValidationBanner: React.FC<ValidationBannerProps> = ({
  brokenRules,
  missingPhotoSlots,
  missingFields,
  theme,
  onJumpToField,
}) => {
  const hasBrokenRules = brokenRules.length > 0;
  const hasMissingPhotos = missingPhotoSlots.length > 0;
  const hasMissingFields = missingFields.length > 0;

  if (!hasBrokenRules && !hasMissingPhotos && !hasMissingFields) {
    return (
      <View
        style={[
          styles.container,
          {
            backgroundColor: theme.successLight,
            borderColor: theme.success,
          },
        ]}
      >
        <Ionicons name="checkmark-circle" size={24} color={theme.success} />
        <View style={styles.textContainer}>
          <Text style={[styles.title, { color: theme.success }]}>
            All Rules & Requirements Satisfied
          </Text>
          <Text style={[styles.subtitle, { color: theme.text }]}>
            Form is audit-ready and can be marked complete.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.wrapper}>
      {/* 1. Broken Rules (Blocking Save & Submission) */}
      {hasBrokenRules && (
        <View
          style={[
            styles.container,
            {
              backgroundColor: theme.dangerLight,
              borderColor: theme.danger,
              borderLeftWidth: 6,
            },
          ]}
        >
          <View style={styles.headerRow}>
            <Ionicons name="alert-circle" size={24} color={theme.danger} />
            <Text style={[styles.title, { color: theme.danger, flex: 1 }]}>
              {brokenRules.length} Broken Rule{brokenRules.length > 1 ? 's' : ''} (Save Blocked)
            </Text>
          </View>
          <Text style={[styles.ruleNotice, { color: theme.text }]}>
            Form cannot be saved or submitted while these rules are violated:
          </Text>
          <View style={styles.itemsList}>
            {brokenRules.map((rule, idx) => (
              <TouchableOpacity
                key={`broken_${rule.fieldId}_${idx}`}
                style={[styles.errorItem, { backgroundColor: theme.surface, borderColor: theme.danger }]}
                onPress={() => onJumpToField && onJumpToField(rule.fieldId)}
                activeOpacity={0.7}
              >
                <View style={[styles.sectionBadge, { backgroundColor: theme.danger }]}>
                  <Text style={styles.sectionBadgeText}>Sec {rule.sectionCode}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.fieldLabel, { color: theme.text }]}>
                    {rule.label}
                  </Text>
                  <Text style={[styles.errorMessage, { color: theme.danger }]}>
                    {rule.message}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={theme.textMuted} />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* 2. Outstanding Photos (Blocking Completion) */}
      {hasMissingPhotos && (
        <View
          style={[
            styles.container,
            {
              backgroundColor: theme.warningLight,
              borderColor: theme.warning,
              borderLeftWidth: 6,
              marginTop: hasBrokenRules ? 10 : 0,
            },
          ]}
        >
          <View style={styles.headerRow}>
            <Ionicons name="camera" size={22} color={theme.warning} />
            <Text style={[styles.title, { color: theme.warning, flex: 1 }]}>
              {missingPhotoSlots.length} Outstanding Photo Slot{missingPhotoSlots.length > 1 ? 's' : ''}
            </Text>
          </View>
          <Text style={[styles.ruleNotice, { color: theme.text }]}>
            All required photo evidence slots must be captured to mark complete:
          </Text>
          <View style={styles.itemsList}>
            {missingPhotoSlots.map((slot) => (
              <TouchableOpacity
                key={`photo_${slot.slotId}`}
                style={[styles.errorItem, { backgroundColor: theme.surface, borderColor: theme.warning }]}
                onPress={() => onJumpToField && onJumpToField(slot.slotId)}
                activeOpacity={0.7}
              >
                <View style={[styles.sectionBadge, { backgroundColor: theme.warning }]}>
                  <Text style={styles.sectionBadgeText}>Sec C</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.fieldLabel, { color: theme.text }]}>
                    {slot.groupTitle} · {slot.label}
                  </Text>
                  <Text style={[styles.errorMessage, { color: theme.warning }]}>
                    Photo required for audit compliance
                  </Text>
                </View>
                <Ionicons name="camera-outline" size={18} color={theme.warning} />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* 3. Missing Required Fields (if any) */}
      {!hasBrokenRules && hasMissingFields && (
        <View
          style={[
            styles.container,
            {
              backgroundColor: theme.surfaceAlt,
              borderColor: theme.borderBold,
              borderLeftWidth: 6,
              marginTop: 10,
            },
          ]}
        >
          <View style={styles.headerRow}>
            <Ionicons name="information-circle-outline" size={22} color={theme.textMuted} />
            <Text style={[styles.title, { color: theme.text, flex: 1 }]}>
              {missingFields.length} Unfilled Required Field{missingFields.length > 1 ? 's' : ''}
            </Text>
          </View>
          <View style={styles.itemsList}>
            {missingFields.slice(0, 4).map((f, idx) => (
              <TouchableOpacity
                key={`missing_${f.fieldId}_${idx}`}
                style={[styles.errorItem, { backgroundColor: theme.surface, borderColor: theme.border }]}
                onPress={() => onJumpToField && onJumpToField(f.fieldId)}
              >
                <View style={[styles.sectionBadge, { backgroundColor: theme.secondary }]}>
                  <Text style={styles.sectionBadgeText}>Sec {f.sectionCode}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.fieldLabel, { color: theme.text }]}>
                    {f.label}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={theme.textMuted} />
              </TouchableOpacity>
            ))}
            {missingFields.length > 4 && (
              <Text style={{ fontSize: 12, color: theme.textMuted, marginTop: 4, fontStyle: 'italic' }}>
                + {missingFields.length - 4} more required fields
              </Text>
            )}
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginVertical: 10,
  },
  container: {
    borderRadius: 8,
    borderWidth: 1.5,
    padding: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  textContainer: {
    marginLeft: 8,
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  ruleNotice: {
    fontSize: 13,
    marginBottom: 8,
    fontWeight: '500',
  },
  itemsList: {
    gap: 6,
  },
  errorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 6,
    borderWidth: 1,
    gap: 8,
  },
  sectionBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  sectionBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  errorMessage: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
});
