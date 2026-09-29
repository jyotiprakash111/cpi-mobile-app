import React, { useState } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FieldDefinition } from '../../types/schema';
import { ThemeColors } from '../../styles/theme';

interface DatePickerFieldProps {
  field: FieldDefinition;
  value: string;
  onChange: (val: string) => void;
  error?: string;
  theme: ThemeColors;
}

export const DatePickerField: React.FC<DatePickerFieldProps> = ({
  field,
  value,
  onChange,
  error,
  theme,
}) => {
  const [showPickerModal, setShowPickerModal] = useState(false);
  const [manualInput, setManualInput] = useState(value || '');

  const formatDateDisplay = (val: string) => {
    if (!val) return 'Select Date (YYYY-MM-DD)';
    try {
      const parts = val.split('-');
      if (parts.length === 3) {
        const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
        return d.toLocaleDateString(undefined, {
          weekday: 'short',
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        });
      }
      return val;
    } catch {
      return val;
    }
  };

  const getPresetDate = (daysAgo: number) => {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const handleApplyManual = () => {
    if (manualInput.trim()) {
      onChange(manualInput.trim());
    }
    setShowPickerModal(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <Text style={[styles.label, { color: theme.text }]}>
          {field.label} {field.required && <Text style={{ color: theme.danger }}>*</Text>}
        </Text>
      </View>

      {field.helpText && (
        <Text style={[styles.helpText, { color: theme.textMuted }]}>
          {field.helpText}
        </Text>
      )}

      {/* Main Touchable Field */}
      <TouchableOpacity
        style={[
          styles.inputContainer,
          {
            backgroundColor: theme.surface,
            borderColor: error ? theme.danger : value ? theme.primary : theme.border,
            borderWidth: error ? 2 : 1.5,
          },
        ]}
        onPress={() => {
          setManualInput(value || getPresetDate(0));
          setShowPickerModal(true);
        }}
        activeOpacity={0.7}
      >
        <Ionicons
          name="calendar"
          size={20}
          color={error ? theme.danger : value ? theme.primary : theme.textMuted}
        />
        <Text
          style={[
            styles.valueText,
            {
              color: value ? theme.text : theme.textMuted,
              fontWeight: value ? '600' : '400',
            },
          ]}
        >
          {formatDateDisplay(value)}
        </Text>
        {value ? (
          <TouchableOpacity
            onPress={() => onChange('')}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="close-circle" size={18} color={theme.textMuted} />
          </TouchableOpacity>
        ) : (
          <Ionicons name="chevron-down" size={18} color={theme.textMuted} />
        )}
      </TouchableOpacity>

      {/* Fast Roof Preset Chips */}
      <View style={styles.presetsRow}>
        <Text style={[styles.presetLabel, { color: theme.textMuted }]}>Quick Presets:</Text>
        <TouchableOpacity
          style={[styles.presetChip, { backgroundColor: theme.surfaceAlt, borderColor: theme.border }]}
          onPress={() => onChange(getPresetDate(0))}
        >
          <Text style={[styles.presetText, { color: theme.primary }]}>Today</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.presetChip, { backgroundColor: theme.surfaceAlt, borderColor: theme.border }]}
          onPress={() => onChange(getPresetDate(1))}
        >
          <Text style={[styles.presetText, { color: theme.text }]}>Yesterday</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.presetChip, { backgroundColor: theme.surfaceAlt, borderColor: theme.border }]}
          onPress={() => onChange(getPresetDate(3))}
        >
          <Text style={[styles.presetText, { color: theme.text }]}>3d Ago</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.presetChip, { backgroundColor: theme.surfaceAlt, borderColor: theme.border }]}
          onPress={() => onChange(getPresetDate(7))}
        >
          <Text style={[styles.presetText, { color: theme.text }]}>1w Ago</Text>
        </TouchableOpacity>
      </View>

      {/* Error display */}
      {error ? (
        <View style={styles.errorRow}>
          <Ionicons name="alert-circle" size={16} color={theme.danger} />
          <Text style={[styles.errorText, { color: theme.danger }]}>{error}</Text>
        </View>
      ) : null}

      {/* Date Picker Dialog Modal */}
      <Modal visible={showPickerModal} transparent animationType="fade">
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowPickerModal(false)}
        >
          <Pressable
            style={[styles.modalCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.modalHeader}>
              <Ionicons name="calendar-outline" size={24} color={theme.primary} />
              <Text style={[styles.modalTitle, { color: theme.text }]}>
                {field.label}
              </Text>
            </View>

            <Text style={[styles.modalSub, { color: theme.textMuted }]}>
              Enter or select the commissioning milestone date (YYYY-MM-DD):
            </Text>

            <TextInput
              style={[
                styles.modalInput,
                {
                  backgroundColor: theme.surfaceAlt,
                  borderColor: theme.borderBold,
                  color: theme.text,
                },
              ]}
              value={manualInput}
              onChangeText={setManualInput}
              placeholder="2026-09-29"
              placeholderTextColor={theme.textMuted}
              keyboardType="numbers-and-punctuation"
              autoFocus
            />

            <View style={styles.modalPresets}>
              {[
                { label: 'Today (Now)', val: getPresetDate(0) },
                { label: 'Yesterday', val: getPresetDate(1) },
                { label: '3 Days Ago', val: getPresetDate(3) },
                { label: '1 Week Ago', val: getPresetDate(7) },
                { label: '2 Weeks Ago', val: getPresetDate(14) },
              ].map((p) => (
                <TouchableOpacity
                  key={p.label}
                  style={[
                    styles.modalPresetBtn,
                    {
                      backgroundColor:
                        manualInput === p.val ? theme.primaryLight : theme.surfaceAlt,
                      borderColor: manualInput === p.val ? theme.primary : theme.border,
                    },
                  ]}
                  onPress={() => setManualInput(p.val)}
                >
                  <Text
                    style={[
                      styles.modalPresetBtnText,
                      { color: manualInput === p.val ? theme.primary : theme.text },
                    ]}
                  >
                    {p.label} ({p.val})
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalBtnCancel, { borderColor: theme.border }]}
                onPress={() => setShowPickerModal(false)}
              >
                <Text style={{ color: theme.text, fontWeight: '600' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtnConfirm, { backgroundColor: theme.primary }]}
                onPress={handleApplyManual}
              >
                <Text style={{ color: '#FFFFFF', fontWeight: '700' }}>Confirm Date</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  label: {
    fontSize: 15,
    fontWeight: '700',
  },
  helpText: {
    fontSize: 12,
    marginBottom: 6,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52, // 48dp+ touch target
    borderRadius: 8,
    paddingHorizontal: 12,
    gap: 10,
  },
  valueText: {
    flex: 1,
    fontSize: 15,
  },
  presetsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 6,
  },
  presetLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  presetChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
  },
  presetText: {
    fontSize: 11,
    fontWeight: '600',
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
  },
  errorText: {
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 14,
    borderWidth: 1.5,
    padding: 20,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  modalSub: {
    fontSize: 13,
    marginBottom: 14,
  },
  modalInput: {
    height: 50,
    borderRadius: 8,
    borderWidth: 1.5,
    paddingHorizontal: 14,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 14,
  },
  modalPresets: {
    gap: 6,
    marginBottom: 16,
  },
  modalPresetBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
  },
  modalPresetBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  modalBtnCancel: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  modalBtnConfirm: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 8,
  },
});
