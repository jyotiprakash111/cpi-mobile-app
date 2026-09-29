import React from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PhotoData } from '../../types/schema';
import { ThemeColors } from '../../styles/theme';

export interface PhotoSlotCardProps {
  slotId: string;
  groupId: string;
  label: string;
  description?: string;
  photoData?: PhotoData;
  onOpenOptions?: (slotId: string, groupId: string, label: string, description?: string) => void;
  onLaunchCamera?: (slotId: string, groupId: string, label: string) => void;
  onLaunchGallery?: (slotId: string, groupId: string, label: string) => void;
  onCaptureMock?: (slotId: string, groupId: string, label: string) => void;
  // Legacy / fallback props
  onCapture?: (slotId: string, groupId: string, label: string) => void;
  onPickCamera?: (slotId: string, groupId: string, label: string) => void;
  onViewPhoto: (photo: PhotoData) => void;
  onRemovePhoto: (slotId: string) => void;
  theme: ThemeColors;
}

export const PhotoSlotCard: React.FC<PhotoSlotCardProps> = ({
  slotId,
  groupId,
  label,
  description,
  photoData,
  onOpenOptions,
  onLaunchCamera,
  onLaunchGallery,
  onCaptureMock,
  onCapture,
  onPickCamera,
  onViewPhoto,
  onRemovePhoto,
  theme,
}) => {
  const isCaptured = !!photoData && (!!photoData.uri || photoData.isMock);

  const handleOpenMenu = () => {
    if (onOpenOptions) {
      onOpenOptions(slotId, groupId, label, description);
    } else if (onCapture) {
      onCapture(slotId, groupId, label);
    }
  };

  const handleCamera = () => {
    if (onLaunchCamera) {
      onLaunchCamera(slotId, groupId, label);
    } else if (onOpenOptions) {
      onOpenOptions(slotId, groupId, label, description);
    } else if (onPickCamera) {
      onPickCamera(slotId, groupId, label);
    }
  };

  const handleGallery = () => {
    if (onLaunchGallery) {
      onLaunchGallery(slotId, groupId, label);
    } else if (onPickCamera) {
      onPickCamera(slotId, groupId, label);
    } else if (onOpenOptions) {
      onOpenOptions(slotId, groupId, label, description);
    }
  };

  const handleMock = () => {
    if (onCaptureMock) {
      onCaptureMock(slotId, groupId, label);
    } else if (onCapture) {
      onCapture(slotId, groupId, label);
    }
  };

  const formatCapturedTime = (isoString?: string) => {
    if (!isoString) return '';
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } catch {
      return '';
    }
  };

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.surface,
          borderColor: isCaptured ? theme.success : theme.warning,
          borderWidth: isCaptured ? 1.5 : 2,
        },
      ]}
    >
      <View style={styles.cardHeader}>
        <View style={styles.labelContainer}>
          <Text style={[styles.label, { color: theme.text }]}>{label}</Text>
          {description ? (
            <Text style={[styles.description, { color: theme.textMuted }]}>
              {description}
            </Text>
          ) : null}
        </View>

        {/* Status Badge */}
        <View
          style={[
            styles.badge,
            {
              backgroundColor: isCaptured ? theme.successLight : theme.warningLight,
              borderColor: isCaptured ? theme.success : theme.warning,
            },
          ]}
        >
          <Ionicons
            name={isCaptured ? 'checkmark-circle' : 'alert-circle'}
            size={14}
            color={isCaptured ? theme.success : theme.warning}
          />
          <Text
            style={[
              styles.badgeText,
              { color: isCaptured ? theme.success : theme.warning },
            ]}
          >
            {isCaptured ? 'CAPTURED' : 'OUTSTANDING'}
          </Text>
        </View>
      </View>

      {/* Main Interaction Area */}
      {isCaptured ? (
        <View style={styles.capturedArea}>
          {/* Thumbnail / Mock Preview */}
          <TouchableOpacity
            style={[styles.thumbnailBox, { backgroundColor: theme.surfaceAlt, borderColor: theme.border }]}
            onPress={() => photoData && onViewPhoto(photoData)}
            activeOpacity={0.8}
          >
            {photoData?.uri ? (
              <Image source={{ uri: photoData.uri }} style={styles.thumbnailImage} />
            ) : (
              <View style={styles.mockThumbnailContent}>
                <Ionicons name="camera-reverse" size={28} color={theme.success} />
                <Text style={[styles.mockWatermark, { color: theme.text }]}>
                  {label}
                </Text>
                <Text style={[styles.mockTimeText, { color: theme.textMuted }]}>
                  {formatCapturedTime(photoData?.capturedAt)} · AUDIT-STAMPED
                </Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Action Buttons: View Fullscreen, Retake, Delete */}
          <View style={styles.capturedActionsRow}>
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: theme.surfaceAlt, borderColor: theme.border }]}
              onPress={() => photoData && onViewPhoto(photoData)}
            >
              <Ionicons name="eye-outline" size={16} color={theme.text} />
              <Text style={[styles.actionBtnText, { color: theme.text }]}>View</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: theme.surfaceAlt, borderColor: theme.primary }]}
              onPress={handleOpenMenu}
            >
              <Ionicons name="refresh-outline" size={16} color={theme.primary} />
              <Text style={[styles.actionBtnText, { color: theme.primary }]}>Retake</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: theme.dangerLight, borderColor: theme.danger }]}
              onPress={() => onRemovePhoto(slotId)}
            >
              <Ionicons name="trash-outline" size={16} color={theme.danger} />
              <Text style={[styles.actionBtnText, { color: theme.danger }]}>Clear</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        /* Empty Slot -> Tap to Capture or Quick Direct Action */
        <View style={styles.unfilledArea}>
          {/* Main Tap Target */}
          <TouchableOpacity
            style={[
              styles.captureButton,
              {
                backgroundColor: theme.surfaceAlt,
                borderColor: theme.warning,
              },
            ]}
            onPress={handleOpenMenu}
            activeOpacity={0.7}
          >
            <View style={[styles.cameraIconBg, { backgroundColor: theme.warningLight }]}>
              <Ionicons name="camera" size={24} color={theme.primary} />
            </View>
            <View style={styles.tapTextColumn}>
              <Text style={[styles.tapToCaptureText, { color: theme.primaryDark }]}>
                Tap to Capture Evidence
              </Text>
              <Text style={[styles.tapSubText, { color: theme.textMuted }]}>
                Choose Camera, Gallery, or Quick Stamp
              </Text>
            </View>
            <Ionicons name="ellipsis-horizontal-circle" size={24} color={theme.primary} />
          </TouchableOpacity>

          {/* Quick Direct Actions Row */}
          <View style={styles.directActionsRow}>
            <TouchableOpacity
              style={[styles.directActionBtn, { backgroundColor: theme.surfaceAlt, borderColor: theme.primary }]}
              onPress={handleCamera}
              activeOpacity={0.7}
            >
              <Ionicons name="camera" size={15} color={theme.primary} />
              <Text style={[styles.directActionText, { color: theme.primary }]}>
                Take Photo
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.directActionBtn, { backgroundColor: theme.surfaceAlt, borderColor: theme.border }]}
              onPress={handleGallery}
              activeOpacity={0.7}
            >
              <Ionicons name="images-outline" size={15} color={theme.text} />
              <Text style={[styles.directActionText, { color: theme.text }]}>
                Gallery
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.directActionBtn, { backgroundColor: theme.surfaceAlt, borderColor: theme.border }]}
              onPress={handleMock}
              activeOpacity={0.7}
            >
              <Ionicons name="flash-outline" size={14} color={theme.warning} />
              <Text style={[styles.directActionText, { color: theme.warning }]}>
                Stamp
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
    gap: 8,
  },
  labelContainer: {
    flex: 1,
  },
  label: {
    fontSize: 16,
    fontWeight: '700',
  },
  description: {
    fontSize: 12,
    marginTop: 2,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    gap: 4,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  unfilledArea: {
    gap: 8,
  },
  captureButton: {
    minHeight: 56, // 48dp+ accessibility target
    borderRadius: 8,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    gap: 12,
  },
  cameraIconBg: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tapTextColumn: {
    flex: 1,
  },
  tapToCaptureText: {
    fontSize: 14,
    fontWeight: '700',
  },
  tapSubText: {
    fontSize: 11,
    marginTop: 2,
  },
  directActionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  directActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 36,
    borderRadius: 6,
    borderWidth: 1,
    gap: 5,
  },
  directActionText: {
    fontSize: 12,
    fontWeight: '700',
  },
  capturedArea: {
    gap: 10,
  },
  thumbnailBox: {
    height: 90,
    borderRadius: 8,
    borderWidth: 1,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  mockThumbnailContent: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  mockWatermark: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: 2,
  },
  mockTimeText: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  capturedActionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    flex: 1,
    height: 40,
    borderRadius: 6,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  actionBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
});
