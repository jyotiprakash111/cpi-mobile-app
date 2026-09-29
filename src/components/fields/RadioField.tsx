import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FieldDefinition } from '../../types/schema';
import { ThemeColors } from '../../styles/theme';

interface RadioFieldProps {
  field: FieldDefinition;
  value: any;
  onChange: (val: any) => void;
  error?: string;
  theme: ThemeColors;
}

export const RadioField: React.FC<RadioFieldProps> = ({
  field,
  value,
  onChange,
  error,
  theme,
}) => {
  const options = field.options || [
    { label: 'Yes', value: 'Yes' },
    { label: 'No', value: 'No' },
  ];

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

      {/* Large Touch Target Segmented Buttons (48dp+) */}
      <View style={styles.optionsRow}>
        {options.map((opt) => {
          const isSelected = String(value) === String(opt.value);
          return (
            <TouchableOpacity
              key={String(opt.value)}
              style={[
                styles.optionBtn,
                {
                  backgroundColor: isSelected ? theme.primary : theme.surface,
                  borderColor: isSelected ? theme.primaryDark : error ? theme.danger : theme.border,
                },
              ]}
              onPress={() => onChange(opt.value)}
              activeOpacity={0.8}
            >
              <Ionicons
                name={isSelected ? 'radio-button-on' : 'radio-button-off'}
                size={20}
                color={isSelected ? '#FFFFFF' : theme.textMuted}
              />
              <Text
                style={[
                  styles.optionText,
                  {
                    color: isSelected ? '#FFFFFF' : theme.text,
                    fontWeight: isSelected ? '700' : '500',
                  },
                ]}
              >
                {opt.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {error ? (
        <View style={styles.errorRow}>
          <Ionicons name="alert-circle" size={16} color={theme.danger} />
          <Text style={[styles.errorText, { color: theme.danger }]}>{error}</Text>
        </View>
      ) : null}
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
  optionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  optionBtn: {
    flex: 1,
    minHeight: 52, // 48dp+ touch target
    borderRadius: 8,
    borderWidth: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 12,
  },
  optionText: {
    fontSize: 16,
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
});
