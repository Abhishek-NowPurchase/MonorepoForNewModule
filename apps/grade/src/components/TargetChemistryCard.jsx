import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  selectGradeState,
  addElement,
  removeElement,
  updateElement,
  toggleTolerance
} from '../store/gradeSlice';
import { AVAILABLE_ELEMENTS, BUSINESS_CONSTANTS } from '../constants/gradeConstants';
import { TextInput } from 'now-design-molecules';
import { Button } from 'now-design-atoms';
import { useGradeForm } from '../hooks/useGradeForm'; // Added import for useGradeForm

// 🧪 TARGET CHEMISTRY CARD COMPONENT
const TargetChemistryCard = ({
  btcEnabled,
  elements,
  toleranceEnabled,
  gradeType,
  onElementsChange,
  onToleranceEnabledChange,
  isLinked = false,
  onDetach,
  summary = "",
  showHeader = true,
  displayMode = 'edit',
}) => {
  const dispatch = useDispatch();
  const [toleranceOpen, setToleranceOpen] = useState(false);
  const [selectedNewElement, setSelectedNewElement] = useState("");
  const [comboboxOpen, setComboboxOpen] = useState(false);

  // 🎣 Use our custom grade form hook with error handling
  const { 
    formData,
    handleAddElement: dynamicAddElement, 
    handleRemoveElement: dynamicRemoveElement, 
    handleUpdateElement: dynamicUpdateElement,
    handleBTCToggle,
    handleToleranceToggle,
    validateElement
  } = useGradeForm({ elements }); // 🔄 PASS ELEMENTS TO THE HOOK FOR TRANSFORMATION

  // 🔍 DEBUG LOGS - Let's see what we're getting
  console.log('🔍 TargetChemistryCard Props:', {
    btcEnabled,
    elements,
    toleranceEnabled,
    gradeType,
    isLinked,
    displayMode
  });
  console.log('🔍 Elements type:', typeof elements);
  console.log('🔍 Elements isArray:', Array.isArray(elements));
  console.log('🔍 Elements keys:', elements ? Object.keys(elements) : 'undefined');
  console.log('🔍 Form data from hook:', formData);

  const updateElementValue = (elementSymbol, field, value) => {
    dispatch(updateElement({ elementSymbol, field, value }));
  };

  const validateToleranceInput = (element, field, value) => {
    if (field === 'toleranceMin') {
      return value <= element.finalMin;
    } else {
      return value >= element.finalMax;
    }
  };

  const handleAddElement = () => {
    if (selectedNewElement && !elements[selectedNewElement]) {
      dispatch(addElement(selectedNewElement));
      
      // Auto-select next available element
      const remaining = availableElementsForAdd.filter(el => el !== selectedNewElement);
      setSelectedNewElement(remaining[0] || "");
    }
  };

  const handleRemoveElement = (elementSymbol) => {
    const isNonFerrous = gradeType === 'SS';
    const canRemove = isNonFerrous || (elementSymbol !== 'C' && elementSymbol !== 'Si');
    
    if (canRemove) {
      dispatch(removeElement(elementSymbol));
    }
  };

  const availableElementsForAdd = Object.keys(AVAILABLE_ELEMENTS).filter(
    element => !elements[element]
  );

  const hasCustomTolerance = Object.values(elements).some(el => el.toleranceMin || el.toleranceMax);

  // Auto-select first available element when the list changes
  useEffect(() => {
    if (availableElementsForAdd.length > 0 && !selectedNewElement) {
      setSelectedNewElement(availableElementsForAdd[0]);
    }
  }, [availableElementsForAdd.length, selectedNewElement]);

  // 🎯 SUMMARY MODE - Show compact view when linked
  if (isLinked && displayMode === 'summary') {
    return (
      <div className="target-chemistry-summary space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300 rounded-lg">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="text-left p-3 font-medium">Element</th>
                {btcEnabled && (
                  <>
                    <th className="text-center p-3 font-medium">Bath Min</th>
                    <th className="text-center p-3 font-medium">Bath Max</th>
                  </>
                )}
                <th className="text-center p-3 font-medium">Final Min</th>
                <th className="text-center p-3 font-medium">Final Max</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(elements).map(([symbol, element]) => (
                <tr key={symbol} className="border-b hover:bg-gray-20">
                  <td className="p-3 font-medium">{symbol}</td>
                  {btcEnabled && (
                    <>
                      <td className="p-3 text-center font-mono">
                        {element.bathMin?.toFixed(2) || '-'}
                      </td>
                      <td className="p-3 text-center font-mono">
                        {element.bathMax?.toFixed(2) || '-'}
                      </td>
                    </>
                  )}
                  <td className="p-3 text-center font-mono">
                    {element.finalMin.toFixed(2)} 
                    {element.toleranceMin && (
                      <span className="text-yellow-600 font-semibold">({element.toleranceMin.toFixed(2)})</span>
                    )}
                  </td>
                  <td className="p-3 text-center font-mono">
                    {element.finalMax.toFixed(2)} 
                    {element.toleranceMax && (
                      <span className="text-yellow-600 font-semibold">({element.toleranceMax.toFixed(2)})</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // 🎯 LINKED MODE - Show summary chip
  if (isLinked) {
    return (
      <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <span className="text-sm text-blue-800">{summary}</span>
        <button
          onClick={onDetach}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          Detach
        </button>
      </div>
    );
  }

  // 🎯 EDIT MODE - Show full editable form
  return (
    <div className="target-chemistry-card bg-white rounded-lg shadow-md p-6 mb-6">
      {showHeader && (
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Target Chemistry</h2>
          {onDetach && (
            <button
              onClick={onDetach}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Detach
            </button>
          )}
        </div>
      )}
      
      <div className="space-y-6">
        {/* Chemistry Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2 font-medium">Element</th>
                {btcEnabled && (
                  <>
                    <th className="text-center p-2 font-medium">Bath Min</th>
                    <th className="text-center p-2 font-medium">Bath Max</th>
                  </>
                )}
                <th className="text-center p-2 font-medium">Final Min</th>
                <th className="text-center p-2 font-medium">Final Max</th>
                <th className="text-center p-2 font-medium w-16">Actions</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(elements).map(([symbol, element]) => (
                <tr key={symbol} className="border-b hover:bg-gray-30">
                  <td className="p-2 font-medium">{symbol}</td>
                  {btcEnabled && (
                    <>
                      <td className="p-2">
                                                 <TextInput
                           id={`${symbol}-bathMin`}
                           label="Bath Min"
                           value={element.bathMin?.toString() || ''}
                           onChange={(e) => updateElementValue(symbol, 'bathMin', parseFloat(e.target.value) || 0)}
                           placeholder="3.40"
                           type="number"
                           inputMode="decimal"
                           step="0.01"
                           min="0"
                           max="100"
                           className="w-20"
                         />
                      </td>
                      <td className="p-2">
                                                 <TextInput
                           id={`${symbol}-bathMax`}
                           label="Bath Max"
                           value={element.bathMax?.toString() || ''}
                           onChange={(e) => updateElementValue(symbol, 'bathMax', parseFloat(e.target.value) || 0)}
                           placeholder="3.60"
                           type="number"
                           inputMode="decimal"
                           step="0.01"
                           min="0"
                           max="100"
                           className="w-20"
                         />
                      </td>
                    </>
                  )}
                  <td className="p-2">
                                         <TextInput
                       id={`${symbol}-finalMin`}
                       label="Final Min"
                       value={element.finalMin?.toString() || ''}
                       onChange={(e) => updateElementValue(symbol, 'finalMin', parseFloat(e.target.value) || 0)}
                       placeholder="3.20"
                       type="number"
                       inputMode="decimal"
                       step="0.01"
                       min="0"
                       max="100"
                       required
                       className="w-20"
                     />
                  </td>
                  <td className="p-2">
                                         <TextInput
                       id={`${symbol}-finalMax`}
                       label="Final Max"
                       value={element.finalMax?.toString() || ''}
                       onChange={(e) => updateElementValue(symbol, 'finalMax', parseFloat(e.target.value) || 0)}
                       placeholder="3.40"
                       type="number"
                       inputMode="decimal"
                       step="0.01"
                       min="0"
                       max="100"
                       required
                       className="w-20"
                     />
                  </td>
                  <td className="p-2 text-center">
                    {(() => {
                      const isNonFerrous = gradeType === 'SS';
                      const canRemove = isNonFerrous || (symbol !== 'C' && symbol !== 'Si');
                      
                      return canRemove && (
                        <button
                          onClick={() => handleRemoveElement(symbol)}
                          className="text-red-600 hover:text-red-800 p-1"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      );
                    })()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Add Element Section */}
        <div className="space-y-3">
          {availableElementsForAdd.length > 0 && (
            <div className="p-4 border-2 border-dashed rounded-lg bg-gray-50">
              <div className="flex items-center space-x-3">
                <select
                  value={selectedNewElement}
                  onChange={(e) => setSelectedNewElement(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select element to add</option>
                  {availableElementsForAdd.map((element) => (
                    <option key={element} value={element}>{element}</option>
                  ))}
                </select>
                                 <Button
                   variant="primary"
                   onClick={handleAddElement}
                   disabled={!selectedNewElement}
                 >
                   Add Element
                 </Button>
              </div>
            </div>
          )}
        </div>

        {/* Tolerance Section */}
        <div className="border-t pt-4">
          <button
            onClick={() => setToleranceOpen(!toleranceOpen)}
            className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50 rounded-lg"
          >
            <div className="flex items-center space-x-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>Set Final-Chemistry Tolerance</span>
              {hasCustomTolerance && (
                <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                  Customized
                </span>
              )}
            </div>
            <svg 
              className={`w-4 h-4 transform transition-transform ${toleranceOpen ? 'rotate-180' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {toleranceOpen && (
            <div className="space-y-4 mt-4 p-4 border rounded-lg bg-gray-50">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg mb-4">
                <h4 className="text-sm font-medium text-blue-900 mb-2">What is Tolerance?</h4>
                <p className="text-sm text-blue-800 mb-3">
                  Tolerance is like a "safety margin" for your final chemistry values. It allows small variations from your target ranges without affecting quality.
                </p>
                <p className="text-sm text-blue-800">
                  <span className="font-medium">
                    {BUSINESS_CONSTANTS.TOLERANCE_USAGE_PERCENTAGE}% of grades use custom tolerance settings.
                  </span>
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {Object.entries(elements).map(([symbol, element]) => (
                  <div key={symbol} className="flex items-center justify-between p-3 border rounded bg-white">
                    <div className="flex items-center space-x-2">
                      <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center">
                        <span className="font-mono font-bold text-xs text-blue-600">{symbol}</span>
                      </div>
                      <div>
                        <label className="font-medium text-xs">{symbol} Tolerance</label>
                        <p className="text-xs text-gray-500">
                          Base: {element.finalMin} - {element.finalMax}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      <input
                        type="number"
                        step="0.01"
                        value={element.toleranceMin || ''}
                        onChange={(e) => {
                          const value = parseFloat(e.target.value) || 0;
                          updateElementValue(symbol, 'toleranceMin', value);
                        }}
                        className={`w-16 text-center text-xs h-7 px-1 border rounded ${
                          element.toleranceMin !== undefined && !validateToleranceInput(element, 'toleranceMin', element.toleranceMin)
                            ? 'border-red-500 focus:border-red-500'
                            : 'border-gray-300 focus:border-blue-500'
                        }`}
                        placeholder="Min"
                      />
                      <span className="text-xs text-gray-500">-</span>
                      <input
                        type="number"
                        step="0.01"
                        value={element.toleranceMax || ''}
                        onChange={(e) => {
                          const value = parseFloat(e.target.value) || 0;
                          updateElementValue(symbol, 'toleranceMax', value);
                        }}
                        className={`w-16 text-center text-xs h-7 px-1 border rounded ${
                          element.toleranceMax !== undefined && !validateToleranceInput(element, 'toleranceMax', element.toleranceMax)
                            ? 'border-red-500 focus:border-red-500'
                            : 'border-gray-300 focus:border-blue-500'
                        }`}
                        placeholder="Max"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TargetChemistryCard;
