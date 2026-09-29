import AsyncStorage from '@react-native-async-storage/async-storage';
import { FormSchema, FormSubmissionRecord, PhotoData } from '../types/schema';

const STORAGE_KEYS = {
  ACTIVE_DRAFT: '@cpi_active_draft_v1',
  SUBMISSIONS_HISTORY: '@cpi_submissions_history_v1',
  SCHEMA_OVERRIDE: '@cpi_schema_override_v1',
  APP_SETTINGS: '@cpi_app_settings_v1',
};

export interface DraftState {
  draftId: string;
  schemaId: string;
  schemaVersion: string;
  lastSavedAt: string;
  formData: Record<string, any>;
  photos: Record<string, PhotoData>;
}

export interface AppSettings {
  highContrastMode: boolean;
  themeMode: 'light' | 'dark' | 'high_contrast';
  quickMockCapture: boolean; // Enables 1-tap instant photo simulation for quick testing
  engineerName: string;
  installationSiteName: string;
}

const DEFAULT_SETTINGS: AppSettings = {
  highContrastMode: false,
  themeMode: 'light',
  quickMockCapture: true,
  engineerName: 'Engr. J. Santos (CPI Field)',
  installationSiteName: 'Sitio Maligaya Microgrid, Quezon',
};

/**
 * Saves current in-progress form draft to offline storage
 */
export async function saveActiveDraft(
  schema: FormSchema,
  formData: Record<string, any>,
  photos: Record<string, PhotoData>,
  draftId?: string
): Promise<string> {
  try {
    const id = draftId || `draft_${Date.now()}`;
    const draft: DraftState = {
      draftId: id,
      schemaId: schema.id,
      schemaVersion: schema.version,
      lastSavedAt: new Date().toISOString(),
      formData,
      photos,
    };
    await AsyncStorage.setItem(STORAGE_KEYS.ACTIVE_DRAFT, JSON.stringify(draft));
    return id;
  } catch (error) {
    console.error('Failed to save active draft to AsyncStorage:', error);
    throw error;
  }
}

/**
 * Loads the active draft from offline storage (restores state after cold start or force-close)
 */
export async function loadActiveDraft(): Promise<DraftState | null> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.ACTIVE_DRAFT);
    if (!raw) return null;
    return JSON.parse(raw) as DraftState;
  } catch (error) {
    console.error('Failed to load active draft:', error);
    return null;
  }
}

/**
 * Clears the active draft (e.g. after successful submission or when starting fresh)
 */
export async function clearActiveDraft(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.ACTIVE_DRAFT);
  } catch (error) {
    console.error('Failed to clear active draft:', error);
  }
}

/**
 * Saves a completed or submitted commissioning record to the local audit history
 */
export async function saveSubmissionRecord(record: FormSubmissionRecord): Promise<void> {
  try {
    const history = await getSubmissionsHistory();
    const filtered = history.filter((item) => item.id !== record.id);
    filtered.unshift(record); // newest first
    await AsyncStorage.setItem(STORAGE_KEYS.SUBMISSIONS_HISTORY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Failed to save submission record:', error);
    throw error;
  }
}

/**
 * Retrieves all saved submissions and past audit records
 */
export async function getSubmissionsHistory(): Promise<FormSubmissionRecord[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.SUBMISSIONS_HISTORY);
    if (!raw) return [];
    return JSON.parse(raw) as FormSubmissionRecord[];
  } catch (error) {
    console.error('Failed to get submissions history:', error);
    return [];
  }
}

/**
 * Deletes a specific submission record from history
 */
export async function deleteSubmissionRecord(id: string): Promise<void> {
  try {
    const history = await getSubmissionsHistory();
    const updated = history.filter((item) => item.id !== id);
    await AsyncStorage.setItem(STORAGE_KEYS.SUBMISSIONS_HISTORY, JSON.stringify(updated));
  } catch (error) {
    console.error('Failed to delete submission record:', error);
  }
}

/**
 * Saves custom schema override (for live interview testing & remote schema simulation)
 */
export async function saveSchemaOverride(schema: FormSchema | null): Promise<void> {
  try {
    if (schema) {
      await AsyncStorage.setItem(STORAGE_KEYS.SCHEMA_OVERRIDE, JSON.stringify(schema));
    } else {
      await AsyncStorage.removeItem(STORAGE_KEYS.SCHEMA_OVERRIDE);
    }
  } catch (error) {
    console.error('Failed to save schema override:', error);
  }
}

/**
 * Loads custom schema override if set
 */
export async function loadSchemaOverride(): Promise<FormSchema | null> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.SCHEMA_OVERRIDE);
    if (!raw) return null;
    return JSON.parse(raw) as FormSchema;
  } catch (error) {
    console.error('Failed to load schema override:', error);
    return null;
  }
}

/**
 * App Settings persistence
 */
export async function loadAppSettings(): Promise<AppSettings> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.APP_SETTINGS);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch (error) {
    return DEFAULT_SETTINGS;
  }
}

export async function saveAppSettings(settings: Partial<AppSettings>): Promise<AppSettings> {
  try {
    const current = await loadAppSettings();
    const updated = { ...current, ...settings };
    await AsyncStorage.setItem(STORAGE_KEYS.APP_SETTINGS, JSON.stringify(updated));
    return updated;
  } catch (error) {
    console.error('Failed to save app settings:', error);
    return DEFAULT_SETTINGS;
  }
}
