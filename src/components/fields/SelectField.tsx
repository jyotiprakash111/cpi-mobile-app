import React, { useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FieldDefinition, SelectOption } from '../../types/schema';
import { ThemeColors } from '../../styles/theme';

interface SelectFieldProps {
  field: FieldDefinition;
  value: any;
  onChange: (val: any) => void;
  error?: string;
  theme: ThemeColors;
}

export const SelectField: React.FC<SelectFieldProps> = ({
  field,
  value,
  onChange,
  error,
  theme,
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const options: SelectOption[] = field.options || [];

  const selectedOption = options.find((opt) => String(opt.value) === String(value));
  const isChipView = options.length <= 5; // Direct chip view for fast roof taps

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

      {isChipView ? (
        /* Inline Fast Tap Chips */
        <View style={styles.chipsContainer}>
          {options.map((opt) => {
            const isSelected = String(value) === String(opt.value);
            return (
              <TouchableOpacity
                key={String(opt.value)}
                style={[
                  styles.chip,
                  {
                    backgroundColor: isSelected ? theme.primary : theme.surface,
                    borderColor: isSelected ? theme.primaryDark : error ? theme.danger : theme.border,
                  },
                ]}
                onPress={() => onChange(opt.value)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.chipText,
                    {
                      color: isSelected ? '#FFFFFF' : theme.text,
                      fontWeight: isSelected ? '700' : '500',
                    },
                  ]}
                >
                  {opt.label}
                </Text>
                {isSelected && (
                  <Ionicons name="checkmark" size={16} color="#FFFFFF" style={{ marginLeft: 4 }} />
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      ) : (
        /* Dropdown Trigger for longer lists (e.g. ESS 1 to 10) */
        <TouchableOpacity
          style={[
            styles.dropdownTrigger,
            {
              backgroundColor: theme.surface,
              borderColor: error ? theme.danger : selectedOption ? theme.primary : theme.border,
              borderWidth: error ? 2 : 1.5,
            },
          ]}
          onPress={() => setModalVisible(true)}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.dropdownValue,
              {
                color: selectedOption ? theme.text : theme.textMuted,
                fontWeight: selectedOption ? '600' : '400',
              },
            ]}
          >
            {selectedOption ? selectedOption.label : `Select ${field.label}...`}
          </Text>
          <Ionicons name="chevron-down" size={20} color={theme.textMuted} />
        </TouchableOpacity>
      )}

      {error ? (
        <View style={styles.errorRow}>
          <Ionicons name="alert-circle" size={16} color={theme.danger} />
          <Text style={[styles.errorText, { color: theme.danger }]}>{error}</Text>
        </View>
      ) : null}

      {/* Modal for large option sets */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setModalVisible(false)}
        >
          <Pressable
            style={[styles.modalCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>
                {field.label}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={theme.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 350 }}>
              {options.map((opt) => {
                const isSelected = String(value) === String(opt.value);
                return (
                  <TouchableOpacity
                    key={String(opt.value)}
                    style={[
                      styles.modalOptionItem,
                      {
                        backgroundColor: isSelected ? theme.primaryLight : 'transparent',
                        borderBottomColor: theme.border,
                      },
                    ]}
                    onPress={() => {
                      onChange(opt.value);
                      setModalVisible(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.modalOptionText,
                        {
                          color: isSelected ? theme.primary : theme.text,
                          fontWeight: isSelected ? '700' : '500',
                        },
                      ]}
                    >
                      {opt.label}
                    </Text>
                    {isSelected && (
                      <Ionicons name="checkmark-circle" size={20} color={theme.primary} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
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
    marginBottom: 8,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    minHeight: 48, // 48dp touch target
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipText: {
    fontSize: 15,
  },
  dropdownTrigger: {
    height: 52,
    borderRadius: 8,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dropdownValue: {
    fontSize: 15,
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
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    borderWidth: 1.5,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  modalOptionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 52,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderRadius: 8,
    marginVertical: 2,
  },
  modalOptionText: {
    fontSize: 16,
  },
});
