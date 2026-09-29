import React, { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FormSchema } from '../types/schema';
import { ThemeColors } from '../styles/theme';
import {
  COOP_VARIANT_SCHEMA,
  DEFAULT_SCHEMA,
} from '../schema/schemaRegistry';
import { Button } from '../components/common/Button';
import { LiveSchemaEditorModal } from '../components/modals/LiveSchemaEditorModal';

interface SchemaManagerScreenProps {
  currentSchema: FormSchema;
  onApplySchema: (schema: FormSchema) => void;
  onResetDefault: () => void;
  onBack: () => void;
  theme: ThemeColors;
}

export const SchemaManagerScreen: React.FC<SchemaManagerScreenProps> = ({
  currentSchema,
  onApplySchema,
  onResetDefault,
  onBack,
  theme,
}) => {
  const [showEditorModal, setShowEditorModal] = useState(false);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={[styles.headerTitle, { color: theme.text }]}>
            Remote Schema Engine
          </Text>
          <Text style={[styles.headerSub, { color: theme.textMuted }]}>
            Dynamic Definition & Live Update Tester
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => setShowEditorModal(true)}
          style={[styles.editJsonBtn, { backgroundColor: theme.primaryLight }]}
        >
          <Ionicons name="code-slash" size={18} color={theme.primary} />
          <Text style={[styles.editJsonText, { color: theme.primary }]}>JSON</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Active Schema Card */}
        <View style={[styles.activeCard, { backgroundColor: theme.surface, borderColor: theme.primary }]}>
          <View style={styles.activeHeader}>
            <View style={[styles.badge, { backgroundColor: theme.primaryLight }]}>
              <Text style={[styles.badgeText, { color: theme.primary }]}>ACTIVE SCHEMA</Text>
            </View>
            <Text style={[styles.versionText, { color: theme.textMuted }]}>
              v{currentSchema.version}
            </Text>
          </View>

          <Text style={[styles.schemaTitle, { color: theme.text }]}>
            {currentSchema.title}
          </Text>
          {currentSchema.subtitle ? (
            <Text style={[styles.schemaSub, { color: theme.textMuted }]}>
              {currentSchema.subtitle}
            </Text>
          ) : null}

          <View style={[styles.metaDivider, { backgroundColor: theme.border }]} />

          <View style={styles.metaRow}>
            <Text style={[styles.metaKey, { color: theme.textMuted }]}>Schema ID:</Text>
            <Text style={[styles.metaVal, { color: theme.text }]}>{currentSchema.id}</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={[styles.metaKey, { color: theme.textMuted }]}>Total Sections:</Text>
            <Text style={[styles.metaVal, { color: theme.text }]}>
              {currentSchema.sections.length} Sections (A, B, C)
            </Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={[styles.metaKey, { color: theme.textMuted }]}>Offline Cache:</Text>
            <Text style={[styles.metaVal, { color: theme.success, fontWeight: '700' }]}>
              Loaded & Verified in Local Storage
            </Text>
          </View>
        </View>

        {/* Live Interview Change Presets */}
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          Live Interview Change Scenarios
        </Text>
        <Text style={[styles.sectionDesc, { color: theme.textMuted }]}>
          Test instant schema modification without rebuilding the app:
        </Text>

        {/* Switch to Palawan Coop Schema */}
        <TouchableOpacity
          style={[styles.presetCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
          onPress={() => {
            onApplySchema(COOP_VARIANT_SCHEMA);
            Alert.alert('Applied', 'Switched to Palawan Electric Cooperative Schema (v2.1).');
          }}
        >
          <View style={styles.presetTop}>
            <Ionicons name="flash-outline" size={22} color={theme.primary} />
            <Text style={[styles.presetName, { color: theme.text }]}>
              Palawan Electric Coop Specification
            </Text>
          </View>
          <Text style={[styles.presetDetails, { color: theme.textMuted }]}>
            Adds Inverter Brand field in Section B and DC Isolator/Surge Protection photo slots in Section C.
          </Text>
        </TouchableOpacity>

        {/* Reset to Default */}
        <TouchableOpacity
          style={[styles.presetCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
          onPress={() => {
            onResetDefault();
            Alert.alert('Restored', 'Restored original Cost Plus, Inc. standard 3-section schema.');
          }}
        >
          <View style={styles.presetTop}>
            <Ionicons name="refresh-circle-outline" size={22} color={theme.warning} />
            <Text style={[styles.presetName, { color: theme.text }]}>
              Standard CPI 3-Section Baseline
            </Text>
          </View>
          <Text style={[styles.presetDetails, { color: theme.textMuted }]}>
            Standard Construction (A), Utility (B), Photos (C) matching test requirements.
          </Text>
        </TouchableOpacity>

        {/* Schema Sections Breakdown */}
        <Text style={[styles.sectionTitle, { color: theme.text, marginTop: 18 }]}>
          Active Schema Structure
        </Text>

        {currentSchema.sections.map((sec) => (
          <View
            key={sec.id}
            style={[styles.sectionStructureCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
          >
            <View style={styles.structureHeader}>
              <View style={[styles.codeTag, { backgroundColor: theme.primary }]}>
                <Text style={styles.codeTagText}>{sec.code}</Text>
              </View>
              <Text style={[styles.structureTitle, { color: theme.text }]}>
                {sec.title}
              </Text>
            </View>

            {sec.fields && (
              <View style={styles.fieldsList}>
                <Text style={[styles.listHeader, { color: theme.textMuted }]}>
                  Fields ({sec.fields.length}):
                </Text>
                {sec.fields.map((f) => (
                  <View key={f.id} style={styles.fieldItem}>
                    <Text style={[styles.fieldName, { color: theme.text }]}>
                      • {f.label}
                    </Text>
                    <Text style={[styles.fieldType, { color: theme.textMuted }]}>
                      [{f.type}] {f.required ? '(Required)' : ''}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {sec.photoGroups && (
              <View style={styles.fieldsList}>
                <Text style={[styles.listHeader, { color: theme.textMuted }]}>
                  Photo Groups ({sec.photoGroups.length}):
                </Text>
                {sec.photoGroups.map((g) => (
                  <View key={g.id} style={styles.fieldItem}>
                    <Text style={[styles.fieldName, { color: theme.text }]}>
                      📷 {g.title}
                    </Text>
                    <Text style={[styles.fieldType, { color: theme.textMuted }]}>
                      {g.dynamicCountField ? `[Dynamic via ${g.dynamicCountField}]` : `[${g.slots?.length || 0} Slots]`}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        ))}

        <Button
          title="Open Full Interactive JSON Editor"
          onPress={() => setShowEditorModal(true)}
          icon="code-working-outline"
          variant="outline"
          theme={theme}
          style={{ marginTop: 16 }}
        />
      </ScrollView>

      {/* Live Editor Modal */}
      <LiveSchemaEditorModal
        visible={showEditorModal}
        currentSchema={currentSchema}
        onApplySchema={onApplySchema}
        onResetDefault={onResetDefault}
        onClose={() => setShowEditorModal(false)}
        theme={theme}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1.5,
    gap: 12,
  },
  backBtn: {
    padding: 6,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  headerSub: {
    fontSize: 12,
    marginTop: 2,
  },
  editJsonBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 4,
  },
  editJsonText: {
    fontSize: 12,
    fontWeight: '800',
  },
  content: {
    padding: 16,
  },
  activeCard: {
    borderRadius: 12,
    borderWidth: 2,
    padding: 16,
    marginBottom: 16,
  },
  activeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  versionText: {
    fontSize: 12,
    fontWeight: '600',
  },
  schemaTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  schemaSub: {
    fontSize: 13,
    marginTop: 2,
  },
  metaDivider: {
    height: 1,
    marginVertical: 12,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3,
  },
  metaKey: {
    fontSize: 13,
  },
  metaVal: {
    fontSize: 13,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginTop: 6,
  },
  sectionDesc: {
    fontSize: 13,
    marginTop: 2,
    marginBottom: 12,
  },
  presetCard: {
    borderRadius: 10,
    borderWidth: 1.5,
    padding: 14,
    marginBottom: 10,
    gap: 6,
  },
  presetTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  presetName: {
    fontSize: 15,
    fontWeight: '700',
  },
  presetDetails: {
    fontSize: 12,
    lineHeight: 16,
  },
  sectionStructureCard: {
    borderRadius: 10,
    borderWidth: 1.5,
    padding: 12,
    marginBottom: 10,
    gap: 8,
  },
  structureHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  codeTag: {
    width: 24,
    height: 24,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  codeTagText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  structureTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  fieldsList: {
    marginTop: 4,
    gap: 4,
  },
  listHeader: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  fieldItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 2,
  },
  fieldName: {
    fontSize: 13,
    fontWeight: '500',
  },
  fieldType: {
    fontSize: 12,
  },
});
