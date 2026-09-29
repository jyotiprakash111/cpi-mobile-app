import defaultSchemaJson from '../src/schema/defaultSchema.json';
import { FormSchema } from '../src/types/schema';
import {
  computeFormValues,
  evaluateFormEngine,
  initializeFormData,
} from '../src/engine/formEngine';
import { evaluateFormula, formatCapacityValue } from '../src/engine/computation';
import {
  isFutureDate,
  resolveActivePhotoSlots,
  validateFormFields,
  validatePhotoSlots,
} from '../src/engine/validation';

const schema: FormSchema = defaultSchemaJson as FormSchema;

let passed = 0;
let failed = 0;

function assert(condition: any, testName: string, details?: any) {
  if (Boolean(condition)) {
    console.log(`✅ PASS: ${testName}`);
    passed++;
  } else {
    console.error(`❌ FAIL: ${testName}`, details || '');
    failed++;
  }
}

console.log('=== STARTING CPI FORM ENGINE TEST SUITE ===\n');

// TEST 1: Date Validation Rules
console.log('--- 1. DATE VALIDATION RULES ---');
const today = new Date();
const futureDate = new Date(today);
futureDate.setDate(today.getDate() + 5);
const pastDate1 = new Date(today);
pastDate1.setDate(today.getDate() - 10);
const pastDate2 = new Date(today);
pastDate2.setDate(today.getDate() - 5);
const pastDate3 = new Date(today);
pastDate3.setDate(today.getDate() - 1);

const fmt = (d: Date) => d.toISOString().split('T')[0];

assert(isFutureDate(fmt(futureDate)) === true, 'Future date detected correctly');
assert(isFutureDate(fmt(pastDate1)) === false, 'Past date allowed');

// Test future date on form field
const dataWithFutureDate = {
  contractorMobilisedDate: fmt(futureDate),
  solarFoundationStartDate: fmt(pastDate2),
  solarFoundationEndDate: fmt(pastDate3),
  earthingWorks: 'No',
};
const res1 = validateFormFields(schema, dataWithFutureDate);
assert(
  res1.brokenRules.some((r) => r.fieldId === 'contractorMobilisedDate'),
  'Rule 1: Future contractor mobilised date is flagged as broken rule'
);

// Test Solar Foundation Start < Contractor Mobilised Date
const dataWithInvalidOrder1 = {
  contractorMobilisedDate: fmt(pastDate2), // 5 days ago
  solarFoundationStartDate: fmt(pastDate1), // 10 days ago (earlier than mobilised!)
  solarFoundationEndDate: fmt(pastDate3),
  earthingWorks: 'No',
};
const res2 = validateFormFields(schema, dataWithInvalidOrder1);
assert(
  res2.brokenRules.some((r) => r.fieldId === 'solarFoundationStartDate'),
  'Rule 2: Solar Foundation start earlier than Contractor Mobilised is flagged as broken rule'
);

// Test Solar Foundation End < Solar Foundation Start
const dataWithInvalidOrder2 = {
  contractorMobilisedDate: fmt(pastDate1), // 10 days ago
  solarFoundationStartDate: fmt(pastDate2), // 5 days ago
  solarFoundationEndDate: fmt(pastDate1), // 10 days ago (earlier than start!)
  earthingWorks: 'No',
};
const res3 = validateFormFields(schema, dataWithInvalidOrder2);
assert(
  res3.brokenRules.some((r) => r.fieldId === 'solarFoundationEndDate'),
  'Rule 3: Solar Foundation end earlier than start date is flagged as broken rule'
);

// TEST 2: Computed Solar PV Capacity
console.log('\n--- 2. COMPUTED SOLAR PV CAPACITY ---');
const calc1 = evaluateFormula('(panelCapacity * numberOfSolarPanels) / 1000', {
  panelCapacity: 580,
  numberOfSolarPanels: 20,
});
assert(calc1 === 11.6, '580 Wp × 20 panels ÷ 1000 = 11.60 kWp', calc1);
assert(formatCapacityValue(calc1) === '11.60 kWp', 'Formatted capacity string is 11.60 kWp');

const calc2 = evaluateFormula('(panelCapacity * numberOfSolarPanels) / 1000', {
  panelCapacity: 600,
  numberOfSolarPanels: 24,
});
assert(calc2 === 14.4, '600 Wp × 24 panels ÷ 1000 = 14.40 kWp', calc2);

// TEST 3: Earthing Works & Dynamic Photo Slots
console.log('\n--- 3. EARTHING WORKS & DYNAMIC PHOTO SLOTS ---');
const earthingNoData = {
  earthingWorks: 'No',
};
const slotsNo = resolveActivePhotoSlots(schema, earthingNoData);
const earthingGroupNo = slotsNo.find((g) => g.group.id === 'earthingPhotos');
assert(earthingGroupNo === undefined, 'When Earthing Works is No, Earthing photo group is hidden');

const earthingYesData = {
  earthingWorks: 'Yes',
  typeOfEarthing: 'Chemical',
  earthingNos: 3,
};
const slotsYes = resolveActivePhotoSlots(schema, earthingYesData);
const earthingGroupYes = slotsYes.find((g) => g.group.id === 'earthingPhotos');
assert(earthingGroupYes !== undefined, 'When Earthing Works is Yes, Earthing photo group is visible');
assert(
  earthingGroupYes !== undefined && earthingGroupYes.slots.length === 3,
  'When Earthing Nos is 3, exactly 3 slots (EP1, EP2, EP3) are generated',
  earthingGroupYes?.slots
);
assert(
  Boolean(
    earthingGroupYes &&
      earthingGroupYes.slots.length === 3 &&
      earthingGroupYes.slots[0].label.includes('EP1') &&
      earthingGroupYes.slots[1].label.includes('EP2') &&
      earthingGroupYes.slots[2].label.includes('EP3')
  ),
  'Slots are properly labelled EP1, EP2, EP3'
);

// TEST 4: ESS Repeater Validation
console.log('\n--- 4. ESS REPEATER VALIDATION ---');
const essDataIncomplete = {
  ess: 'Yes',
  noOfEssInstalled: 2,
  essUnits: [{ make: 'Huawei', serialNo: 'SN-001' }], // Unit 2 missing!
};
const resEss = validateFormFields(schema, essDataIncomplete);
assert(
  resEss.errorList.some((e) => e.fieldId === 'essUnits_1_make'),
  'Unit 2 Make is flagged as required when ESS count is 2'
);

// TEST 5: Complete Form Submission Gate
console.log('\n--- 5. FULL ENGINE STATE EVALUATION ---');
const fullValidFormData = {
  contractorMobilisedDate: fmt(pastDate1),
  solarFoundationStartDate: fmt(pastDate2),
  solarFoundationEndDate: fmt(pastDate3),
  earthingWorks: 'Yes',
  typeOfEarthing: 'Chemical',
  earthingNos: 2,
  ess: 'Yes',
  noOfEssInstalled: 1,
  essUnits: [{ make: 'BYD BatteryBox', serialNo: 'SN-BYD-892' }],
  panelCapacity: 590,
  numberOfSolarPanels: 16,
};

// With missing photos:
const engineWithMissingPhotos = evaluateFormEngine(schema, fullValidFormData, {});
assert(
  engineWithMissingPhotos.brokenRules.length === 0,
  'No broken date/ordering rules in valid data'
);
assert(
  engineWithMissingPhotos.canSaveDraft === true,
  'Draft can be saved while rules are unbroken'
);
assert(
  engineWithMissingPhotos.canSubmitComplete === false,
  'Form CANNOT be marked complete while photos are outstanding'
);
assert(
  engineWithMissingPhotos.missingPhotoSlots.length === 8, // 4 foundation + 2 structure + 2 earthing
  'Exactly 8 photo slots reported as outstanding (4 foundation + 2 structure + 2 EP)',
  engineWithMissingPhotos.missingPhotoSlots.length
);

// With all photos captured:
const allCapturedPhotos: Record<string, any> = {};
for (const missing of engineWithMissingPhotos.missingPhotoSlots) {
  allCapturedPhotos[missing.slotId] = {
    slotId: missing.slotId,
    groupId: 'test',
    label: missing.label,
    capturedAt: new Date().toISOString(),
    isMock: true,
  };
}

const engineFullyComplete = evaluateFormEngine(schema, fullValidFormData, allCapturedPhotos);
assert(
  engineFullyComplete.canSubmitComplete === true,
  'Form CAN be marked complete when all fields and photo slots are satisfied'
);
assert(
  engineFullyComplete.computedValues.solarPvCapacity === 9.44,
  '590 Wp × 16 panels ÷ 1000 = 9.44 kWp computed correctly'
);

console.log(`\n========================================`);
console.log(`TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
console.log(`========================================\n`);

if (failed > 0) {
  process.exit(1);
}
