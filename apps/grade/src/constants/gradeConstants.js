// 🎯 GRADE CREATION SYSTEM CONSTANTS

// 📊 AVAILABLE ELEMENTS - 18 total as per PRD
export const AVAILABLE_ELEMENTS = {
  Mn: { finalMin: 0.60, finalMax: 0.90 },
  P: { finalMin: 0.010, finalMax: 0.040 },
  S: { finalMin: 0.005, finalMax: 0.015 },
  Cr: { finalMin: 0.05, finalMax: 0.25 },
  Ni: { finalMin: 0.05, finalMax: 0.15 },
  Mo: { finalMin: 0.01, finalMax: 0.08 },
  Cu: { finalMin: 0.30, finalMax: 0.70 },
  Al: { finalMin: 0.010, finalMax: 0.050 },
  Ti: { finalMin: 0.005, finalMax: 0.025 },
  V: { finalMin: 0.005, finalMax: 0.020 },
  Nb: { finalMin: 0.005, finalMax: 0.015 },
  B: { finalMin: 0.001, finalMax: 0.005 },
  N: { finalMin: 0.005, finalMax: 0.015 },
  Mg: { finalMin: 0.030, finalMax: 0.060 },
  Ca: { finalMin: 0.005, finalMax: 0.020 },
  Ce: { finalMin: 0.005, finalMax: 0.015 },
  La: { finalMin: 0.005, finalMax: 0.015 },
  Sn: { finalMin: 0.005, finalMax: 0.020 },
};

// 🎛️ MODULE CONFIGURATION - As per PRD
export const MODULE_CONFIG = [
  {
    id: 'SPECTRO',
    name: 'SPECTRO',
    description: 'Spectrometer Module (Default)',
    icon: 'Beaker',
    features: ['Advanced spectro configuration', 'Element analysis and tolerance settings'],
    businessImpact: 'Provides precise chemical composition analysis',
    isDefault: true,
    isRequired: true,
  },
  {
    id: 'IF',
    name: 'IF Kiosk',
    description: 'Induction Furnace Kiosk (Optional)',
    icon: 'Magnet',
    features: ['Comprehensive charge mixture management', 'Chargemix item configuration'],
    businessImpact: 'Optimizes induction furnace charge preparation',
    isDefault: false,
    isRequired: false,
  },
];

// 🏭 RAW MATERIALS DATA
export const RAW_MATERIALS_DATA = [
  { name: 'Pig Iron', type: 'Furnace' },
  { name: 'Steel Scrap', type: 'Furnace' },
  { name: 'Cast Iron Returns', type: 'Furnace' },
  { name: 'Silicon Carbide', type: 'Furnace' },
  { name: 'Ferrosilicon', type: 'Furnace' },
  { name: 'Ferro Silicon', type: 'Additives' },
  { name: 'Ferro Manganese', type: 'Additives' },
  { name: 'Ferro Chrome', type: 'Additives' },
  { name: 'Calcium Carbide', type: 'Additives' },
  { name: 'Graphite', type: 'Additives' },
  { name: 'Carbon Raiser', type: 'Additives' },
  { name: 'Ferromanganese', type: 'Additives' },
  { name: 'Magnesium Ferrosilicon', type: 'Nodularizer' },
  { name: 'Ferro Silicon Magnesium', type: 'Nodularizer' },
  { name: 'Nickel Magnesium', type: 'Nodularizer' },
  { name: 'Magnesium', type: 'Nodularizer' },
  { name: 'Rare Earth Magnesium', type: 'Nodularizer' },
  { name: 'Rare Earth Alloy', type: 'Nodularizer' },
  { name: 'Calcium Silicon', type: 'Ladle' },
  { name: 'Aluminum Wire', type: 'Ladle' },
  { name: 'Ladle Sand', type: 'Ladle' },
  { name: 'Refractory Brick', type: 'Ladle' },
  { name: 'Ladle Lining', type: 'Ladle' },
  { name: 'Calcium Wire', type: 'Ladle' },
];

// 🏷️ GRADE TYPES
export const GRADE_TYPES = [
  { value: 'DI', label: 'DI - Ductile Iron', description: 'Spheroidal graphite iron with enhanced mechanical properties' },
  { value: 'CI', label: 'CI - Cast Iron', description: 'Traditional gray iron compositions' },
  { value: 'SS', label: 'SS - Stainless Steel', description: 'Corrosion-resistant alloy specifications' },
  { value: 'SG', label: 'SG - Spheroidal Graphite', description: 'High-strength graphite iron variants' },
  { value: 'GI', label: 'GI - Gray Iron', description: 'Standard gray iron casting compositions' }
];

// 🔧 BUSINESS LOGIC CONSTANTS
export const BUSINESS_CONSTANTS = {
  BTC_USAGE_PERCENTAGE: 72,
  TOLERANCE_USAGE_PERCENTAGE: 26,
  DEFAULT_TAPPING_TEMP_MIN: 1500,
  DEFAULT_TAPPING_TEMP_MAX: 1540,
  DEFAULT_MG_TREATMENT_TIME: 1,
};

// 🎨 UI CONSTANTS
export const UI_CONSTANTS = {
  ANIMATION_DURATION: 200,
  DEBOUNCE_DELAY: 300,
  MAX_ELEMENTS_DISPLAY: 5,
  MIN_TEMPERATURE: 800,
  MAX_TEMPERATURE: 2000,
  MIN_PERCENTAGE: 0,
  MAX_PERCENTAGE: 100,
  STEP_VALUES: {
    TEMPERATURE: 1,
    PERCENTAGE: 0.01,
    TIME: 0.1,
  },
};
