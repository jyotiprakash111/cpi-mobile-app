import React from 'react';
import {
  Modal,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FormSchema, FormSubmissionRecord, PhotoData } from '../../types/schema';
import { ThemeColors } from '../../styles/theme';
import { formatCapacityValue } from '../../engine/computation';

interface AuditSummaryModalProps {
  visible: boolean;
  schema: FormSchema;
  formData: Record<string, any>;
  photos: Record<string, PhotoData>;
  computedValues: Record<string, any>;
  onClose: () => void;
  onConfirmComplete: () => void;
  theme: ThemeColors;
}

export const AuditSummaryModal: React.FC<AuditSummaryModalProps> = ({
  visible,
  schema,
  formData,
  photos,
  computedValues,
  onClose,
  onConfirmComplete,
  theme,
}) => {
  if (!visible) return null;

  const capturedPhotosCount = Object.values(photos).filter(
    (p) => p && (p.uri || p.isMock)
  ).length;

  const handleShareJson = async () => {
    try {
      const exportPayload = {
        schemaId: schema.id,
        schemaVersion: schema.version,
        exportedAt: new Date().toISOString(),
        formData,
        photosMeta: photos,
        computed: computedValues,
      };
      await Share.share({
        title: `CPI_Commissioning_${formData.contractorMobilisedDate || 'Form'}.json`,
        message: JSON.stringify(exportPayload, null, 2),
      });
    } catch (err) {
      console.warn('Share error:', err);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: theme.surface }]}>
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: theme.border }]}>
            <View style={styles.headerTitleRow}>
              <Ionicons name="checkmark-done-circle" size={26} color={theme.success} />
              <View>
                <Text style={[styles.title, { color: theme.text }]}>
                  Commissioning Audit Ready
                </Text>
                <Text style={[styles.subtitle, { color: theme.textMuted }]}>
                  Review summary before finalizing submission
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color={theme.text} />
            </TouchableOpacity>
          </View>

          {/* Scrollable Summary Body */}
          <ScrollView style={styles.body} contentContainerStyle={{ paddingBottom: 20 }}>
            {/* KPI Card */}
            <View style={[styles.kpiCard, { backgroundColor: theme.primaryLight, borderColor: theme.primary }]}>
              <View style={styles.kpiItem}>
                <Text style={[styles.kpiLabel, { color: theme.primaryDark }]}>PV CAPACITY</Text>
                <Text style={[styles.kpiValue, { color: theme.primaryDark }]}>
                  {formatCapacityValue(computedValues.solarPvCapacity, 'kWp')}
                </Text>
              </View>
              <View style={[styles.kpiDivider, { backgroundColor: theme.primary }]} />
              <View style={styles.kpiItem}>
                <Text style={[styles.kpiLabel, { color: theme.primaryDark }]}>PHOTOS</Text>
                <Text style={[styles.kpiValue, { color: theme.primaryDark }]}>
                  {capturedPhotosCount} Captured
                </Text>
              </View>
            </View>

            {/* Section A Summary */}
            <View style={[styles.sectionBlock, { borderColor: theme.border }]}>
              <Text style={[styles.sectionBlockTitle, { color: theme.primary }]}>
                SECTION A — CONSTRUCTION
              </Text>
              <View style={styles.row}>
                <Text style={[styles.rowLabel, { color: theme.textMuted }]}>Mobilised Date:</Text>
                <Text style={[styles.rowVal, { color: theme.text }]}>{formData.contractorMobilisedDate || '—'}</Text>
              </View>
              <View style={styles.row}>
                <Text style={[styles.rowLabel, { color: theme.textMuted }]}>Foundation Start:</Text>
                <Text style={[styles.rowVal, { color: theme.text }]}>{formData.solarFoundationStartDate || '—'}</Text>
              </View>
              <View style={styles.row}>
                <Text style={[styles.rowLabel, { color: theme.textMuted }]}>Foundation End:</Text>
                <Text style={[styles.rowVal, { color: theme.text }]}>{formData.solarFoundationEndDate || '—'}</Text>
              </View>
              <View style={styles.row}>
                <Text style={[styles.rowLabel, { color: theme.textMuted }]}>Earthing Works:</Text>
                <Text style={[styles.rowVal, { color: theme.text }]}>{formData.earthingWorks || 'No'}</Text>
              </View>
              {formData.earthingWorks === 'Yes' && (
                <>
                  <View style={styles.row}>
                    <Text style={[styles.rowLabel, { color: theme.textMuted }]}>Earthing Type:</Text>
                    <Text style={[styles.rowVal, { color: theme.text }]}>{formData.typeOfEarthing}</Text>
                  </View>
                  <View style={styles.row}>
                    <Text style={[styles.rowLabel, { color: theme.textMuted }]}>Earthing Nos:</Text>
                    <Text style={[styles.rowVal, { color: theme.text }]}>{formData.earthingNos} Points (EP1..EP{formData.earthingNos})</Text>
                  </View>
                </>
              )}
            </View>

            {/* Section B Summary */}
            <View style={[styles.sectionBlock, { borderColor: theme.border }]}>
              <Text style={[styles.sectionBlockTitle, { color: theme.primary }]}>
                SECTION B — UTILITY INSTALLATION
              </Text>
              <View style={styles.row}>
                <Text style={[styles.rowLabel, { color: theme.textMuted }]}>ESS Battery Installed:</Text>
                <Text style={[styles.rowVal, { color: theme.text }]}>{formData.ess || 'No'}</Text>
              </View>
              {formData.ess === 'Yes' && (
                <View style={styles.row}>
                  <Text style={[styles.rowLabel, { color: theme.textMuted }]}>ESS Units Count:</Text>
                  <Text style={[styles.rowVal, { color: theme.text }]}>{formData.noOfEssInstalled} Units</Text>
                </View>
              )}
              <View style={styles.row}>
                <Text style={[styles.rowLabel, { color: theme.textMuted }]}>Panel Capacity:</Text>
                <Text style={[styles.rowVal, { color: theme.text }]}>{formData.panelCapacity} Wp</Text>
              </View>
              <View style={styles.row}>
                <Text style={[styles.rowLabel, { color: theme.textMuted }]}>Number of Panels:</Text>
                <Text style={[styles.rowVal, { color: theme.text }]}>{formData.numberOfSolarPanels} Panels</Text>
              </View>
              <View style={styles.row}>
                <Text style={[styles.rowLabel, { color: theme.textMuted }]}>Computed PV Capacity:</Text>
                <Text style={[styles.rowVal, { color: theme.success, fontWeight: '700' }]}>
                  {formatCapacityValue(computedValues.solarPvCapacity, 'kWp')}
                </Text>
              </View>
            </View>

            {/* Section C Summary */}
            <View style={[styles.sectionBlock, { borderColor: theme.border }]}>
              <Text style={[styles.sectionBlockTitle, { color: theme.primary }]}>
                SECTION C — AUDIT PHOTO EVIDENCE
              </Text>
              <View style={styles.photosGrid}>
                {Object.values(photos).map((p) => (
                  <View key={p.slotId} style={[styles.photoPill, { backgroundColor: theme.surfaceAlt }]}>
                    <Ionicons name="checkmark-circle" size={14} color={theme.success} />
                    <Text style={[styles.photoPillText, { color: theme.text }]}>
                      {p.label}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </ScrollView>

          {/* Footer Actions */}
          <View style={[styles.footer, { borderTopColor: theme.border }]}>
            <TouchableOpacity
              style={[styles.shareBtn, { backgroundColor: theme.surfaceAlt, borderColor: theme.border }]}
              onPress={handleShareJson}
            >
              <Ionicons name="share-social-outline" size={18} color={theme.text} />
              <Text style={[styles.shareBtnText, { color: theme.text }]}>Export JSON</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.confirmBtn, { backgroundColor: theme.success }]}
              onPress={onConfirmComplete}
            >
              <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
              <Text style={styles.confirmBtnText}>Finalize & Submit</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  container: {
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    maxHeight: '90%',
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
    fontSize: 17,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 12,
  },
  closeBtn: {
    padding: 4,
  },
  body: {
    padding: 16,
  },
  kpiCard: {
    flexDirection: 'row',
    borderRadius: 10,
    borderWidth: 1.5,
    padding: 14,
    marginBottom: 14,
  },
  kpiItem: {
    flex: 1,
    alignItems: 'center',
  },
  kpiLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  kpiValue: {
    fontSize: 22,
    fontWeight: '800',
    marginTop: 2,
  },
  kpiDivider: {
    width: 1.5,
    height: '100%',
    opacity: 0.3,
  },
  sectionBlock: {
    borderRadius: 8,
    borderWidth: 1,
    padding: 12,
    marginBottom: 12,
    gap: 6,
  },
  sectionBlockTitle: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  rowLabel: {
    fontSize: 13,
  },
  rowVal: {
    fontSize: 13,
    fontWeight: '600',
  },
  photosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  photoPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  photoPillText: {
    fontSize: 12,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    gap: 10,
  },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
    height: 48,
    borderRadius: 8,
    borderWidth: 1,
    gap: 6,
  },
  shareBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
  confirmBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: 8,
    gap: 8,
  },
  confirmBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
