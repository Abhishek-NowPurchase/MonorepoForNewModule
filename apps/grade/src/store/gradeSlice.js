import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { 
  AVAILABLE_ELEMENTS, 
  MODULE_CONFIG, 
  BUSINESS_CONSTANTS 
} from '../constants/gradeConstants';

// 🎯 INITIAL STATE - Based on PRD specifications
const initialState = {
  // Module Selection
  selectedModules: ['SPECTRO'], // SPECTRO is default and required

  // Grade Overview
  gradeOverview: {
    tagId: '',
    gradeName: '',
    gradeCode: '',
    gradeType: 'DI',
    tappingTemperatureMin: BUSINESS_CONSTANTS.DEFAULT_TAPPING_TEMP_MIN,
    tappingTemperatureMax: BUSINESS_CONSTANTS.DEFAULT_TAPPING_TEMP_MAX,
    mgTreatmentTime: BUSINESS_CONSTANTS.DEFAULT_MG_TREATMENT_TIME,
  },

  // SPECTRO Module specific
  btcChoice: null, // Form is blocked until this is set
  rememberChoice: false,
  elements: {
    C: { finalMin: 3.45, finalMax: 3.55 },
    Si: { finalMin: 2.30, finalMax: 2.35 },
  },
  toleranceEnabled: false,
  advancedOptionsVisible: false,
  selectedElements: ['C', 'Si'],
  rawMaterials: [],

  // IF Module specific
  chargemixItems: [],
  chargemixVisible: false,

  // UI State
  isLoading: false,
  error: null,
  showSuccessModal: false,
};

// 🚀 ASYNC THUNKS
export const createGrade = createAsyncThunk(
  'grade/createGrade',
  async (gradeData, { rejectWithValue }) => {
    try {
      // Simulate API call - replace with actual API
      const response = await new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            success: true,
            gradeId: `GRADE-${Date.now()}`,
            message: 'Grade created successfully!',
          });
        }, 1000);
      });
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// 🔧 BUSINESS LOGIC UTILITIES
const getDefaultElementsForGradeType = (gradeType) => {
  switch (gradeType) {
    case 'SS': // Non-ferrous - no default elements
      return {};
    case 'DI': // Ductile Iron
    case 'GI': // Gray Iron
    default: // Ferrous grades
      return {
        C: { finalMin: 3.45, finalMax: 3.55 },
        Si: { finalMin: 2.30, finalMax: 2.35 },
      };
  }
};

const canRemoveElement = (elementSymbol, gradeType) => {
  const isNonFerrous = gradeType === 'SS';
  return isNonFerrous || (elementSymbol !== 'C' && elementSymbol !== 'Si');
};

// 🎯 REDUX SLICE
const gradeSlice = createSlice({
  name: 'grade',
  initialState,
  reducers: {
    // Module Selection
    toggleModule: (state, action) => {
      const moduleId = action.payload;
      if (moduleId === 'SPECTRO') {
        // SPECTRO cannot be deselected
        return;
      }

      const index = state.selectedModules.indexOf(moduleId);
      if (index > -1) {
        state.selectedModules.splice(index, 1);
      } else {
        state.selectedModules.push(moduleId);
      }
    },

    // Grade Overview
    updateGradeOverview: (state, action) => {
      const { field, value } = action.payload;
      state.gradeOverview[field] = value;

      // Handle grade type change
      if (field === 'gradeType') {
        // Reset elements to defaults for new grade type
        state.elements = getDefaultElementsForGradeType(value);
        state.selectedElements = Object.keys(state.elements);

        // Show/hide Mg Treatment Time for DI grades
        if (value === 'DI' && !state.gradeOverview.mgTreatmentTime) {
          state.gradeOverview.mgTreatmentTime = BUSINESS_CONSTANTS.DEFAULT_MG_TREATMENT_TIME;
        }
      }
    },

    // BTC Decision Gate
    setBTCChoice: (state, action) => {
      const { choice, remember } = action.payload;
      state.btcChoice = choice;
      state.rememberChoice = remember;

      // Reset tolerance when switching to 'without' BTC
      if (choice === 'without') {
        state.toleranceEnabled = false;
      }

      // Store in localStorage if remember is true
      if (remember) {
        localStorage.setItem('btcChoice', choice);
      }
    },

    // Element Management
    addElement: (state, action) => {
      const elementSymbol = action.payload;
      if (!state.elements[elementSymbol]) {
        state.elements[elementSymbol] = AVAILABLE_ELEMENTS[elementSymbol];
        if (!state.selectedElements.includes(elementSymbol)) {
          state.selectedElements.push(elementSymbol);
        }
      }
    },

    removeElement: (state, action) => {
      const elementSymbol = action.payload;
      if (canRemoveElement(elementSymbol, state.gradeOverview.gradeType)) {
        const { [elementSymbol]: removed, ...rest } = state.elements;
        state.elements = rest;
        state.selectedElements = state.selectedElements.filter(el => el !== elementSymbol);
      }
    },

    updateElement: (state, action) => {
      const { elementSymbol, field, value } = action.payload;
      if (state.elements[elementSymbol]) {
        state.elements[elementSymbol][field] = value;
      }
    },

    // Tolerance Management
    toggleTolerance: (state, action) => {
      state.toleranceEnabled = action.payload;
    },

    // Advanced Options
    toggleAdvancedOptions: (state, action) => {
      state.advancedOptionsVisible = action.payload;
    },

    updateSelectedElements: (state, action) => {
      state.selectedElements = action.payload;
    },

    // Raw Materials
    updateRawMaterials: (state, action) => {
      state.rawMaterials = action.payload;
    },

    // Chargemix Data
    toggleChargemix: (state, action) => {
      state.chargemixVisible = action.payload;
    },

    updateChargemixItems: (state, action) => {
      state.chargemixItems = action.payload;
    },

    // UI State
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },

    setError: (state, action) => {
      state.error = action.payload;
    },

    showSuccessModal: (state, action) => {
      state.showSuccessModal = action.payload;
    },

    // Reset form
    resetForm: (state) => {
      return { ...initialState, selectedModules: ['SPECTRO'] };
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(createGrade.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createGrade.fulfilled, (state, action) => {
        state.isLoading = false;
        state.showSuccessModal = true;
      })
      .addCase(createGrade.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

// 🎯 EXPORT ACTIONS
export const {
  toggleModule,
  updateGradeOverview,
  setBTCChoice,
  addElement,
  removeElement,
  updateElement,
  toggleTolerance,
  toggleAdvancedOptions,
  updateSelectedElements,
  updateRawMaterials,
  toggleChargemix,
  updateChargemixItems,
  setLoading,
  setError,
  showSuccessModal,
  resetForm,
} = gradeSlice.actions;

// 🎯 EXPORT SELECTORS
export const selectGradeState = (state) => state.grade;
export const selectSelectedModules = (state) => state.grade.selectedModules;
export const selectGradeOverview = (state) => state.grade.gradeOverview;
export const selectBTCChoice = (state) => state.grade.btcChoice;
export const selectElements = (state) => state.grade.elements;
export const selectToleranceEnabled = (state) => state.grade.toleranceEnabled;
export const selectAdvancedOptionsVisible = (state) => state.grade.advancedOptionsVisible;
export const selectSelectedElements = (state) => state.grade.selectedElements;
export const selectRawMaterials = (state) => state.grade.rawMaterials;
export const selectChargemixVisible = (state) => state.grade.chargemixVisible;
export const selectChargemixItems = (state) => state.grade.chargemixItems;
export const selectIsLoading = (state) => state.grade.isLoading;
export const selectError = (state) => state.grade.error;
export const selectShowSuccessModal = (state) => state.grade.showSuccessModal;

// 🎯 EXPORT REDUCER
export default gradeSlice.reducer;
