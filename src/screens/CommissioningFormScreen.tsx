import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { FormSchema, FormSubmissionRecord, PhotoData } from '../types/schema';
import { ThemeColors } from '../styles/theme';
import {
  computeFormValues,
  evaluateFormEngine,
  initializeFormData,
} from '../engine/formEngine';
import {
  clearActiveDraft,
  loadActiveDraft,
  saveActiveDraft,
  saveSubmissionRecord,
} from '../storage/formStorage';
import { Header } from '../components/common/Header';
import { SectionHeader } from '../components/common/SectionHeader';
import { ValidationBanner } from '../components/common/ValidationBanner';
import { Button } from '../components/common/Button';
import { FieldRenderer } from '../components/fields/FieldRenderer';
import { PhotoGroupSection } from '../components/photos/PhotoGroupSection';
import { PhotoViewerModal } from '../components/modals/PhotoViewerModal';
import { AuditSummaryModal } from '../components/modals/AuditSummaryModal';
import { LiveSchemaEditorModal } from '../components/modals/LiveSchemaEditorModal';
import {
  PhotoCaptureOptionsModal,
  PhotoSlotTarget,
} from '../components/modals/PhotoCaptureOptionsModal';

interface CommissioningFormScreenProps {
  schema: FormSchema;
  onUpdateSchema: (schema: FormSchema) => void;
  onResetSchema: () => void;
  onOpenHistory: () => void;
  theme: ThemeColors;
  isHighContrast: boolean;
  onToggleHighContrast: () => void;
}

export const CommissioningFormScreen: React.FC<CommissioningFormScreenProps> = ({
  schema,
  onUpdateSchema,
  onResetSchema,
  onOpenHistory,
  theme,
  isHighContrast,
  onToggleHighContrast,
}) => {
  const [formData, setFormData] = useState<Record<string, any>>(() => initializeFormData(schema));
  const [photos, setPhotos] = useState<Record<string, PhotoData>>({});
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const [selectedSectionTab, setSelectedSectionTab] = useState<string>('all'); // 'all' or section id
  const [activeViewingPhoto, setActiveViewingPhoto] = useState<PhotoData | null>(null);
  const [activeCaptureTarget, setActiveCaptureTarget] = useState<PhotoSlotTarget | null>(null);
  const [showAuditModal, setShowAuditModal] = useState(false);
  const [showSchemaModal, setShowSchemaModal] = useState(false);
  const [isDraftLoaded, setIsDraftLoaded] = useState(false);

  const scrollViewRef = useRef<ScrollView>(null);
  const saveDebounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 1. Initial Draft Hydration (survives force close / cold start)
  useEffect(() => {
    async function hydrateDraft() {
      try {
        const savedDraft = await loadActiveDraft();
        if (savedDraft && savedDraft.formData) {
          setFormData((prev) => ({
            ...initializeFormData(schema),
            ...savedDraft.formData,
          }));
          if (savedDraft.photos) {
            setPhotos(savedDraft.photos);
          }
          setLastSavedAt(savedDraft.lastSavedAt);
        }
      } catch (err) {
        console.warn('Draft hydration failed:', err);
      } finally {
        setIsDraftLoaded(true);
      }
    }
    hydrateDraft();
  }, [schema.id]);

  // 2. Reactive Form Engine Evaluation
  const engineState = useMemo(() => {
    return evaluateFormEngine(schema, formData, photos);
  }, [schema, formData, photos]);

  // 3. Continuous Autosave (Debounced to local storage)
  useEffect(() => {
    if (!isDraftLoaded) return;

    if (saveDebounceTimer.current) {
      clearTimeout(saveDebounceTimer.current);
    }

    saveDebounceTimer.current = setTimeout(async () => {
      try {
        // We only save if no broken validation rules or save partial draft
        await saveActiveDraft(schema, formData, photos);
        setLastSavedAt(new Date().toISOString());
      } catch (err) {
        console.warn('Auto-save error:', err);
      }
    }, 400);

    return () => {
      if (saveDebounceTimer.current) clearTimeout(saveDebounceTimer.current);
    };
  }, [formData, photos, isDraftLoaded, schema]);

  // Handle Field Value Change
  const handleFieldChange = (fieldId: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [fieldId]: value,
    }));
  };

  // Open Capture Options Sheet / Modal (Camera, Gallery, Simulation)
  const handleOpenCaptureOptions = (
    slotId: string,
    groupId: string,
    label: string,
    description?: string
  ) => {
    setActiveCaptureTarget({ slotId, groupId, label, description });
  };

  // Handle Photo Capture (Simulated 1-tap quick capture for rapid logging / audit stamp)
  const handleCapturePhoto = (slotId: string, groupId: string, label: string) => {
    const photoItem: PhotoData = {
      slotId,
      groupId,
      label,
      capturedAt: new Date().toISOString(),
      isMock: true,
    };
    setPhotos((prev) => ({
      ...prev,
      [slotId]: photoItem,
    }));
  };

  // Handle Real Device Camera (Click a photo with camera)
  const handleLaunchCamera = async (slotId: string, groupId: string, label: string) => {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          'Camera Permission Required',
          'Please enable camera permissions in your device settings to take inspection photos.',
          [{ text: 'OK' }]
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.7,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const photoItem: PhotoData = {
          slotId,
          groupId,
          label,
          capturedAt: new Date().toISOString(),
          uri: asset.uri,
          isMock: false,
        };
        setPhotos((prev) => ({
          ...prev,
          [slotId]: photoItem,
        }));
      }
    } catch (e) {
      console.warn('Camera launch exception, falling back to simulated capture:', e);
      handleCapturePhoto(slotId, groupId, label);
    }
  };

  // Handle Device Gallery Picker (Choose existing photo from photo library)
  const handleLaunchGallery = async (slotId: string, groupId: string, label: string) => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          'Gallery Permission Required',
          'Please enable photo library access in your device settings to choose photos.',
          [{ text: 'OK' }]
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.7,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const photoItem: PhotoData = {
          slotId,
          groupId,
          label,
          capturedAt: new Date().toISOString(),
          uri: asset.uri,
          isMock: false,
        };
        setPhotos((prev) => ({
          ...prev,
          [slotId]: photoItem,
        }));
      }
    } catch (e) {
      console.warn('Gallery launch exception, falling back to simulated capture:', e);
      handleCapturePhoto(slotId, groupId, label);
    }
  };

  const handleRemovePhoto = (slotId: string) => {
    setPhotos((prev) => {
      const copy = { ...prev };
      delete copy[slotId];
      return copy;
    });
  };

  // Pre-fill Valid Sample Data (for instant testing during live interview)
  const handleFillSampleData = () => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const threeDaysAgo = new Date(today);
    threeDaysAgo.setDate(today.getDate() - 3);

    const fmt = (d: Date) => d.toISOString().split('T')[0];

    const sampleFormData: Record<string, any> = {
      contractorMobilisedDate: fmt(threeDaysAgo),
      solarFoundationStartDate: fmt(yesterday),
      solarFoundationEndDate: fmt(today),
      earthingWorks: 'Yes',
      typeOfEarthing: 'Chemical',
      earthingNos: 2,
      ess: 'Yes',
      noOfEssInstalled: 2,
      essUnits: [
        { make: 'Huawei LUNA2000', serialNo: 'SN-HW-78234-PH' },
        { make: 'Huawei LUNA2000', serialNo: 'SN-HW-78235-PH' },
      ],
      panelCapacity: 580,
      numberOfSolarPanels: 20,
    };

    // Pre-fill all photos
    const samplePhotos: Record<string, PhotoData> = {
      foundationPhotos_excavation: {
        slotId: 'foundationPhotos_excavation',
        groupId: 'foundationPhotos',
        label: 'Excavation',
        capturedAt: new Date().toISOString(),
        isMock: true,
      },
      foundationPhotos_steel_binding: {
        slotId: 'foundationPhotos_steel_binding',
        groupId: 'foundationPhotos',
        label: 'Steel Binding',
        capturedAt: new Date().toISOString(),
        isMock: true,
      },
      foundationPhotos_raft_column: {
        slotId: 'foundationPhotos_raft_column',
        groupId: 'foundationPhotos',
        label: 'Raft / Column',
        capturedAt: new Date().toISOString(),
        isMock: true,
      },
      foundationPhotos_bolts_pedestal: {
        slotId: 'foundationPhotos_bolts_pedestal',
        groupId: 'foundationPhotos',
        label: 'Bolts / Pedestal',
        capturedAt: new Date().toISOString(),
        isMock: true,
      },
      structurePhotos_front: {
        slotId: 'structurePhotos_front',
        groupId: 'structurePhotos',
        label: 'Front',
        capturedAt: new Date().toISOString(),
        isMock: true,
      },
      structurePhotos_side: {
        slotId: 'structurePhotos_side',
        groupId: 'structurePhotos',
        label: 'Side',
        capturedAt: new Date().toISOString(),
        isMock: true,
      },
      earthingPhotos_ep1: {
        slotId: 'earthingPhotos_ep1',
        groupId: 'earthingPhotos',
        label: 'EP1',
        capturedAt: new Date().toISOString(),
        isMock: true,
      },
      earthingPhotos_ep2: {
        slotId: 'earthingPhotos_ep2',
        groupId: 'earthingPhotos',
        label: 'EP2',
        capturedAt: new Date().toISOString(),
        isMock: true,
      },
    };

    setFormData(sampleFormData);
    setPhotos(samplePhotos);
    Alert.alert('Sample Data Loaded', 'Valid commissioning dataset and audit photos pre-filled.');
  };

  // Reset Form Action
  const handleResetForm = () => {
    Alert.alert(
      'Reset Form',
      'Are you sure you want to clear all inputs and photos? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset All',
          style: 'destructive',
          onPress: async () => {
            setFormData(initializeFormData(schema));
            setPhotos({});
            await clearActiveDraft();
            setLastSavedAt(null);
          },
        },
      ]
    );
  };

  // Finalize Submission
  const handleConfirmFinalize = async () => {
    try {
      const record: FormSubmissionRecord = {
        id: `SUB-${Date.now()}`,
        schemaId: schema.id,
        schemaVersion: schema.version,
        status: 'completed',
        createdAt: lastSavedAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
        formData,
        photos,
        computedValues: engineState.computedValues,
        summary: {
          contractorMobilisedDate: formData.contractorMobilisedDate,
          solarPvCapacity: `${engineState.computedValues.solarPvCapacity || '0'} kWp`,
          totalPhotosRequired: engineState.totalRequiredPhotos,
          totalPhotosCaptured: engineState.totalCapturedPhotos,
          earthingWorks: formData.earthingWorks || 'No',
          essInstalled: formData.ess === 'Yes' ? `${formData.noOfEssInstalled} Units` : 'No',
        },
      };

      await saveSubmissionRecord(record);
      await clearActiveDraft();
      setShowAuditModal(false);

      Alert.alert(
        'Commissioning Report Submitted!',
        `Report ${record.id} saved to offline audit history.\nPV Capacity: ${record.summary.solarPvCapacity}\nPhotos: ${record.summary.totalPhotosCaptured}/${record.summary.totalPhotosRequired} Verified.`,
        [
          { text: 'View Submissions History', onPress: onOpenHistory },
          { text: 'Start Next Site Form', onPress: () => {
            setFormData(initializeFormData(schema));
            setPhotos({});
            setLastSavedAt(null);
          }},
        ]
      );
    } catch (e: any) {
      Alert.alert('Submission Error', e.message);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* App Header */}
      <Header
        title={schema.title}
        subtitle={schema.subtitle}
        theme={theme}
        isHighContrast={isHighContrast}
        onToggleHighContrast={onToggleHighContrast}
        lastSavedAt={lastSavedAt}
        onOpenHistory={onOpenHistory}
        onOpenSchemaManager={() => setShowSchemaModal(true)}
      />

      {/* Section Filter & Fast Presets Bar */}
      <View style={[styles.sectionTabsBar, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsScroll}>
          <TouchableOpacity
            style={[
              styles.sectionTab,
              selectedSectionTab === 'all' && {
                backgroundColor: theme.primary,
                borderColor: theme.primaryDark,
              },
              { borderColor: theme.border },
            ]}
            onPress={() => setSelectedSectionTab('all')}
          >
            <Text
              style={[
                styles.sectionTabText,
                { color: selectedSectionTab === 'all' ? '#FFFFFF' : theme.text },
              ]}
            >
              All Sections
            </Text>
          </TouchableOpacity>

          {schema.sections.map((sec) => {
            const prog = engineState.sectionProgress[sec.id];
            const isSelected = selectedSectionTab === sec.id;
            return (
              <TouchableOpacity
                key={sec.id}
                style={[
                  styles.sectionTab,
                  isSelected && {
                    backgroundColor: theme.primary,
                    borderColor: theme.primaryDark,
                  },
                  { borderColor: theme.border },
                ]}
                onPress={() => setSelectedSectionTab(sec.id)}
              >
                <View
                  style={[
                    styles.miniCodeBadge,
                    {
                      backgroundColor: prog?.isComplete ? theme.success : isSelected ? '#FFFFFF' : theme.badgeBg,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.miniCodeText,
                      { color: prog?.isComplete ? '#FFFFFF' : isSelected ? theme.primary : theme.text },
                    ]}
                  >
                    {sec.code}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.sectionTabText,
                    { color: isSelected ? '#FFFFFF' : theme.text },
                  ]}
                >
                  {sec.title}
                </Text>
                {prog?.isComplete && (
                  <Ionicons
                    name="checkmark-circle"
                    size={14}
                    color={isSelected ? '#FFFFFF' : theme.success}
                  />
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Main Form Scrollable Content */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Real-time Validation Summary Banner */}
        <ValidationBanner
          brokenRules={engineState.brokenRules}
          missingPhotoSlots={engineState.missingPhotoSlots}
          missingFields={engineState.errorList}
          theme={theme}
        />

        {/* Render Form Sections */}
        {schema.sections.map((section) => {
          if (selectedSectionTab !== 'all' && selectedSectionTab !== section.id) {
            return null;
          }

          const prog = engineState.sectionProgress[section.id] || {
            total: 0,
            completed: 0,
            percent: 0,
            isComplete: false,
          };

          return (
            <View
              key={section.id}
              style={[
                styles.sectionCard,
                {
                  backgroundColor: theme.surface,
                  borderColor: theme.border,
                },
              ]}
            >
              {/* Section Header with completion status */}
              <SectionHeader
                code={section.code}
                title={section.title}
                description={section.description}
                isComplete={prog.isComplete}
                completedItems={prog.completed}
                totalItems={prog.total}
                percent={prog.percent}
                theme={theme}
              />

              {/* Render Section Fields */}
              {section.fields && section.fields.length > 0 && (
                <View style={styles.fieldsContainer}>
                  {section.fields.map((field) => (
                    <FieldRenderer
                      key={field.id}
                      field={field}
                      formData={formData}
                      computedValues={engineState.computedValues}
                      fieldErrors={engineState.fieldErrors}
                      onFieldChange={handleFieldChange}
                      theme={theme}
                    />
                  ))}
                </View>
              )}

              {/* Render Section Photos (Section C) */}
              {section.photoGroups && section.photoGroups.length > 0 && (
                <PhotoGroupSection
                  schema={schema}
                  formData={formData}
                  photos={photos}
                  onOpenCaptureOptions={handleOpenCaptureOptions}
                  onLaunchCameraSlot={handleLaunchCamera}
                  onLaunchGallerySlot={handleLaunchGallery}
                  onCaptureSlot={handleCapturePhoto}
                  onViewPhoto={setActiveViewingPhoto}
                  onRemovePhoto={handleRemovePhoto}
                  theme={theme}
                />
              )}
            </View>
          );
        })}

        {/* Developer / Interview Quick Action Bar */}
        <View style={[styles.devBar, { backgroundColor: theme.surfaceAlt, borderColor: theme.border }]}>
          <Text style={[styles.devBarLabel, { color: theme.textMuted }]}>
            Interview & Test Helpers:
          </Text>
          <View style={styles.devBarButtons}>
            <TouchableOpacity
              style={[styles.devBtn, { backgroundColor: theme.surface, borderColor: theme.primary }]}
              onPress={handleFillSampleData}
            >
              <Ionicons name="sparkles" size={16} color={theme.primary} />
              <Text style={[styles.devBtnText, { color: theme.primary }]}>
                Pre-Fill Valid Data
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.devBtn, { backgroundColor: theme.surface, borderColor: theme.danger }]}
              onPress={handleResetForm}
            >
              <Ionicons name="trash-outline" size={16} color={theme.danger} />
              <Text style={[styles.devBtnText, { color: theme.danger }]}>
                Clear Form
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Sticky Bottom Action Bar */}
      <View style={[styles.bottomBar, { backgroundColor: theme.surface, borderTopColor: theme.border }]}>
        <View style={styles.summaryStatusText}>
          <Text style={[styles.statusMain, { color: theme.text }]}>
            Capacity:{' '}
            <Text style={{ fontWeight: '800', color: theme.primaryDark }}>
              {engineState.computedValues.solarPvCapacity !== null
                ? `${engineState.computedValues.solarPvCapacity.toFixed(2)} kWp`
                : '0.00 kWp'}
            </Text>
          </Text>
          <Text style={[styles.statusSub, { color: theme.textMuted }]}>
            Photos: {engineState.totalCapturedPhotos}/{engineState.totalRequiredPhotos} captured
          </Text>
        </View>

        <View style={styles.bottomButtons}>
          <Button
            title="Mark Complete"
            icon="checkmark-done"
            variant="success"
            size="md"
            onPress={() => {
              if (engineState.brokenRules.length > 0) {
                Alert.alert(
                  'Cannot Submit: Broken Rules',
                  `${engineState.brokenRules[0].label}: ${engineState.brokenRules[0].message}`
                );
                return;
              }
              if (engineState.missingPhotoSlots.length > 0) {
                Alert.alert(
                  'Cannot Submit: Missing Photos',
                  `Please capture the remaining ${engineState.missingPhotoSlots.length} required photo slot(s) in Section C.`
                );
                return;
              }
              if (engineState.errorList.length > 0) {
                Alert.alert(
                  'Cannot Submit: Unfilled Fields',
                  `Please fill ${engineState.errorList[0].label}.`
                );
                return;
              }
              setShowAuditModal(true);
            }}
            disabled={!engineState.canSubmitComplete}
            theme={theme}
            style={{ flex: 1 }}
          />
        </View>
      </View>

      {/* Fullscreen Photo Viewer Modal */}
      <PhotoViewerModal
        photo={activeViewingPhoto}
        onClose={() => setActiveViewingPhoto(null)}
        onDelete={handleRemovePhoto}
        theme={theme}
      />

      {/* Photo Capture Options Modal (Camera vs Gallery vs Simulation) */}
      <PhotoCaptureOptionsModal
        visible={!!activeCaptureTarget}
        target={activeCaptureTarget}
        onClose={() => setActiveCaptureTarget(null)}
        onSelectCamera={handleLaunchCamera}
        onSelectGallery={handleLaunchGallery}
        onSelectMock={handleCapturePhoto}
        theme={theme}
      />

      {/* Audit Review & Finalization Modal */}
      <AuditSummaryModal
        visible={showAuditModal}
        schema={schema}
        formData={formData}
        photos={photos}
        computedValues={engineState.computedValues}
        onClose={() => setShowAuditModal(false)}
        onConfirmComplete={handleConfirmFinalize}
        theme={theme}
      />

      {/* Live Schema & Remote Update Editor Modal */}
      <LiveSchemaEditorModal
        visible={showSchemaModal}
        currentSchema={schema}
        onApplySchema={onUpdateSchema}
        onResetDefault={onResetSchema}
        onClose={() => setShowSchemaModal(false)}
        theme={theme}
      />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  sectionTabsBar: {
    borderBottomWidth: 1,
    paddingVertical: 8,
  },
  tabsScroll: {
    paddingHorizontal: 12,
    gap: 8,
  },
  sectionTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1.5,
    gap: 6,
  },
  miniCodeBadge: {
    width: 20,
    height: 20,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  miniCodeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  sectionTabText: {
    fontSize: 13,
    fontWeight: '700',
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    padding: 14,
    paddingBottom: 40,
  },
  sectionCard: {
    borderRadius: 14,
    borderWidth: 1.5,
    padding: 14,
    marginBottom: 16,
  },
  fieldsContainer: {
    marginTop: 4,
  },
  devBar: {
    borderRadius: 10,
    borderWidth: 1,
    padding: 12,
    marginTop: 8,
    marginBottom: 20,
    gap: 8,
  },
  devBarLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  devBarButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  devBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    gap: 6,
  },
  devBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1.5,
    gap: 12,
  },
  summaryStatusText: {
    flex: 1,
  },
  statusMain: {
    fontSize: 14,
    fontWeight: '600',
  },
  statusSub: {
    fontSize: 12,
    marginTop: 2,
  },
  bottomButtons: {
    flex: 1.2,
  },
});
