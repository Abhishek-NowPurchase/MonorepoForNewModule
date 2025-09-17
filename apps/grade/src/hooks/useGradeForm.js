import { useState, useCallback, useEffect } from 'react';
import { useDispatch } from 'react-redux';

// 🔄 UTILITY FUNCTIONS FOR DATA TRANSFORMATION
const transformElementsObjectToArray = (elementsObj) => {
  if (!elementsObj || typeof elementsObj !== 'object') return [];
  
  return Object.entries(elementsObj).map(([symbol, element]) => ({
    id: symbol, // Use symbol as ID
    symbol: symbol,
    bathMin: element.bathMin || '0',
    bathMax: element.bathMax || '0',
    finalMin: element.finalMin || '0',
    finalMax: element.finalMax || '0',
    tolerance: element.tolerance || false,
    toleranceMin: element.toleranceMin || '0',
    toleranceMax: element.toleranceMax || '0'
  }));
};

const transformElementsArrayToObject = (elementsArray) => {
  if (!Array.isArray(elementsArray)) return {};
  
  const elementsObj = {};
  elementsArray.forEach(element => {
    if (element.symbol) {
      elementsObj[element.symbol] = {
        bathMin: element.bathMin || '0',
        bathMax: element.bathMax || '0',
        finalMin: element.finalMin || '0',
        finalMax: element.finalMax || '0',
        tolerance: element.tolerance || false,
        toleranceMin: element.toleranceMin || '0',
        toleranceMax: element.toleranceMax || '0'
      };
    }
  });
  return elementsObj;
};

export const useGradeForm = (initialValues = {}) => {
  const dispatch = useDispatch();
  
  // 🔍 DEBUG LOGS - Let's see what we're getting
  console.log('🔍 useGradeForm called with initialValues:', initialValues);
  
  // 🔄 TRANSFORM INITIAL VALUES - Convert object elements to array
  const transformedElements = transformElementsObjectToArray(initialValues.elements);
  
  // 🚀 SIMPLE STATE MANAGEMENT INSTEAD OF DYNAMIC FORMS
  const [formData, setFormData] = useState({
    gradeName: initialValues.gradeName || '',
    gradeCode: initialValues.gradeCode || '',
    tagId: initialValues.tagId || '',
    description: initialValues.description || '',
    btcEnabled: initialValues.btcEnabled || false,
    elements: transformedElements,
    spectroOptions: {
      visible: initialValues.spectroOptions?.visible || false,
      wavelength: initialValues.spectroOptions?.wavelength || '589.3',
      slitWidth: initialValues.spectroOptions?.slitWidth || '10',
      integrationTime: initialValues.spectroOptions?.integrationTime || '100'
    },
    rememberChoice: initialValues.rememberChoice || false,
    autoValidate: initialValues.autoValidate !== false
  });

  console.log('🔍 Form data initialized:', formData);
  console.log('🔍 Transformed elements:', transformedElements);

  // 📝 Handle form submission
  const handleSubmit = useCallback((data) => {
    try {
      console.log('🎯 Grade Form Submitted (raw):', data);
      
      // 🔄 TRANSFORM BACK - Convert array elements to object for Redux
      const transformedData = {
        ...data,
        elements: transformElementsArrayToObject(data.elements)
      };
      
      console.log('🎯 Grade Form Submitted (transformed):', transformedData);
      return { success: true, data: transformedData };
    } catch (error) {
      console.error('❌ Grade Form Submission Error:', error);
      return { success: false, error };
    }
  }, []);

  // 🧪 Handle element addition
  const handleAddElement = useCallback((elementData) => {
    try {
      console.log('🔍 handleAddElement called with:', elementData);
      
      // Safety check for elementData
      if (!elementData || typeof elementData !== 'object') {
        console.warn('⚠️ Invalid elementData provided to handleAddElement:', elementData);
        return { success: false, error: 'Invalid element data' };
      }

      const newElement = {
        id: Date.now().toString(),
        symbol: elementData.symbol || 'Unknown',
        bathMin: elementData.bathMin || '0',
        bathMax: elementData.bathMax || '0',
        finalMin: elementData.finalMin || '0',
        finalMax: elementData.finalMax || '0',
        tolerance: elementData.tolerance || false
      };
      
      console.log('🔍 New element created:', newElement);
      
      // Update form state
      setFormData(prev => ({
        ...prev,
        elements: [...prev.elements, newElement]
      }));
      
      return { success: true, element: newElement };
    } catch (error) {
      console.error('❌ Add Element Error:', error);
      return { success: false, error };
    }
  }, []);

  // 🗑️ Handle element removal
  const handleRemoveElement = useCallback((elementId) => {
    try {
      console.log('🔍 handleRemoveElement called with elementId:', elementId);
      
      setFormData(prev => ({
        ...prev,
        elements: prev.elements.filter(el => el.id !== elementId)
      }));
      
      return { success: true };
    } catch (error) {
      console.error('❌ Remove Element Error:', error);
      return { success: false, error };
    }
  }, []);

  // ✏️ Handle element updates
  const handleUpdateElement = useCallback((elementId, updates) => {
    try {
      console.log('🔍 handleUpdateElement called with elementId:', elementId, 'updates:', updates);
      
      setFormData(prev => ({
        ...prev,
        elements: prev.elements.map(el => 
          el.id === elementId ? { ...el, ...updates } : el
        )
      }));
      
      return { success: true };
    } catch (error) {
      console.error('❌ Update Element Error:', error);
      return { success: false, error };
    }
  }, []);

  // 🎛️ Handle BTC toggle
  const handleBTCToggle = useCallback((enabled) => {
    try {
      console.log('🔍 handleBTCToggle called with enabled:', enabled);
      setFormData(prev => ({ ...prev, btcEnabled: enabled }));
      return { success: true };
    } catch (error) {
      console.error('❌ BTC Toggle Error:', error);
      return { success: false, error };
    }
  }, []);

  // 📊 Handle tolerance toggle
  const handleToleranceToggle = useCallback((elementId, enabled) => {
    try {
      console.log('🔍 handleToleranceToggle called with elementId:', elementId, 'enabled:', enabled);
      
      setFormData(prev => ({
        ...prev,
        elements: prev.elements.map(el => 
          el.id === elementId ? { ...el, tolerance: enabled } : el
        )
      }));
      
      return { success: true };
    } catch (error) {
      console.error('❌ Tolerance Toggle Error:', error);
      return { success: false, error };
    }
  }, []);

  // 🔍 Validate element data
  const validateElement = useCallback((elementData) => {
    try {
      if (!elementData || typeof elementData !== 'object') {
        return { isValid: false, error: 'Invalid element data' };
      }

      const { symbol, bathMin, bathMax, finalMin, finalMax } = elementData;
      
      if (!symbol || typeof symbol !== 'string') {
        return { isValid: false, error: 'Element symbol is required' };
      }

      // Validate numeric ranges
      const numericFields = { bathMin, bathMax, finalMin, finalMax };
      for (const [field, value] of Object.entries(numericFields)) {
        const numValue = parseFloat(value);
        if (isNaN(numValue) || numValue < 0) {
          return { isValid: false, error: `${field} must be a positive number` };
        }
      }

      // Validate min <= max relationships
      if (parseFloat(bathMin) > parseFloat(bathMax)) {
        return { isValid: false, error: 'Bath min cannot be greater than bath max' };
      }

      if (parseFloat(finalMin) > parseFloat(finalMax)) {
        return { isValid: false, error: 'Final min cannot be greater than final max' };
      }

      return { isValid: true };
    } catch (error) {
      return { isValid: false, error: error.message };
    }
  }, []);

  // 🔄 SYNC FORM WITH EXTERNAL CHANGES
  useEffect(() => {
    if (initialValues.elements) {
      const transformedElements = transformElementsObjectToArray(initialValues.elements);
      console.log('🔍 Syncing form with external elements:', transformedElements);
      setFormData(prev => ({ ...prev, elements: transformedElements }));
    }
  }, [initialValues.elements]);

  // 📋 Get current form values
  const getFormValues = useCallback(() => formData, [formData]);

  // 🔄 Update form field
  const setFieldValue = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  // 🔄 Update nested form field
  const setNestedFieldValue = useCallback((path, value) => {
    setFormData(prev => {
      const newData = { ...prev };
      const keys = path.split('.');
      let current = newData;
      
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
      return newData;
    });
  }, []);

  return {
    // Form state
    formData,
    getFormValues,
    setFieldValue,
    setNestedFieldValue,
    
    // Form actions
    handleSubmit,
    handleAddElement,
    handleRemoveElement,
    handleUpdateElement,
    handleBTCToggle,
    handleToleranceToggle,
    validateElement,
    
    // 🔄 EXPOSE TRANSFORMATION FUNCTIONS FOR EXTERNAL USE
    transformElementsObjectToArray,
    transformElementsArrayToObject
  };
};

// 🎯 SPECIALIZED HOOKS FOR SPECIFIC USE CASES

// Element management hook
export const useElementForm = () => {
  const { formData, handleAddElement, handleRemoveElement, handleUpdateElement } = useGradeForm();
  
  return {
    elements: formData.elements || [],
    addElement: handleAddElement,
    removeElement: handleRemoveElement,
    updateElement: handleUpdateElement
  };
};

// Spectro options hook
export const useSpectroForm = () => {
  const { formData } = useGradeForm();
  
  const spectroOptions = formData.spectroOptions || {};
  
  return {
    spectroOptions,
    isVisible: spectroOptions.visible || false,
    wavelength: spectroOptions.wavelength || 589.3,
    slitWidth: spectroOptions.slitWidth || 10,
    integrationTime: spectroOptions.integrationTime || 100
  };
};

// BTC management hook
export const useBTCForm = () => {
  const { formData, handleBTCToggle } = useGradeForm();
  
  return {
    btcEnabled: formData.btcEnabled || false,
    toggleBTC: handleBTCToggle
  };
};
