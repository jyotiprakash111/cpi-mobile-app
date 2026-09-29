import React from 'react';
import { FieldDefinition } from '../../types/schema';
import { ThemeColors } from '../../styles/theme';
import { isFieldVisible } from '../../engine/validation';
import { DatePickerField } from './DatePickerField';
import { SelectField } from './SelectField';
import { RadioField } from './RadioField';
import { NumberField } from './NumberField';
import { TextField } from './TextField';
import { ComputedField } from './ComputedField';
import { RepeaterField } from './RepeaterField';

interface FieldRendererProps {
  field: FieldDefinition;
  formData: Record<string, any>;
  computedValues: Record<string, any>;
  fieldErrors: Record<string, string>;
  onFieldChange: (fieldId: string, value: any) => void;
  theme: ThemeColors;
}

export const FieldRenderer: React.FC<FieldRendererProps> = ({
  field,
  formData,
  computedValues,
  fieldErrors,
  onFieldChange,
  theme,
}) => {
  // Check conditional visibility
  if (!isFieldVisible(field.visibility, formData)) {
    return null;
  }

  const value = formData[field.id];
  const error = fieldErrors[field.id];

  switch (field.type) {
    case 'date':
      return (
        <DatePickerField
          field={field}
          value={value}
          onChange={(val) => onFieldChange(field.id, val)}
          error={error}
          theme={theme}
        />
      );

    case 'radio':
      return (
        <RadioField
          field={field}
          value={value}
          onChange={(val) => onFieldChange(field.id, val)}
          error={error}
          theme={theme}
        />
      );

    case 'select':
      return (
        <SelectField
          field={field}
          value={value}
          onChange={(val) => onFieldChange(field.id, val)}
          error={error}
          theme={theme}
        />
      );

    case 'number':
      return (
        <NumberField
          field={field}
          value={value}
          onChange={(val) => onFieldChange(field.id, val)}
          error={error}
          theme={theme}
        />
      );

    case 'text':
      return (
        <TextField
          field={field}
          value={value}
          onChange={(val) => onFieldChange(field.id, val)}
          error={error}
          theme={theme}
        />
      );

    case 'computed':
      return (
        <ComputedField
          field={field}
          computedValue={computedValues[field.id]}
          formData={formData}
          theme={theme}
        />
      );

    case 'repeater': {
      const count = field.repeaterCountField
        ? Number(formData[field.repeaterCountField]) || 0
        : 0;
      return (
        <RepeaterField
          field={field}
          value={value}
          onChange={(val) => onFieldChange(field.id, val)}
          count={count}
          fieldErrors={fieldErrors}
          theme={theme}
        />
      );
    }

    default:
      return null;
  }
};
