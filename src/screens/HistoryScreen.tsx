import React, { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FormSubmissionRecord } from '../types/schema';
import { ThemeColors } from '../styles/theme';
import {
  deleteSubmissionRecord,
  getSubmissionsHistory,
} from '../storage/formStorage';
import { Button } from '../components/common/Button';

interface HistoryScreenProps {
  onBack: () => void;
  theme: ThemeColors;
}

export const HistoryScreen: React.FC<HistoryScreenProps> = ({
  onBack,
  theme,
}) => {
  const [submissions, setSubmissions] = useState<FormSubmissionRecord[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<FormSubmissionRecord | null>(null);

  const loadData = async () => {
    const records = await getSubmissionsHistory();
    setSubmissions(records);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDelete = (id: string) => {
    Alert.alert('Delete Record', 'Are you sure you want to delete this submission record?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteSubmissionRecord(id);
          await loadData();
          if (selectedRecord?.id === id) {
            setSelectedRecord(null);
          }
        },
      },
    ]);
  };

  const handleShareRecord = async (record: FormSubmissionRecord) => {
    try {
      await Share.share({
        title: `CPI_Submission_${record.id}.json`,
        message: JSON.stringify(record, null, 2),
      });
    } catch (err) {
      console.warn('Share error:', err);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={[styles.headerTitle, { color: theme.text }]}>
            Audit Submissions History
          </Text>
          <Text style={[styles.headerSub, { color: theme.textMuted }]}>
            {submissions.length} Completed Offline Records
          </Text>
        </View>
        <TouchableOpacity onPress={loadData} style={styles.refreshBtn}>
          <Ionicons name="refresh" size={20} color={theme.text} />
        </TouchableOpacity>
      </View>

      {/* Submissions List */}
      {submissions.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="file-tray-outline" size={56} color={theme.textMuted} />
          <Text style={[styles.emptyTitle, { color: theme.text }]}>
            No Completed Submissions Yet
          </Text>
          <Text style={[styles.emptySub, { color: theme.textMuted }]}>
            Filled commissioning forms with complete photo evidence will appear here after submission.
          </Text>
          <Button
            title="Return to Commissioning Form"
            onPress={onBack}
            variant="primary"
            theme={theme}
            style={{ marginTop: 20 }}
          />
        </View>
      ) : (
        <FlatList
          data={submissions}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <View
              style={[
                styles.recordCard,
                {
                  backgroundColor: theme.surface,
                  borderColor: theme.border,
                },
              ]}
            >
              <View style={styles.recordHeader}>
                <View>
                  <Text style={[styles.recordId, { color: theme.primary }]}>
                    {item.id}
                  </Text>
                  <Text style={[styles.recordDate, { color: theme.textMuted }]}>
                    {new Date(item.completedAt || item.createdAt).toLocaleString()}
                  </Text>
                </View>
                <View style={[styles.statusPill, { backgroundColor: theme.successLight, borderColor: theme.success }]}>
                  <Ionicons name="checkmark-circle" size={14} color={theme.success} />
                  <Text style={[styles.statusPillText, { color: theme.success }]}>
                    COMPLETED
                  </Text>
                </View>
              </View>

              {/* Summary Stats */}
              <View style={[styles.statsRow, { backgroundColor: theme.surfaceAlt }]}>
                <View style={styles.statCol}>
                  <Text style={[styles.statLabel, { color: theme.textMuted }]}>PV CAPACITY</Text>
                  <Text style={[styles.statVal, { color: theme.text }]}>
                    {item.summary.solarPvCapacity}
                  </Text>
                </View>
                <View style={styles.statCol}>
                  <Text style={[styles.statLabel, { color: theme.textMuted }]}>PHOTOS</Text>
                  <Text style={[styles.statVal, { color: theme.text }]}>
                    {item.summary.totalPhotosCaptured}/{item.summary.totalPhotosRequired}
                  </Text>
                </View>
                <View style={styles.statCol}>
                  <Text style={[styles.statLabel, { color: theme.textMuted }]}>MOBILISED</Text>
                  <Text style={[styles.statVal, { color: theme.text }]}>
                    {item.summary.contractorMobilisedDate || '—'}
                  </Text>
                </View>
              </View>

              {/* Action Buttons */}
              <View style={styles.recordActions}>
                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: theme.surfaceAlt, borderColor: theme.border }]}
                  onPress={() => handleShareRecord(item)}
                >
                  <Ionicons name="share-outline" size={16} color={theme.text} />
                  <Text style={[styles.actionBtnText, { color: theme.text }]}>Export JSON</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: theme.dangerLight, borderColor: theme.danger }]}
                  onPress={() => handleDelete(item.id)}
                >
                  <Ionicons name="trash-outline" size={16} color={theme.danger} />
                  <Text style={[styles.actionBtnText, { color: theme.danger }]}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}
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
  refreshBtn: {
    padding: 6,
  },
  listContent: {
    padding: 16,
    gap: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 16,
  },
  emptySub: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
  recordCard: {
    borderRadius: 12,
    borderWidth: 1.5,
    padding: 14,
    gap: 10,
  },
  recordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  recordId: {
    fontSize: 16,
    fontWeight: '800',
  },
  recordDate: {
    fontSize: 12,
    marginTop: 2,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    gap: 4,
  },
  statusPillText: {
    fontSize: 11,
    fontWeight: '800',
  },
  statsRow: {
    flexDirection: 'row',
    borderRadius: 8,
    padding: 10,
  },
  statCol: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  statVal: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 2,
  },
  recordActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 6,
    borderWidth: 1,
    gap: 6,
  },
  actionBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
});
