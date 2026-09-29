import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FormSchema, PhotoData } from '../../types/schema';
import { ThemeColors } from '../../styles/theme';
import { resolveActivePhotoSlots } from '../../engine/validation';
import { PhotoSlotCard } from './PhotoSlotCard';

interface PhotoGroupSectionProps {
  schema: FormSchema;
  formData: Record<string, any>;
  photos: Record<string, PhotoData>;
  onOpenCaptureOptions?: (slotId: string, groupId: string, label: string, description?: string) => void;
  onLaunchCameraSlot?: (slotId: string, groupId: string, label: string) => void;
  onLaunchGallerySlot?: (slotId: string, groupId: string, label: string) => void;
  onCaptureSlot: (slotId: string, groupId: string, label: string) => void;
  onPickCameraSlot?: (slotId: string, groupId: string, label: string) => void;
  onViewPhoto: (photo: PhotoData) => void;
  onRemovePhoto: (slotId: string) => void;
  theme: ThemeColors;
}

export const PhotoGroupSection: React.FC<PhotoGroupSectionProps> = ({
  schema,
  formData,
  photos,
  onOpenCaptureOptions,
  onLaunchCameraSlot,
  onLaunchGallerySlot,
  onCaptureSlot,
  onPickCameraSlot,
  onViewPhoto,
  onRemovePhoto,
  theme,
}) => {
  const activeGroups = resolveActivePhotoSlots(schema, formData);

  if (activeGroups.length === 0) {
    return (
      <View style={[styles.emptyBox, { backgroundColor: theme.surfaceAlt, borderColor: theme.border }]}>
        <Ionicons name="camera-outline" size={32} color={theme.textMuted} />
        <Text style={[styles.emptyText, { color: theme.textMuted }]}>
          No photo groups active under current form selections.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {activeGroups.map(({ group, slots }) => {
        const capturedCount = slots.filter(
          (s) => photos[s.id] && (photos[s.id].uri || photos[s.id].isMock)
        ).length;
        const isGroupComplete = capturedCount === slots.length;

        return (
          <View
            key={group.id}
            style={[
              styles.groupCard,
              {
                backgroundColor: theme.surfaceAlt,
                borderColor: isGroupComplete ? theme.success : theme.border,
              },
            ]}
          >
            {/* Group Header */}
            <View style={styles.groupHeader}>
              <View style={{ flex: 1 }}>
                <View style={styles.groupTitleRow}>
                  <Text style={[styles.groupTitle, { color: theme.text }]}>
                    {group.title}
                  </Text>
                  {group.id === 'earthingPhotos' && (
                    <View style={[styles.tagBadge, { backgroundColor: theme.primaryLight }]}>
                      <Text style={[styles.tagBadgeText, { color: theme.primary }]}>
                        DYNAMIC ({slots.length} POINTS)
                      </Text>
                    </View>
                  )}
                </View>
                {group.description ? (
                  <Text style={[styles.groupDesc, { color: theme.textMuted }]}>
                    {group.description}
                  </Text>
                ) : null}
              </View>

              <View
                style={[
                  styles.countBadge,
                  {
                    backgroundColor: isGroupComplete ? theme.successLight : theme.badgeBg,
                    borderColor: isGroupComplete ? theme.success : theme.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.countBadgeText,
                    { color: isGroupComplete ? theme.success : theme.text },
                  ]}
                >
                  {capturedCount}/{slots.length} Photos
                </Text>
              </View>
            </View>

            {/* Slots List */}
            <View style={styles.slotsList}>
              {slots.map((slot) => (
                <PhotoSlotCard
                  key={slot.id}
                  slotId={slot.id}
                  groupId={group.id}
                  label={slot.label}
                  description={slot.description}
                  photoData={photos[slot.id]}
                  onOpenOptions={onOpenCaptureOptions}
                  onLaunchCamera={onLaunchCameraSlot}
                  onLaunchGallery={onLaunchGallerySlot}
                  onCaptureMock={onCaptureSlot}
                  onCapture={onCaptureSlot}
                  onPickCamera={onPickCameraSlot}
                  onViewPhoto={onViewPhoto}
                  onRemovePhoto={onRemovePhoto}
                  theme={theme}
                />
              ))}
            </View>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 16,
    marginBottom: 20,
  },
  groupCard: {
    borderRadius: 12,
    borderWidth: 1.5,
    padding: 14,
  },
  groupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 8,
  },
  groupTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  groupTitle: {
    fontSize: 17,
    fontWeight: '800',
  },
  tagBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  tagBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  groupDesc: {
    fontSize: 12,
    marginTop: 2,
  },
  countBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
  },
  countBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  slotsList: {
    gap: 10,
  },
  emptyBox: {
    padding: 24,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  emptyText: {
    fontSize: 13,
    textAlign: 'center',
  },
});
