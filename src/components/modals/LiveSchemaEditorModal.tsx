import React, { useState } from 'react';
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FormSchema } from '../../types/schema';
import { ThemeColors } from '../../styles/theme';
import { COOP_VARIANT_SCHEMA, DEFAULT_SCHEMA, validateSchemaStructure } from '../../schema/schemaRegistry';

interface LiveSchemaEditorModalProps {
  visible: boolean;
  currentSchema: FormSchema;
  onApplySchema: (schema: FormSchema) => void;
  onResetDefault: () => void;
  onClose: () => void;
  theme: ThemeColors;
}

export const LiveSchemaEditorModal: React.FC<LiveSchemaEditorModalProps> = ({
  visible,
  currentSchema,
  onApplySchema,
  onResetDefault,
  onClose,
  theme,
}) => {
  const [jsonText, setJsonText] = useState(JSON.stringify(currentSchema, null, 2));
  const [activeTab, setActiveTab] = useState<'presets' | 'json' | 'help'>('presets');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!visible) return null;

  const handleApplyJson = () => {
    try {
      const parsed = JSON.parse(jsonText);
      const { valid, errors } = validateSchemaStructure(parsed);
      if (!valid) {
        setErrorMessage(errors.join(', '));
        return;
      }
      setErrorMessage(null);
      onApplySchema(parsed);
      Alert.alert('Success', 'Schema updated live! Form re-rendered instantly.');
      onClose();
    } catch (e: any) {
      setErrorMessage(`Invalid JSON syntax: ${e.message}`);
    }
  };

  // Live Quick Changes:
  const applyQuickModification = (type: string) => {
    const clone = JSON.parse(JSON.stringify(currentSchema)) as FormSchema;

    switch (type) {
      case 'add_panel_options': {
        // Add 650Wp and 700Wp options
        const secB = clone.sections.find((s) => s.id === 'section-b');
        const field = secB?.fields?.find((f) => f.id === 'panelCapacity');
        if (field && field.options) {
          if (!field.options.some((o) => Number(o.value) === 650)) {
            field.options.push({ label: '650 Wp (Bifacial)', value: 650 });
            field.options.push({ label: '700 Wp (High Density)', value: 700 });
          }
        }
        break;
      }
      case 'add_inverter_field': {
        // Add Inverter Make in Section B
        const secB = clone.sections.find((s) => s.id === 'section-b');
        if (secB && secB.fields && !secB.fields.some((f) => f.id === 'inverterModel')) {
          secB.fields.splice(secB.fields.length - 1, 0, {
            id: 'inverterModel',
            label: 'Inverter Model / Brand',
            type: 'select',
            required: true,
            helpText: 'Installed hybrid or off-grid power conversion unit',
            options: [
              { label: 'Growatt SPF 5000ES', value: 'Growatt SPF 5000ES' },
              { label: 'Victron MultiPlus-II 48V', value: 'Victron MultiPlus-II 48V' },
              { label: 'Huawei SUN2000', value: 'Huawei SUN2000' },
              { label: 'Deye Hybrid 5kW', value: 'Deye Hybrid 5kW' },
            ],
          });
        }
        break;
      }
      case 'add_photo_requirement': {
        // Add Inverter DC Isolator photo in Section C
        const secC = clone.sections.find((s) => s.id === 'section-c');
        if (secC && secC.photoGroups) {
          if (!secC.photoGroups.some((g) => g.id === 'powerhousePhotos')) {
            secC.photoGroups.push({
              id: 'powerhousePhotos',
              title: 'Powerhouse & Inverter Isolation',
              description: 'Verification photos for DC breaker and lightning arrestor',
              slots: [
                { id: 'dc_isolator', label: 'DC Isolator Breaker', required: true },
                { id: 'surge_device', label: 'Surge Protective Device', required: true },
              ],
            });
          }
        }
        break;
      }
      case 'add_roof_tilt_field': {
        // Add Roof Tilt Angle numeric field in Section A
        const secA = clone.sections.find((s) => s.id === 'section-a');
        if (secA && secA.fields && !secA.fields.some((f) => f.id === 'roofTiltAngle')) {
          secA.fields.push({
            id: 'roofTiltAngle',
            label: 'Roof Tilt Angle (°)',
            type: 'number',
            required: true,
            unit: '°',
            placeholder: 'e.g. 15',
            helpText: 'Measured azimuth & tilt angle of solar array mounting frame',
          });
        }
        break;
      }
    }

    setJsonText(JSON.stringify(clone, null, 2));
    onApplySchema(clone);
    Alert.alert('Live Modification Applied', `Form reconfigured live to match updated requirements.`);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: theme.surface }]}>
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: theme.border }]}>
            <View style={styles.headerTitleRow}>
              <Ionicons name="code-working" size={24} color={theme.primary} />
              <View>
                <Text style={[styles.title, { color: theme.text }]}>
                  Live Schema & Remote Update Tester
                </Text>
                <Text style={[styles.subtitle, { color: theme.textMuted }]}>
                  ID: {currentSchema.id} · v{currentSchema.version}
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color={theme.text} />
            </TouchableOpacity>
          </View>

          {/* Navigation Tabs */}
          <View style={[styles.tabsRow, { borderBottomColor: theme.border }]}>
            <TouchableOpacity
              style={[
                styles.tabBtn,
                activeTab === 'presets' && { borderBottomColor: theme.primary, borderBottomWidth: 3 },
              ]}
              onPress={() => setActiveTab('presets')}
            >
              <Text
                style={[
                  styles.tabText,
                  { color: activeTab === 'presets' ? theme.primary : theme.textMuted },
                ]}
              >
                1-Tap Live Changes
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.tabBtn,
                activeTab === 'json' && { borderBottomColor: theme.primary, borderBottomWidth: 3 },
              ]}
              onPress={() => setActiveTab('json')}
            >
              <Text
                style={[
                  styles.tabText,
                  { color: activeTab === 'json' ? theme.primary : theme.textMuted },
                ]}
              >
                Raw JSON Editor
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.tabBtn,
                activeTab === 'help' && { borderBottomColor: theme.primary, borderBottomWidth: 3 },
              ]}
              onPress={() => setActiveTab('help')}
            >
              <Text
                style={[
                  styles.tabText,
                  { color: activeTab === 'help' ? theme.primary : theme.textMuted },
                ]}
              >
                Architecture Note
              </Text>
            </TouchableOpacity>
          </View>

          {/* Tab 1: 1-Tap Live Change Test Buttons */}
          {activeTab === 'presets' && (
            <ScrollView style={styles.tabContent}>
              <Text style={[styles.sectionHeading, { color: theme.text }]}>
                Simulate Interview Live Change Requests:
              </Text>

              <TouchableOpacity
                style={[styles.presetCard, { backgroundColor: theme.surfaceAlt, borderColor: theme.border }]}
                onPress={() => applyQuickModification('add_panel_options')}
              >
                <Ionicons name="add-circle" size={22} color={theme.primary} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.presetTitle, { color: theme.text }]}>
                    Add 650Wp & 700Wp Panel Options
                  </Text>
                  <Text style={[styles.presetDesc, { color: theme.textMuted }]}>
                    Extends dropdown options & updates kWp calculation formulas instantly
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.presetCard, { backgroundColor: theme.surfaceAlt, borderColor: theme.border }]}
                onPress={() => applyQuickModification('add_inverter_field')}
              >
                <Ionicons name="hardware-chip-outline" size={22} color={theme.primary} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.presetTitle, { color: theme.text }]}>
                    Add Inverter Model Dropdown Field
                  </Text>
                  <Text style={[styles.presetDesc, { color: theme.textMuted }]}>
                    Injects new required field into Section B (Utility Installation)
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.presetCard, { backgroundColor: theme.surfaceAlt, borderColor: theme.border }]}
                onPress={() => applyQuickModification('add_photo_requirement')}
              >
                <Ionicons name="camera-outline" size={22} color={theme.primary} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.presetTitle, { color: theme.text }]}>
                    Add Inverter & DC Isolator Photo Slots
                  </Text>
                  <Text style={[styles.presetDesc, { color: theme.textMuted }]}>
                    Appends new photo evidence group into Section C photo audit
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.presetCard, { backgroundColor: theme.surfaceAlt, borderColor: theme.border }]}
                onPress={() => applyQuickModification('add_roof_tilt_field')}
              >
                <Ionicons name="speedometer-outline" size={22} color={theme.primary} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.presetTitle, { color: theme.text }]}>
                    Add Roof Tilt Angle (°) Field
                  </Text>
                  <Text style={[styles.presetDesc, { color: theme.textMuted }]}>
                    Adds numeric input with unit in Section A (Construction)
                  </Text>
                </View>
              </TouchableOpacity>

              {/* Full Coop Schema Variant */}
              <TouchableOpacity
                style={[styles.presetCard, { backgroundColor: theme.primaryLight, borderColor: theme.primary }]}
                onPress={() => {
                  setJsonText(JSON.stringify(COOP_VARIANT_SCHEMA, null, 2));
                  onApplySchema(COOP_VARIANT_SCHEMA);
                  Alert.alert('Coop Schema Loaded', 'Switched to Palawan Electric Cooperative Specification.');
                  onClose();
                }}
              >
                <Ionicons name="cloud-download-outline" size={22} color={theme.primary} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.presetTitle, { color: theme.primaryDark }]}>
                    Load Full Palawan Coop Specification (v2.1)
                  </Text>
                  <Text style={[styles.presetDesc, { color: theme.primaryDark }]}>
                    Comprehensive variant with inverter specs and extra photo groups
                  </Text>
                </View>
              </TouchableOpacity>

              {/* Reset to Baseline */}
              <TouchableOpacity
                style={[styles.presetCard, { backgroundColor: theme.surfaceAlt, borderColor: theme.warning }]}
                onPress={() => {
                  setJsonText(JSON.stringify(DEFAULT_SCHEMA, null, 2));
                  onResetDefault();
                  Alert.alert('Reset', 'Form restored to standard CPI default schema.');
                  onClose();
                }}
              >
                <Ionicons name="refresh" size={22} color={theme.warning} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.presetTitle, { color: theme.warning }]}>
                    Reset to Default 3-Section Baseline Schema
                  </Text>
                  <Text style={[styles.presetDesc, { color: theme.textMuted }]}>
                    Restores original Sections A, B, C exactly per specification
                  </Text>
                </View>
              </TouchableOpacity>
            </ScrollView>
          )}

          {/* Tab 2: Raw JSON Editor */}
          {activeTab === 'json' && (
            <View style={styles.jsonTabContainer}>
              {errorMessage && (
                <View style={[styles.errorBox, { backgroundColor: theme.dangerLight, borderColor: theme.danger }]}>
                  <Ionicons name="alert-circle" size={18} color={theme.danger} />
                  <Text style={[styles.errorBoxText, { color: theme.danger }]}>{errorMessage}</Text>
                </View>
              )}
              <TextInput
                style={[
                  styles.jsonInput,
                  {
                    backgroundColor: theme.surfaceAlt,
                    color: theme.text,
                    borderColor: theme.borderBold,
                  },
                ]}
                multiline
                value={jsonText}
                onChangeText={setJsonText}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <View style={styles.jsonActions}>
                <TouchableOpacity
                  style={[styles.applyBtn, { backgroundColor: theme.primary }]}
                  onPress={handleApplyJson}
                >
                  <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
                  <Text style={styles.applyBtnText}>Validate & Apply Schema</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Tab 3: Architecture Explanation */}
          {activeTab === 'help' && (
            <ScrollView style={styles.tabContent}>
              <Text style={[styles.docHeading, { color: theme.primary }]}>
                Schema-Driven Architecture & Remote Updating
              </Text>
              <Text style={[styles.docBody, { color: theme.text }]}>
                • <Text style={{ fontWeight: '700' }}>Pure Declarative Schema:</Text> All sections, fields, labels, dropdown values, validation rules, visibility predicates, and required photo groups are defined strictly in JSON.
              </Text>
              <Text style={[styles.docBody, { color: theme.text }]}>
                • <Text style={{ fontWeight: '700' }}>Zero Code Changes for Field Updates:</Text> When electric cooperatives update commissioning requirements (e.g. changing panel wattages from 580Wp to 650Wp or adding inverter models), the app consumes the updated JSON definition without needing a rebuild or app store release.
              </Text>
              <Text style={[styles.docBody, { color: theme.text }]}>
                • <Text style={{ fontWeight: '700' }}>Offline Cold-Start Guarantee:</Text> The active schema is cached locally in AsyncStorage and backed by a bundled default file, guaranteeing 100% functionality in airplane mode with zero network access.
              </Text>
              <Text style={[styles.docBody, { color: theme.text }]}>
                • <Text style={{ fontWeight: '700' }}>Dynamic Reactive Engine:</Text> Calculations (`solarPvCapacity`), dynamic repeater cards (ESS units), and dynamic photo slots (`EP1..EPn`) recompute reactively whenever inputs change.
              </Text>
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  container: {
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    height: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 12,
  },
  closeBtn: {
    padding: 4,
  },
  tabsRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '700',
  },
  tabContent: {
    padding: 16,
  },
  sectionHeading: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 12,
  },
  presetCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 10,
    borderWidth: 1.5,
    marginBottom: 10,
    gap: 12,
  },
  presetTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  presetDesc: {
    fontSize: 12,
    marginTop: 2,
  },
  jsonTabContainer: {
    flex: 1,
    padding: 14,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 6,
    borderWidth: 1,
    marginBottom: 10,
    gap: 8,
  },
  errorBoxText: {
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  jsonInput: {
    flex: 1,
    borderRadius: 8,
    borderWidth: 1.5,
    padding: 12,
    fontFamily: 'monospace',
    fontSize: 12,
    textAlignVertical: 'top',
  },
  jsonActions: {
    marginTop: 10,
  },
  applyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: 8,
    gap: 8,
  },
  applyBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  docHeading: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 12,
  },
  docBody: {
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 12,
  },
});
