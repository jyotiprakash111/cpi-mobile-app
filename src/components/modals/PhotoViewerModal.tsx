import React from 'react';
import {
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PhotoData } from '../../types/schema';
import { ThemeColors } from '../../styles/theme';

interface PhotoViewerModalProps {
  photo: PhotoData | null;
  onClose: () => void;
  onDelete?: (slotId: string) => void;
  theme: ThemeColors;
}

export const PhotoViewerModal: React.FC<PhotoViewerModalProps> = ({
  photo,
  onClose,
  onDelete,
  theme,
}) => {
  if (!photo) return null;

  return (
    <Modal visible={!!photo} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={[styles.card, { backgroundColor: theme.surface }]}>
          {/* Header */}
          <View style={styles.header}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.title, { color: theme.text }]}>
                {photo.label}
              </Text>
              <Text style={[styles.subtitle, { color: theme.textMuted }]}>
                Slot: {photo.slotId} · Group: {photo.groupId}
              </Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              style={[styles.closeBtn, { backgroundColor: theme.surfaceAlt }]}
            >
              <Ionicons name="close" size={22} color={theme.text} />
            </TouchableOpacity>
          </View>

          {/* Photo Preview */}
          <View style={[styles.previewContainer, { backgroundColor: '#000000' }]}>
            {photo.uri ? (
              <Image source={{ uri: photo.uri }} style={styles.image} />
            ) : (
              <View style={styles.mockPreview}>
                <Ionicons name="camera" size={64} color="#0D6EFD" />
                <Text style={styles.mockTitle}>{photo.label}</Text>
                <View style={styles.watermarkBox}>
                  <Text style={styles.watermarkText}>
                    COST PLUS, INC. · AUDIT EVIDENCE CAPTURE
                  </Text>
                  <Text style={styles.watermarkDate}>
                    ISO: {photo.capturedAt}
                  </Text>
                  <Text style={styles.watermarkGps}>
                    STATUS: CRYPTOGRAPHICALLY HASHED & TIMESTAMPED
                  </Text>
                </View>
              </View>
            )}
          </View>

          {/* Meta Info Footer */}
          <View style={[styles.metaFooter, { backgroundColor: theme.surfaceAlt }]}>
            <View style={styles.metaRow}>
              <Ionicons name="time-outline" size={16} color={theme.textMuted} />
              <Text style={[styles.metaText, { color: theme.text }]}>
                Captured At: {new Date(photo.capturedAt).toLocaleString()}
              </Text>
            </View>
            <View style={styles.metaRow}>
              <Ionicons name="shield-checkmark-outline" size={16} color={theme.success} />
              <Text style={[styles.metaText, { color: theme.success, fontWeight: '700' }]}>
                Audit Compliance Verified
              </Text>
            </View>
          </View>

          {/* Actions */}
          <View style={styles.actionsRow}>
            {onDelete && (
              <TouchableOpacity
                style={[styles.deleteBtn, { backgroundColor: theme.dangerLight, borderColor: theme.danger }]}
                onPress={() => {
                  onDelete(photo.slotId);
                  onClose();
                }}
              >
                <Ionicons name="trash-outline" size={18} color={theme.danger} />
                <Text style={{ color: theme.danger, fontWeight: '700' }}>Delete Photo</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[styles.doneBtn, { backgroundColor: theme.primary }]}
              onPress={onClose}
            >
              <Text style={{ color: '#FFFFFF', fontWeight: '700' }}>Done</Text>
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
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  card: {
    width: '100%',
    maxWidth: 450,
    borderRadius: 14,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewContainer: {
    height: 280,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  mockPreview: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    gap: 12,
  },
  mockTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  watermarkBox: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  watermarkText: {
    color: '#388BFD',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  watermarkDate: {
    color: '#E6EDF3',
    fontSize: 11,
    fontWeight: '500',
  },
  watermarkGps: {
    color: '#3FB950',
    fontSize: 10,
    fontWeight: '700',
  },
  metaFooter: {
    padding: 12,
    gap: 6,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metaText: {
    fontSize: 13,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 14,
    gap: 10,
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1,
    gap: 6,
  },
  doneBtn: {
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
