import {
  FieldDefinition,
  FormSchema,
  FormSectionDefinition,
  PhotoData,
  PhotoGroupDefinition,
  ValidationErrorItem,
  ValidationRule,
} from '../types/schema';

/**
 * Normalizes date to midnight local time for clean date-only comparisons (ignoring hour/min/sec)
 */
export function normalizeDateOnly(dateInput: string | Date | null | undefined): Date | null {
  if (!dateInput) return null;
  const d = typeof dateInput === 'string' ? new Date(dateInput) : new Date(dateInput);
  if (isNaN(d.getTime())) return null;
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

/**
 * Checks if date is in the future compared to today's date
 */
export function isFutureDate(dateStr: string): boolean {
  const target = normalizeDateOnly(dateStr);
  const today = normalizeDateOnly(new Date());
  if (!target || !today) return false;
  return target.getTime() > today.getTime();
}

/**
 * Evaluates visibility condition for a field or photo group
 */
export function isFieldVisible(
  visibility: FieldDefinition['visibility'],
  formData: Record<string, any>
): boolean {
  if (!visibility) return true;
  const actualValue = formData[visibility.field];

  switch (visibility.operator) {
    case 'equals':
      return String(actualValue) === String(visibility.value);
    case 'not_equals':
      return String(actualValue) !== String(visibility.value);
    case 'in':
      return Array.isArray(visibility.value) && visibility.value.includes(actualValue);
    case 'greater_than':
      return Number(actualValue) > Number(visibility.value);
    case 'less_than':
      return Number(actualValue) < Number(visibility.value);
    default:
      return true;
  }
}

/**
 * Validates a single rule on a field
 */
export function validateRule(
  rule: ValidationRule,
  value: any,
  formData: Record<string, any>
): string | null {
  switch (rule.type) {
    case 'required': {
      if (value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0)) {
        return rule.message || 'This field is required';
      }
      return null;
    }

    case 'not_future': {
      if (!value) return null; // handled by required if applicable
      if (isFutureDate(value)) {
        return rule.message || 'Date cannot be in the future';
      }
      return null;
    }

    case 'min_date_field': {
      if (!value || !rule.targetField) return null;
      const targetVal = formData[rule.targetField];
      if (!targetVal) return null;

      const current = normalizeDateOnly(value);
      const minDate = normalizeDateOnly(targetVal);

      if (current && minDate && current.getTime() < minDate.getTime()) {
        return rule.message || `Date cannot be earlier than ${rule.targetField}`;
      }
      return null;
    }

    case 'max_date_field': {
      if (!value || !rule.targetField) return null;
      const targetVal = formData[rule.targetField];
      if (!targetVal) return null;

      const current = normalizeDateOnly(value);
      const maxDate = normalizeDateOnly(targetVal);

      if (current && maxDate && current.getTime() > maxDate.getTime()) {
        return rule.message || `Date cannot be later than ${rule.targetField}`;
      }
      return null;
    }

    case 'min_value': {
      if (value === undefined || value === null || value === '') return null;
      const num = Number(value);
      if (isNaN(num) || num < Number(rule.value)) {
        return rule.message || `Value must be at least ${rule.value}`;
      }
      return null;
    }

    case 'max_value': {
      if (value === undefined || value === null || value === '') return null;
      const num = Number(value);
      if (isNaN(num) || num > Number(rule.value)) {
        return rule.message || `Value cannot exceed ${rule.value}`;
      }
      return null;
    }

    case 'integer_only': {
      if (value === undefined || value === null || value === '') return null;
      const num = Number(value);
      if (isNaN(num) || !Number.isInteger(num)) {
        return rule.message || 'Must be a whole integer';
      }
      return null;
    }

    default:
      return null;
  }
}

/**
 * Validates all fields in the schema against current form data
 */
export function validateFormFields(
  schema: FormSchema,
  formData: Record<string, any>
): {
  fieldErrors: Record<string, string>;
  errorList: ValidationErrorItem[];
  brokenRules: ValidationErrorItem[];
} {
  const fieldErrors: Record<string, string> = {};
  const errorList: ValidationErrorItem[] = [];
  const brokenRules: ValidationErrorItem[] = [];

  for (const section of schema.sections) {
    if (!section.fields) continue;

    for (const field of section.fields) {
      // Check visibility
      if (!isFieldVisible(field.visibility, formData)) {
        continue; // Skip hidden fields
      }

      const value = formData[field.id];

      // Handle repeater validation (e.g. ESS units)
      if (field.type === 'repeater' && field.repeaterCountField) {
        const count = Number(formData[field.repeaterCountField]) || 0;
        const items = Array.isArray(value) ? value : [];

        for (let i = 0; i < count; i++) {
          const item = items[i] || {};
          if (field.subFields) {
            for (const sub of field.subFields) {
              if (sub.required && (!item[sub.id] || String(item[sub.id]).trim() === '')) {
                const subKey = `${field.id}_${i}_${sub.id}`;
                const msg = `${field.itemLabel?.replace('{index}', String(i + 1)) || `Unit ${i + 1}`} ${sub.label} is required`;
                fieldErrors[subKey] = msg;
                errorList.push({
                  fieldId: subKey,
                  sectionCode: section.code,
                  sectionTitle: section.title,
                  label: `${field.label} (${sub.label} #${i + 1})`,
                  message: msg,
                });
              }
            }
          }
        }
        continue;
      }

      // Check required
      if (field.required) {
        if (value === undefined || value === null || String(value).trim() === '') {
          const msg = `${field.label} is required`;
          fieldErrors[field.id] = msg;
          errorList.push({
            fieldId: field.id,
            sectionCode: section.code,
            sectionTitle: section.title,
            label: field.label,
            message: msg,
          });
        }
      }

      // Check validation rules
      if (field.validation && field.validation.length > 0) {
        for (const rule of field.validation) {
          // If required was already flagged, don't duplicate
          if (rule.type === 'required') continue;

          const errorMsg = validateRule(rule, value, formData);
          if (errorMsg) {
            fieldErrors[field.id] = errorMsg;
            const item: ValidationErrorItem = {
              fieldId: field.id,
              sectionCode: section.code,
              sectionTitle: section.title,
              label: field.label,
              message: errorMsg,
            };
            errorList.push(item);
            brokenRules.push(item);
            break; // Stop at first broken rule on this field
          }
        }
      }
    }
  }

  return { fieldErrors, errorList, brokenRules };
}

/**
 * Resolves active photo slots based on schema and current form state (e.g. Earthing Nos count)
 */
export function resolveActivePhotoSlots(
  schema: FormSchema,
  formData: Record<string, any>
): {
  group: PhotoGroupDefinition;
  slots: { id: string; label: string; required: boolean; description?: string }[];
}[] {
  const result: {
    group: PhotoGroupDefinition;
    slots: { id: string; label: string; required: boolean; description?: string }[];
  }[] = [];

  for (const section of schema.sections) {
    if (!section.photoGroups) continue;

    for (const group of section.photoGroups) {
      if (!isFieldVisible(group.visibility, formData)) {
        continue; // Skip group if not visible (e.g. Earthing works is No)
      }

      const activeSlots: { id: string; label: string; required: boolean; description?: string }[] = [];

      // Static slots
      if (group.slots && group.slots.length > 0) {
        for (const slot of group.slots) {
          activeSlots.push({
            id: `${group.id}_${slot.id}`,
            label: slot.label,
            required: slot.required !== false,
            description: slot.description,
          });
        }
      }

      // Dynamic slots (e.g. Earthing EP1..EPn)
      if (group.dynamicCountField) {
        const count = Number(formData[group.dynamicCountField]) || 0;
        const prefix = group.slotPrefix || 'P';
        for (let i = 1; i <= count; i++) {
          const slotId = `${group.id}_${prefix.toLowerCase()}${i}`;
          const label = group.slotLabelTemplate
            ? group.slotLabelTemplate.replace(/{index}/g, String(i))
            : `${prefix}${i}`;
          activeSlots.push({
            id: slotId,
            label,
            required: true,
            description: `Audit photo for Earthing Point #${i}`,
          });
        }
      }

      if (activeSlots.length > 0) {
        result.push({
          group,
          slots: activeSlots,
        });
      }
    }
  }

  return result;
}

/**
 * Validates photo completion: checks which active photo slots have not been captured
 */
export function validatePhotoSlots(
  schema: FormSchema,
  formData: Record<string, any>,
  photos: Record<string, PhotoData>
): {
  totalRequired: number;
  totalCaptured: number;
  missingSlots: { slotId: string; groupTitle: string; label: string }[];
  isPhotosComplete: boolean;
} {
  const groups = resolveActivePhotoSlots(schema, formData);
  let totalRequired = 0;
  let totalCaptured = 0;
  const missingSlots: { slotId: string; groupTitle: string; label: string }[] = [];

  for (const { group, slots } of groups) {
    for (const slot of slots) {
      if (slot.required) {
        totalRequired++;
        const captured = photos[slot.id];
        if (captured && (captured.uri || captured.isMock)) {
          totalCaptured++;
        } else {
          missingSlots.push({
            slotId: slot.id,
            groupTitle: group.title,
            label: slot.label,
          });
        }
      }
    }
  }

  return {
    totalRequired,
    totalCaptured,
    missingSlots,
    isPhotosComplete: missingSlots.length === 0,
  };
}
