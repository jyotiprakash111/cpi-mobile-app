import defaultSchemaJson from './defaultSchema.json';
import { FormSchema } from '../types/schema';
import { loadSchemaOverride, saveSchemaOverride } from '../storage/formStorage';

export const DEFAULT_SCHEMA: FormSchema = defaultSchemaJson as FormSchema;

/**
 * Extended Cooperative Variant Schema (Simulating remote update from rural electric coop)
 * Demonstrates live schema flexibility during interview!
 */
export const COOP_VARIANT_SCHEMA: FormSchema = {
  id: 'cpi-site-commissioning-coop-v2',
  version: '2.1.0',
  title: 'Site Commissioning Form (Palawan Electric Coop)',
  subtitle: 'Off-Grid Solar & Battery Microgrid Standard',
  description: 'Updated specification with 650Wp bifacial panels, Inverter make tracking, and additional inverter photo requirement.',
  lastUpdated: '2026-09-29T10:00:00Z',
  author: 'PALECO Engineering Oversight',
  sections: [
    ...DEFAULT_SCHEMA.sections.map((sec) => {
      if (sec.id === 'section-b') {
        return {
          ...sec,
          fields: [
            ...(sec.fields || []),
            {
              id: 'inverterMake',
              label: 'Inverter Brand / Model',
              type: 'select' as const,
              required: true,
              options: [
                { label: 'Growatt SPF 5000ES', value: 'Growatt SPF 5000ES' },
                { label: 'Victron MultiPlus-II', value: 'Victron MultiPlus-II' },
                { label: 'Deye SUN-5K-SG03LP1', value: 'Deye SUN-5K-SG03LP1' },
                { label: 'Schneider Conext SW', value: 'Schneider Conext SW' },
              ],
              helpText: 'Hybrid inverter installed at powerhouse',
            },
          ],
        };
      }
      if (sec.id === 'section-c') {
        return {
          ...sec,
          photoGroups: [
            ...(sec.photoGroups || []),
            {
              id: 'inverterPhotos',
              title: 'Inverter & Balance of System',
              description: 'Inverter wiring and AC/DC disconnect breaker photos',
              slots: [
                { id: 'inverter_nameplate', label: 'Inverter Nameplate & Wiring', required: true },
                { id: 'surge_protection', label: 'DC Surge Protection Device (SPD)', required: true },
              ],
            },
          ],
        };
      }
      return sec;
    }),
  ],
};

/**
 * Validates a schema object structure
 */
export function validateSchemaStructure(schema: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (!schema || typeof schema !== 'object') {
    return { valid: false, errors: ['Schema must be an object'] };
  }
  if (!schema.id || typeof schema.id !== 'string') {
    errors.push('Missing or invalid schema.id');
  }
  if (!schema.version || typeof schema.version !== 'string') {
    errors.push('Missing or invalid schema.version');
  }
  if (!Array.isArray(schema.sections) || schema.sections.length === 0) {
    errors.push('Schema must have at least one section');
  } else {
    schema.sections.forEach((sec: any, sIdx: number) => {
      if (!sec.id || !sec.title) {
        errors.push(`Section #${sIdx + 1} is missing id or title`);
      }
      if (sec.fields && !Array.isArray(sec.fields)) {
        errors.push(`Section "${sec.title}" fields must be an array`);
      }
      if (sec.photoGroups && !Array.isArray(sec.photoGroups)) {
        errors.push(`Section "${sec.title}" photoGroups must be an array`);
      }
    });
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Loads the active form schema (checks cached override first, falls back to local baseline)
 */
export async function getActiveSchema(): Promise<FormSchema> {
  try {
    const override = await loadSchemaOverride();
    if (override && validateSchemaStructure(override).valid) {
      return override;
    }
  } catch (e) {
    console.warn('Failed to load schema override, using default schema', e);
  }
  return DEFAULT_SCHEMA;
}

/**
 * Sets an active schema override (for live interview testing)
 */
export async function setActiveSchema(schema: FormSchema | null): Promise<void> {
  await saveSchemaOverride(schema);
}
