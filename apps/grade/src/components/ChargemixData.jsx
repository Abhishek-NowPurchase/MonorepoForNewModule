import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  selectGradeState,
  updateChargemixItems,
  toggleChargemix
} from '../store/gradeSlice';
import { RAW_MATERIALS_DATA } from '../constants/gradeConstants';
import { Button } from 'now-design-atoms';

// 🔋 CHARGEMIX DATA COMPONENT
const ChargemixData = ({
  visible = false,
  chargemixItems,
  onChargemixItemsChange,
  onVisibilityChange,
  isLinked = false,
  onDetach,
  onRelink,
  summary = ""
}) => {
  const dispatch = useDispatch();
  const [newItem, setNewItem] = useState({
    materialName: '',
    minQtyPercentage: 0,
    maxQtyPercentage: 0
  });
  const [open, setOpen] = useState(false);

  const addChargemixItem = () => {
    if (newItem.materialName) {
      const selectedMaterial = RAW_MATERIALS_DATA.find(m => m.name === newItem.materialName);
      if (selectedMaterial) {
        const item = {
          id: `chargemix_${Date.now()}`,
          materialName: newItem.materialName,
          materialType: selectedMaterial.type,
          minQtyPercentage: newItem.minQtyPercentage,
          maxQtyPercentage: newItem.maxQtyPercentage,
        };
        onChargemixItemsChange([...chargemixItems, item]);
        setNewItem({ materialName: '', minQtyPercentage: 0, maxQtyPercentage: 0 });
        setOpen(false);
      }
    }
  };

  const removeItem = (id) => {
    onChargemixItemsChange(chargemixItems.filter(item => item.id !== id));
  };

  const updateItem = (id, field, value) => {
    onChargemixItemsChange(
      chargemixItems.map(item =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  return (
    <div className="chargemix-data">
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
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          <span>Chargemix Data Configuration</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
            LogSheet Kiosk
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              Chargemix Data Configuration
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
            Configure raw material selection and quantities for heat plan creation in the kiosk.
          </p>

          <div className="space-y-6">
            {isLinked ? (
              <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <span className="text-sm text-blue-800">{summary}</span>
                <button
                  onClick={onDetach}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Detach
                </button>
              </div>
            ) : (
              <>
                {/* Existing Chargemix Items Table */}
                {chargemixItems.length > 0 && (
                  <div className="space-y-3">
                    <label className="text-base font-medium">Configured Materials</label>
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left p-2 font-medium">Material</th>
                            <th className="text-center p-2 font-medium">Type</th>
                            <th className="text-center p-2 font-medium">Min Qty %</th>
                            <th className="text-center p-2 font-medium">Max Qty %</th>
                            <th className="text-center p-2 font-medium w-16">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {chargemixItems.map((item) => (
                            <tr key={item.id} className="border-b hover:bg-gray-30">
                              <td className="p-2 font-medium">{item.materialName}</td>
                              <td className="p-2 text-center">
                                <span className="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                                  {item.materialType}
                                </span>
                              </td>
                              <td className="p-2">
                                <input
                                  type="number"
                                  step="0.1"
                                  min="0"
                                  max="100"
                                  value={item.minQtyPercentage}
                                  onChange={(e) => updateItem(item.id, 'minQtyPercentage', parseFloat(e.target.value) || 0)}
                                  className="w-20 text-center px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  placeholder="0.0"
                                />
                              </td>
                              <td className="p-2">
                                <input
                                  type="number"
                                  step="0.1"
                                  min="0"
                                  max="100"
                                  value={item.maxQtyPercentage}
                                  onChange={(e) => updateItem(item.id, 'maxQtyPercentage', parseFloat(e.target.value) || 0)}
                                  className="w-20 text-center px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  placeholder="0.0"
                                />
                              </td>
                              <td className="p-2 text-center">
                                <button
                                  onClick={() => removeItem(item.id)}
                                  className="text-red-600 hover:text-red-800 p-1"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Add New Chargemix Item */}
                <div className="p-4 border-2 border-dashed rounded-lg bg-gray-50">
                  <label className="text-base font-medium mb-3 block">Add New Material</label>
                  <div className="flex items-center space-x-3">
                    <select
                      value={newItem.materialName}
                      onChange={(e) => setNewItem(prev => ({ ...prev, materialName: e.target.value }))}
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
                        step="0.1"
                        min="0"
                        max="100"
                        value={newItem.minQtyPercentage}
                        onChange={(e) => setNewItem(prev => ({ ...prev, minQtyPercentage: parseFloat(e.target.value) || 0 }))}
                        className="w-20 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="0.0"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <label className="text-sm text-gray-500">Max %:</label>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="100"
                        value={newItem.maxQtyPercentage}
                        onChange={(e) => setNewItem(prev => ({ ...prev, maxQtyPercentage: parseFloat(e.target.value) || 0 }))}
                        className="w-20 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="0.0"
                      />
                    </div>
                                         <Button
                       variant="primary"
                       onClick={addChargemixItem}
                       disabled={!newItem.materialName}
                     >
                       <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                       </svg>
                     </Button>
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

export default ChargemixData;
