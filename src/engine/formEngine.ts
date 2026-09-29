import {
  FormSchema,
  FormSectionDefinition,
  PhotoData,
  ValidationErrorItem,
} from '../types/schema';
import { evaluateFormula } from './computation';
import {
  isFieldVisible,
  resolveActivePhotoSlots,
  validateFormFields,
  validatePhotoSlots,
} from './validation';

export interface FormEngineState {
  formData: Record<string, any>;
  computedValues: Record<string, any>;
  photos: Record<string, PhotoData>;
  fieldErrors: Record<string, string>;
  errorList: ValidationErrorItem[];
  brokenRules: ValidationErrorItem[];
  missingPhotoSlots: { slotId: string; groupTitle: string; label: string }[];
  sectionProgress: Record<string, { total: number; completed: number; percent: number; isComplete: boolean }>;
  canSaveDraft: boolean; // Allowed unless fundamental validation rules are broken
  canSubmitComplete: boolean; // Only when 100% complete and 0 errors
  totalRequiredPhotos: number;
  totalCapturedPhotos: number;
}

/**
 * Initializes default form data based on schema default values
 */
export function initializeFormData(schema: FormSchema): Record<string, any> {
  const initialData: Record<string, any> = {};

  for (const section of schema.sections) {
    if (!section.fields) continue;
    for (const field of section.fields) {
      if (field.defaultValue !== undefined) {
        initialData[field.id] = field.defaultValue;
      } else if (field.type === 'repeater') {
        initialData[field.id] = [];
      } else {
        initialData[field.id] = '';
      }
    }
  }

  return initialData;
}

/**
 * Computes all formula-driven fields in the schema
 */
export function computeFormValues(
  schema: FormSchema,
  formData: Record<string, any>
): Record<string, any> {
  const computedValues: Record<string, any> = {};

  for (const section of schema.sections) {
    if (!section.fields) continue;
    for (const field of section.fields) {
      if (field.type === 'computed' && field.formula) {
        const result = evaluateFormula(field.formula, formData, field.decimals ?? 2);
        computedValues[field.id] = result;
      }
    }
  }

  return computedValues;
}

/**
 * Evaluates the full form engine state reactively
 */
export function evaluateFormEngine(
  schema: FormSchema,
  formData: Record<string, any>,
  photos: Record<string, PhotoData>
): FormEngineState {
  // 1. Calculate computed fields
  const computedValues = computeFormValues(schema, formData);

  // 2. Validate field inputs & rules
  const { fieldErrors, errorList, brokenRules } = validateFormFields(schema, formData);

  // 3. Validate photo slots
  const { totalRequired, totalCaptured, missingSlots, isPhotosComplete } =
    validatePhotoSlots(schema, formData, photos);

  // 4. Calculate progress per section
  const sectionProgress: Record<string, { total: number; completed: number; percent: number; isComplete: boolean }> = {};

  for (const section of schema.sections) {
    let totalItems = 0;
    let completedItems = 0;

    // Fields in this section
    if (section.fields) {
      for (const field of section.fields) {
        if (!isFieldVisible(field.visibility, formData)) continue;

        if (field.type === 'computed') {
          // Computed is complete if value is computed
          totalItems++;
          if (computedValues[field.id] !== null && computedValues[field.id] !== undefined) {
            completedItems++;
          }
        } else if (field.type === 'repeater' && field.repeaterCountField) {
          const count = Number(formData[field.repeaterCountField]) || 0;
          const items = Array.isArray(formData[field.id]) ? formData[field.id] : [];
          for (let i = 0; i < count; i++) {
            totalItems++;
            const item = items[i] || {};
            const allSubFilled = field.subFields
              ? field.subFields.every((sub) => !sub.required || (item[sub.id] && String(item[sub.id]).trim() !== ''))
              : true;
            if (allSubFilled) completedItems++;
          }
        } else {
          totalItems++;
          const val = formData[field.id];
          const hasVal = val !== undefined && val !== null && String(val).trim() !== '';
          const hasError = !!fieldErrors[field.id];
          if (hasVal && !hasError) {
            completedItems++;
          }
        }
      }
    }

    // Photos in this section
    if (section.photoGroups) {
      const activeGroups = resolveActivePhotoSlots(schema, formData);
      for (const { slots } of activeGroups) {
        for (const slot of slots) {
          totalItems++;
          const captured = photos[slot.id];
          if (captured && (captured.uri || captured.isMock)) {
            completedItems++;
          }
        }
      }
    }

    const percent = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 100;
    sectionProgress[section.id] = {
      total: totalItems,
      completed: completedItems,
      percent,
      isComplete: totalItems > 0 && completedItems === totalItems,
    };
  }

  // Broken rules constraint: "The form cannot be saved while a rule is broken, and the user must see which rule and where."
  const canSaveDraft = brokenRules.length === 0;

  // Complete submission constraint: No broken rules, no missing fields, no missing photo slots
  const canSubmitComplete =
    errorList.length === 0 &&
    missingSlots.length === 0 &&
    brokenRules.length === 0;

  return {
    formData,
    computedValues,
    photos,
    fieldErrors,
    errorList,
    brokenRules,
    missingPhotoSlots: missingSlots,
    sectionProgress,
    canSaveDraft,
    canSubmitComplete,
    totalRequiredPhotos: totalRequired,
    totalCapturedPhotos: totalCaptured,
  };
}
