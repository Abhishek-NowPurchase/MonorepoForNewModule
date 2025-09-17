import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  selectGradeState,
  updateRawMaterials,
  updateSelectedElements,
  toggleAdvancedOptions
} from '../store/gradeSlice';
import { RAW_MATERIALS_DATA } from '../constants/gradeConstants';
import { Button } from 'now-design-atoms';

// 🔬 ADVANCED SPECTRO OPTIONS COMPONENT
const AdvancedSpectroOptions = ({
  visible,
  selectedElements,
  rawMaterials,
  availableElements,
  onVisibilityChange,
  onElementSelectionChange,
  onRawMaterialsChange,
  isLinked = false,
  onDetach,
  onRelink,
}) => {
  const dispatch = useDispatch();
  const [newMaterial, setNewMaterial] = useState({ materialName: '', min: 0, max: 0 });
  const [open, setOpen] = useState(false);

  const handleElementToggle = (element, checked) => {
    if (checked) {
      onElementSelectionChange([...selectedElements, element]);
    } else {
      onElementSelectionChange(selectedElements.filter(e => e !== element));
    }
  };

  const addRawMaterial = () => {
    if (newMaterial.materialName) {
      const selectedMaterial = RAW_MATERIALS_DATA.find(m => m.name === newMaterial.materialName);
      if (selectedMaterial) {
        const material = {
          id: `material_${Date.now()}`,
          materialName: selectedMaterial.name,
          materialType: selectedMaterial.type,
          min: newMaterial.min,
          max: newMaterial.max,
        };
        onRawMaterialsChange([...rawMaterials, material]);
        setNewMaterial({ materialName: '', min: 0, max: 0 });
        setOpen(false);
      }
    }
  };

  const removeMaterial = (id) => {
    onRawMaterialsChange(rawMaterials.filter(m => m.id !== id));
  };

  const updateMaterial = (id, field, value) => {
    onRawMaterialsChange(
      rawMaterials.map(m =>
        m.id === id ? { ...m, [field]: value } : m
      )
    );
  };

  return (
    <div className="advanced-spectro-options">
      {/* Collapsible Trigger */}
      <button
        onClick={() => onVisibilityChange(!visible)}
        className="w-full flex items-center justify-between p-4 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center space-x-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span>Addition/Dilution Settings</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
            Power User
          </span>
          <svg
            className={`w-4 h-4 transform transition-transform ${visible ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* Collapsible Content */}
      {visible && (
        <div className="mt-4 bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Addition/Dilution Settings
            </h2>
            {onDetach && (
              <button
                onClick={onDetach}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Detach
              </button>
            )}
          </div>

          <p className="text-sm text-gray-600 mb-6">
            Configure suggestion generation parameters and raw material constraints.
          </p>

          <div className="space-y-6">
            {isLinked ? (
              <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <span className="text-sm text-blue-800">
                  {selectedElements.length} elements selected, {rawMaterials.length} materials configured
                </span>
                <button
                  onClick={onDetach}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Detach
                </button>
              </div>
            ) : (
              <>
                {/* Target Chemistry Element Selection */}
                <div className="p-4 border rounded-lg bg-gray-50">
                  <div className="mb-4">
                    <label className="text-base font-medium">Elements</label>
                    <p className="text-sm text-gray-600 mt-1">
                      Select elements to be considered for Addition/Dilution suggestions
                    </p>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {availableElements.map((element) => (
                      <div key={element} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`element-${element}`}
                          checked={selectedElements.includes(element)}
                          onChange={(e) => handleElementToggle(element, e.target.checked)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <label
                          htmlFor={`element-${element}`}
                          className="text-sm font-medium cursor-pointer"
                        >
                          {element}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Raw Materials Configuration */}
                <div className="p-4 border rounded-lg bg-gray-50">
                  <div className="mb-4">
                    <label className="text-base font-medium">Raw Material Min/Max</label>
                    <p className="text-sm text-gray-600 mt-1">
                      Add raw materials with min/max percentage for addition/dilution
                    </p>
                  </div>

                  {/* Existing Raw Materials */}
                  {rawMaterials.length > 0 && (
                    <div className="space-y-3 mb-4">
                      <label className="text-base font-medium">Configured Materials</label>
                      {rawMaterials.map((material) => (
                        <div key={material.id} className="flex items-center space-x-3 p-3 border rounded-lg bg-white">
                          <div className="flex-1">
                            <div className="text-sm font-medium">{material.materialName}</div>
                            <div className="text-xs text-gray-500">{material.materialType}</div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <label className="text-sm text-gray-500">Min %:</label>
                            <input
                              type="number"
                              step="0.01"
                              value={material.min}
                              onChange={(e) => updateMaterial(material.id, 'min', parseFloat(e.target.value) || 0)}
                              className="w-20 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="0.0"
                            />
                          </div>
                          <div className="flex items-center space-x-2">
                            <label className="text-sm text-gray-500">Max %:</label>
                            <input
                              type="number"
                              step="0.01"
                              value={material.max}
                              onChange={(e) => updateMaterial(material.id, 'max', parseFloat(e.target.value) || 0)}
                              className="w-20 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="0.0"
                            />
                          </div>
                          <button
                            onClick={() => removeMaterial(material.id)}
                            className="text-red-600 hover:text-red-800 p-1"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add New Material */}
                  <div className="p-4 border-2 border-dashed rounded-lg bg-gray-50">
                    <label className="text-base font-medium mb-3 block">Add New Material</label>
                    <div className="flex items-center space-x-3">
                      <select
                        value={newMaterial.materialName}
                        onChange={(e) => setNewMaterial(prev => ({ ...prev, materialName: e.target.value }))}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select raw material...</option>
                        {RAW_MATERIALS_DATA.map((material) => (
                          <option key={material.name} value={material.name}>
                            {material.name} ({material.type})
                          </option>
                        ))}
                      </select>
                      <div className="flex items-center space-x-2">
                        <label className="text-sm text-gray-500">Min %:</label>
                        <input
                          type="number"
                          step="0.01"
                          value={newMaterial.min}
                          onChange={(e) => setNewMaterial(prev => ({ ...prev, min: parseFloat(e.target.value) || 0 }))}
                          className="w-20 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="0.0"
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <label className="text-sm text-gray-500">Max %:</label>
                        <input
                          type="number"
                          step="0.01"
                          value={newMaterial.max}
                          onChange={(e) => setNewMaterial(prev => ({ ...prev, max: parseFloat(e.target.value) || 0 }))}
                          className="w-20 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="0.0"
                        />
                      </div>
                                             <Button
                         variant="primary"
                         onClick={addRawMaterial}
                         disabled={!newMaterial.materialName}
                       >
                         <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                         </svg>
                       </Button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedSpectroOptions;
