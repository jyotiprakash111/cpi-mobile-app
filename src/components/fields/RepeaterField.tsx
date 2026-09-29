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

interface RepeaterFieldProps {
  field: FieldDefinition;
  value: any[];
  onChange: (val: any[]) => void;
  count: number;
  fieldErrors: Record<string, string>;
  theme: ThemeColors;
}

export const RepeaterField: React.FC<RepeaterFieldProps> = ({
  field,
  value = [],
  onChange,
  count = 0,
  fieldErrors,
  theme,
}) => {
  const items = Array.isArray(value) ? [...value] : [];

  const handleSubFieldChange = (index: number, subId: string, subVal: string) => {
    const updated = [...items];
    while (updated.length <= index) {
      updated.push({});
    }
    updated[index] = {
      ...updated[index],
      [subId]: subVal,
    };
    onChange(updated);
  };

  const handleQuickMakeFill = (index: number, makeName: string) => {
    handleSubFieldChange(index, 'make', makeName);
  };

  if (count <= 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="layers-outline" size={20} color={theme.primary} />
        <Text style={[styles.headerTitle, { color: theme.text }]}>
          {field.label} ({count} {count === 1 ? 'Unit' : 'Units'} Installed)
        </Text>
      </View>

      <View style={styles.unitsList}>
        {Array.from({ length: count }).map((_, index) => {
          const item = items[index] || {};
          const unitNumber = index + 1;
          const makeError = fieldErrors[`${field.id}_${index}_make`];
          const serialError = fieldErrors[`${field.id}_${index}_serialNo`];
          const hasError = !!makeError || !!serialError;

          return (
            <View
              key={`repeater_unit_${index}`}
              style={[
                styles.unitCard,
                {
                  backgroundColor: theme.surface,
                  borderColor: hasError ? theme.danger : theme.border,
                  borderLeftColor: hasError ? theme.danger : theme.primary,
                },
              ]}
            >
              {/* Unit Card Header */}
              <View style={styles.unitHeader}>
                <View style={[styles.unitBadge, { backgroundColor: theme.primaryLight }]}>
                  <Text style={[styles.unitBadgeText, { color: theme.primary }]}>
                    UNIT #{unitNumber}
                  </Text>
                </View>
                {item.make && item.serialNo ? (
                  <View style={styles.completePill}>
                    <Ionicons name="checkmark-circle" size={14} color={theme.success} />
                    <Text style={[styles.completeText, { color: theme.success }]}>Ready</Text>
                  </View>
                ) : (
                  <Text style={[styles.requiredText, { color: theme.warning }]}>Details required</Text>
                )}
              </View>

              {/* SubField: Make */}
              <View style={styles.subFieldContainer}>
                <Text style={[styles.subFieldLabel, { color: theme.text }]}>
                  Make (Manufacturer) <Text style={{ color: theme.danger }}>*</Text>
                </Text>
                <TextInput
                  style={[
                    styles.subInput,
                    {
                      backgroundColor: theme.surfaceAlt,
                      borderColor: makeError ? theme.danger : theme.border,
                      borderWidth: makeError ? 2 : 1,
                      color: theme.text,
                    },
                  ]}
                  value={item.make || ''}
                  onChangeText={(text) => handleSubFieldChange(index, 'make', text)}
                  placeholder="e.g. Huawei, BYD, Pylontech, Growatt"
                  placeholderTextColor={theme.textMuted}
                />
                {/* Fast Brand Presets */}
                <View style={styles.brandChips}>
                  {['Huawei', 'BYD', 'Pylontech', 'Growatt'].map((brand) => (
                    <TouchableOpacity
                      key={brand}
                      style={[
                        styles.brandChip,
                        {
                          backgroundColor:
                            item.make === brand ? theme.primaryLight : theme.surface,
                          borderColor: item.make === brand ? theme.primary : theme.border,
                        },
                      ]}
                      onPress={() => handleQuickMakeFill(index, brand)}
                    >
                      <Text
                        style={[
                          styles.brandChipText,
                          { color: item.make === brand ? theme.primary : theme.textMuted },
                        ]}
                      >
                        {brand}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                {makeError ? (
                  <Text style={[styles.errorText, { color: theme.danger }]}>{makeError}</Text>
                ) : null}
              </View>

              {/* SubField: Serial No */}
              <View style={styles.subFieldContainer}>
                <Text style={[styles.subFieldLabel, { color: theme.text }]}>
                  Serial No <Text style={{ color: theme.danger }}>*</Text>
                </Text>
                <TextInput
                  style={[
                    styles.subInput,
                    {
                      backgroundColor: theme.surfaceAlt,
                      borderColor: serialError ? theme.danger : theme.border,
                      borderWidth: serialError ? 2 : 1,
                      color: theme.text,
                    },
                  ]}
                  value={item.serialNo || ''}
                  onChangeText={(text) => handleSubFieldChange(index, 'serialNo', text)}
                  placeholder="e.g. SN-89234-PH"
                  placeholderTextColor={theme.textMuted}
                  autoCapitalize="characters"
                />
                {serialError ? (
                  <Text style={[styles.errorText, { color: theme.danger }]}>{serialError}</Text>
                ) : null}
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  unitsList: {
    gap: 12,
  },
  unitCard: {
    borderRadius: 10,
    borderWidth: 1.5,
    borderLeftWidth: 5,
    padding: 14,
  },
  unitHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  unitBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  unitBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  completePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  completeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  requiredText: {
    fontSize: 12,
    fontWeight: '600',
  },
  subFieldContainer: {
    marginBottom: 10,
  },
  subFieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4,
  },
  subInput: {
    height: 48,
    borderRadius: 6,
    paddingHorizontal: 12,
    fontSize: 15,
  },
  brandChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 6,
  },
  brandChip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    borderWidth: 1,
  },
  brandChipText: {
    fontSize: 11,
    fontWeight: '600',
  },
  errorText: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 4,
  },
});
