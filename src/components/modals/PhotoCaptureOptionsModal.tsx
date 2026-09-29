import React from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemeColors } from '../../styles/theme';

export interface PhotoSlotTarget {
  slotId: string;
  groupId: string;
  label: string;
  description?: string;
}

interface PhotoCaptureOptionsModalProps {
  visible: boolean;
  target: PhotoSlotTarget | null;
  onClose: () => void;
  onSelectCamera: (slotId: string, groupId: string, label: string) => void;
  onSelectGallery: (slotId: string, groupId: string, label: string) => void;
  onSelectMock: (slotId: string, groupId: string, label: string) => void;
  theme: ThemeColors;
}

export const PhotoCaptureOptionsModal: React.FC<PhotoCaptureOptionsModalProps> = ({
  visible,
  target,
  onClose,
  onSelectCamera,
  onSelectGallery,
  onSelectMock,
  theme,
}) => {
  if (!target) return null;

  const handleCamera = () => {
    const { slotId, groupId, label } = target;
    onClose();
    onSelectCamera(slotId, groupId, label);
  };

  const handleGallery = () => {
    const { slotId, groupId, label } = target;
    onClose();
    onSelectGallery(slotId, groupId, label);
  };

  const handleMock = () => {
    const { slotId, groupId, label } = target;
    onClose();
    onSelectMock(slotId, groupId, label);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable
          style={[styles.modalCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
          onPress={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.headerTitle, { color: theme.text }]}>
                Capture Evidence
              </Text>
              <Text style={[styles.targetLabel, { color: theme.primaryDark }]}>
                {target.label}
              </Text>
              {target.description ? (
                <Text style={[styles.targetDesc, { color: theme.textMuted }]}>
                  {target.description}
                </Text>
              ) : null}
            </View>
            <TouchableOpacity
              onPress={onClose}
              style={[styles.closeBtn, { backgroundColor: theme.surfaceAlt }]}
            >
              <Ionicons name="close" size={20} color={theme.text} />
            </TouchableOpacity>
          </View>

          <Text style={[styles.instruction, { color: theme.textMuted }]}>
            Select how you would like to capture or attach photo evidence for this slot:
          </Text>

          {/* Option 1: Take Photo with Camera */}
          <TouchableOpacity
            style={[
              styles.optionCard,
              { backgroundColor: theme.surfaceAlt, borderColor: theme.primary },
            ]}
            onPress={handleCamera}
            activeOpacity={0.7}
          >
            <View style={[styles.iconCircle, { backgroundColor: theme.primaryLight }]}>
              <Ionicons name="camera" size={26} color={theme.primary} />
            </View>
            <View style={styles.optionTextCol}>
              <Text style={[styles.optionTitle, { color: theme.text }]}>
                Take Photo with Camera
              </Text>
              <Text style={[styles.optionSubtitle, { color: theme.textMuted }]}>
                Launch device camera to take a real photo now
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.textMuted} />
          </TouchableOpacity>

          {/* Option 2: Choose from Gallery */}
          <TouchableOpacity
            style={[
              styles.optionCard,
              { backgroundColor: theme.surfaceAlt, borderColor: theme.border },
            ]}
            onPress={handleGallery}
            activeOpacity={0.7}
          >
            <View style={[styles.iconCircle, { backgroundColor: theme.badgeBg }]}>
              <Ionicons name="images" size={26} color={theme.primaryDark} />
            </View>
            <View style={styles.optionTextCol}>
              <Text style={[styles.optionTitle, { color: theme.text }]}>
                Choose from Gallery
              </Text>
              <Text style={[styles.optionSubtitle, { color: theme.textMuted }]}>
                Select an existing photo from your device library
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.textMuted} />
          </TouchableOpacity>

          {/* Option 3: Quick Simulated Stamp */}
          <TouchableOpacity
            style={[
              styles.optionCard,
              { backgroundColor: theme.surfaceAlt, borderColor: theme.border },
            ]}
            onPress={handleMock}
            activeOpacity={0.7}
          >
            <View style={[styles.iconCircle, { backgroundColor: theme.warningLight }]}>
              <Ionicons name="flash-outline" size={24} color={theme.warning} />
            </View>
            <View style={styles.optionTextCol}>
              <Text style={[styles.optionTitle, { color: theme.text }]}>
                Quick Audit-Stamp (Simulation)
              </Text>
              <Text style={[styles.optionSubtitle, { color: theme.textMuted }]}>
                Instant ISO-timestamped record without camera hardware
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.textMuted} />
          </TouchableOpacity>

          {/* Cancel */}
          <TouchableOpacity
            style={[styles.cancelButton, { backgroundColor: theme.surfaceAlt }]}
            onPress={onClose}
          >
            <Text style={[styles.cancelText, { color: theme.text }]}>Cancel</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
    alignItems: 'center',
    padding: 16,
  },
  modalCard: {
    width: '100%',
    maxWidth: 500,
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  targetLabel: {
    fontSize: 15,
    fontWeight: '700',
    marginTop: 2,
  },
  targetDesc: {
    fontSize: 12,
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  instruction: {
    fontSize: 13,
    marginBottom: 16,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
    gap: 12,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionTextCol: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  optionSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  cancelButton: {
    marginTop: 6,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
