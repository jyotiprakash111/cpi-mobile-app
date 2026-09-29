import React from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FieldDefinition } from '../../types/schema';
import { ThemeColors } from '../../styles/theme';

interface NumberFieldProps {
  field: FieldDefinition;
  value: any;
  onChange: (val: any) => void;
  error?: string;
  theme: ThemeColors;
}

export const NumberField: React.FC<NumberFieldProps> = ({
  field,
  value,
  onChange,
  error,
  theme,
}) => {
  const currentNum = typeof value === 'number' ? value : value ? parseInt(value, 10) : 0;

  const handleStep = (delta: number) => {
    const next = Math.max(0, currentNum + delta);
    onChange(next === 0 && !value ? '' : next);
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

      {/* Touch-Friendly Stepper + Direct Input */}
      <View style={styles.inputRow}>
        <TouchableOpacity
          style={[
            styles.stepBtn,
            {
              backgroundColor: theme.surfaceAlt,
              borderColor: theme.borderBold,
            },
          ]}
          onPress={() => handleStep(-1)}
          activeOpacity={0.7}
          accessibilityLabel="Decrease number"
        >
          <Ionicons name="remove" size={22} color={theme.text} />
        </TouchableOpacity>

        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: theme.surface,
              borderColor: error ? theme.danger : theme.border,
              borderWidth: error ? 2 : 1.5,
              color: theme.text,
            },
          ]}
          value={value !== undefined && value !== null ? String(value) : ''}
          onChangeText={(text) => {
            // Remove non-numeric characters
            const cleaned = text.replace(/[^0-9]/g, '');
            onChange(cleaned ? parseInt(cleaned, 10) : '');
          }}
          placeholder={field.placeholder || '0'}
          placeholderTextColor={theme.textMuted}
          keyboardType="number-pad"
        />

        <TouchableOpacity
          style={[
            styles.stepBtn,
            {
              backgroundColor: theme.surfaceAlt,
              borderColor: theme.borderBold,
            },
          ]}
          onPress={() => handleStep(1)}
          activeOpacity={0.7}
          accessibilityLabel="Increase number"
        >
          <Ionicons name="add" size={22} color={theme.text} />
        </TouchableOpacity>
      </View>

      {/* Quick Common Solar Array Presets */}
      <View style={styles.quickPanelPresets}>
        <Text style={[styles.quickLabel, { color: theme.textMuted }]}>Common Counts:</Text>
        {[8, 12, 16, 20, 24, 30].map((count) => (
          <TouchableOpacity
            key={count}
            style={[
              styles.presetChip,
              {
                backgroundColor: currentNum === count ? theme.primary : theme.surfaceAlt,
                borderColor: currentNum === count ? theme.primaryDark : theme.border,
              },
            ]}
            onPress={() => onChange(count)}
          >
            <Text
              style={[
                styles.presetChipText,
                { color: currentNum === count ? '#FFFFFF' : theme.text },
              ]}
            >
              {count}
            </Text>
          </TouchableOpacity>
        ))}
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
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  stepBtn: {
    width: 52,
    height: 52, // 48dp+
    borderRadius: 8,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    height: 52,
    borderRadius: 8,
    paddingHorizontal: 14,
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  quickPanelPresets: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
  },
  quickLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  presetChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
  },
  presetChipText: {
    fontSize: 12,
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
  },
});
