export type FieldType =
  | 'text'
  | 'number'
  | 'date'
  | 'select'
  | 'radio'
  | 'computed'
  | 'repeater';

export interface SelectOption {
  label: string;
  value: string | number;
}

export type ValidationRuleType =
  | 'required'
  | 'not_future'
  | 'min_date_field'
  | 'max_date_field'
  | 'min_value'
  | 'max_value'
  | 'integer_only'
  | 'regex';

export interface ValidationRule {
  type: ValidationRuleType;
  targetField?: string;
  value?: number | string;
  message: string;
}

export interface FieldVisibilityCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'in' | 'greater_than' | 'less_than';
  value: any;
}

export interface SubFieldDefinition {
  id: string;
  label: string;
  type: 'text' | 'number' | 'select';
  required?: boolean;
  placeholder?: string;
  options?: SelectOption[];
  defaultValue?: any;
}

export interface FieldDefinition {
  id: string;
  label: string;
  type: FieldType;
  required?: boolean;
  placeholder?: string;
  helpText?: string;
  unit?: string;
  options?: SelectOption[];
  defaultValue?: any;
  visibility?: FieldVisibilityCondition;
  validation?: ValidationRule[];
  // For computed fields
  readOnly?: boolean;
  formula?: string; // e.g. "(panelCapacity * numberOfSolarPanels) / 1000"
  decimals?: number;
  // For repeater fields (e.g. ESS units)
  repeaterCountField?: string; // Field ID that determines the count (e.g. 'noOfEssInstalled')
  itemLabel?: string; // e.g. "ESS Unit #{index}"
  subFields?: SubFieldDefinition[];
}

export interface PhotoSlotDefinition {
  id: string;
  label: string;
  required?: boolean;
  description?: string;
}

export interface PhotoGroupDefinition {
  id: string;
  title: string;
  description?: string;
  visibility?: FieldVisibilityCondition;
  slots?: PhotoSlotDefinition[];
  // Dynamic slot generation (e.g. Earthing EP1..EPn)
  dynamicCountField?: string; // Field ID that sets count (e.g. 'earthingNos')
  slotPrefix?: string; // e.g. "EP"
  slotLabelTemplate?: string; // e.g. "Earthing Point {index} (EP{index})"
}

export interface FormSectionDefinition {
  id: string;
  code: 'A' | 'B' | 'C' | string;
  title: string;
  description?: string;
  icon?: string;
  fields?: FieldDefinition[];
  photoGroups?: PhotoGroupDefinition[];
}

export interface FormSchema {
  id: string;
  version: string;
  title: string;
  subtitle?: string;
  description?: string;
  lastUpdated?: string;
  author?: string;
  sections: FormSectionDefinition[];
}

export interface PhotoData {
  slotId: string;
  groupId: string;
  label: string;
  capturedAt: string; // ISO date string
  uri?: string;
  isMock: boolean;
  notes?: string;
}

export interface ValidationErrorItem {
  fieldId: string;
  sectionCode: string;
  sectionTitle: string;
  label: string;
  message: string;
}

export interface FormSubmissionRecord {
  id: string;
  schemaId: string;
  schemaVersion: string;
  status: 'draft' | 'completed' | 'submitted';
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  formData: Record<string, any>;
  photos: Record<string, PhotoData>;
  computedValues: Record<string, any>;
  summary: {
    contractorMobilisedDate?: string;
    solarPvCapacity?: string;
    totalPhotosRequired: number;
    totalPhotosCaptured: number;
    earthingWorks: string;
    essInstalled: string;
  };
}
