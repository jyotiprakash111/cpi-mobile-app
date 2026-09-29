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

interface TextFieldProps {
  field: FieldDefinition;
  value: string;
  onChange: (val: string) => void;
  error?: string;
  theme: ThemeColors;
}

export const TextField: React.FC<TextFieldProps> = ({
  field,
  value,
  onChange,
  error,
  theme,
}) => {
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

      <View
        style={[
          styles.inputContainer,
          {
            backgroundColor: theme.surface,
            borderColor: error ? theme.danger : theme.border,
            borderWidth: error ? 2 : 1.5,
          },
        ]}
      >
        <TextInput
          style={[styles.input, { color: theme.text }]}
          value={value || ''}
          onChangeText={onChange}
          placeholder={field.placeholder || `Enter ${field.label}...`}
          placeholderTextColor={theme.textMuted}
          autoCapitalize="sentences"
        />
        {value ? (
          <TouchableOpacity onPress={() => onChange('')} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons name="close-circle" size={18} color={theme.textMuted} />
          </TouchableOpacity>
        ) : null}
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
    marginBottom: 6,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  input: {
    flex: 1,
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
});
