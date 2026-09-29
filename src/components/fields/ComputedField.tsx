import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FieldDefinition } from '../../types/schema';
import { ThemeColors } from '../../styles/theme';
import { formatCapacityValue } from '../../engine/computation';

interface ComputedFieldProps {
  field: FieldDefinition;
  computedValue: number | null;
  formData: Record<string, any>;
  theme: ThemeColors;
}

export const ComputedField: React.FC<ComputedFieldProps> = ({
  field,
  computedValue,
  formData,
  theme,
}) => {
  const panelCapacity = formData.panelCapacity;
  const numPanels = formData.numberOfSolarPanels;
  const isSolarCapacity = field.id === 'solarPvCapacity';

  const formattedValue = formatCapacityValue(computedValue, field.unit || 'kWp');

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.surfaceAlt,
          borderColor: theme.primary,
          borderLeftWidth: 5,
        },
      ]}
    >
      <View style={styles.headerRow}>
        <View style={styles.titleRow}>
          <Ionicons name="calculator" size={18} color={theme.primary} />
          <Text style={[styles.label, { color: theme.text }]}>{field.label}</Text>
        </View>
        <View style={[styles.readOnlyBadge, { backgroundColor: theme.primaryLight }]}>
          <Ionicons name="lock-closed" size={12} color={theme.primary} />
          <Text style={[styles.readOnlyText, { color: theme.primary }]}>READ-ONLY</Text>
        </View>
      </View>

      {/* Large Value Display */}
      <View style={styles.valueRow}>
        <Text style={[styles.computedValue, { color: theme.primaryDark }]}>
          {formattedValue}
        </Text>
      </View>

      {/* Breakdown / Formula Indicator */}
      {isSolarCapacity && (
        <View style={[styles.formulaBox, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Text style={[styles.formulaText, { color: theme.textMuted }]}>
            Calculation: ({panelCapacity || '—'} Wp × {numPanels || '—'} panels) ÷ 1000 ={' '}
            <Text style={{ fontWeight: '700', color: theme.text }}>
              {computedValue !== null ? `${computedValue.toFixed(2)} kWp` : 'Pending inputs'}
            </Text>
          </Text>
        </View>
      )}

      {field.helpText && (
        <Text style={[styles.helpText, { color: theme.textMuted }]}>
          {field.helpText}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 14,
    borderRadius: 10,
    borderWidth: 1.5,
    marginBottom: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  label: {
    fontSize: 15,
    fontWeight: '700',
  },
  readOnlyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
    gap: 4,
  },
  readOnlyText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  valueRow: {
    marginVertical: 4,
  },
  computedValue: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  formulaBox: {
    padding: 8,
    borderRadius: 6,
    borderWidth: 1,
    marginTop: 6,
  },
  formulaText: {
    fontSize: 12,
  },
  helpText: {
    fontSize: 11,
    marginTop: 6,
  },
});
