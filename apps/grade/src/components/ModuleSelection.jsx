import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectSelectedModules, toggleModule } from '../store/gradeSlice';
import { MODULE_CONFIG } from '../constants/gradeConstants';

// 🎛️ MODULE SELECTION COMPONENT
const ModuleSelection = () => {
  const dispatch = useDispatch();
  const selectedModules = useSelector(selectSelectedModules);

  const handleModuleToggle = (moduleId) => {
    // SPECTRO cannot be deselected
    if (moduleId === 'SPECTRO') return;
    
    // Toggle other modules
    dispatch(toggleModule(moduleId));
  };

  return (
    <div className="module-selection bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        Module Selection
      </h2>
      <p className="text-sm text-gray-600 mb-4">
        SPECTRO module is enabled by default. Select IF Kiosk if charge mixture management is required.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {MODULE_CONFIG.map((module) => {
          const isSelected = selectedModules.includes(module.id);
          
          return (
            <div
              key={module.id}
              className={`relative p-4 rounded-lg border transition-all cursor-pointer ${
                isSelected 
                  ? 'border-blue-500 bg-blue-50 shadow-sm' 
                  : 'border-gray-200 bg-white hover:bg-gray-50'
              }`}
              onClick={() => handleModuleToggle(module.id)}
            >
              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  id={`module-${module.id}`}
                  checked={isSelected}
                  onChange={() => handleModuleToggle(module.id)}
                  onClick={(e) => e.stopPropagation()}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-5 h-5 text-blue-600">
                      {module.icon === 'Beaker' && (
                        <svg fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M7 2a1 1 0 00-.707 1.707L7 4.414v9.586a1 1 0 01-.293.707l-4 4a.999.999 0 01-1.414 0l-4-4A1 1 0 010 14V4.414l.707-.707A1 1 0 011 2h5a1 1 0 011 1v1a1 1 0 11-2 0V3H7z" clipRule="evenodd" />
                        </svg>
                      )}
                      {module.icon === 'Magnet' && (
                        <svg fill="currentColor" viewBox="0 0 20 20">
                          <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
                        </svg>
                      )}
                    </div>
                    <span className="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded font-mono">
                      {module.name}
                    </span>
                  </div>
                  <h3 className="font-medium text-sm mb-1">{module.description}</h3>
                  <p className="text-xs text-gray-500 mb-2">
                    {module.businessImpact}
                  </p>
                  <div className="space-y-1">
                    {module.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-1">
                        <div className="w-1 h-1 rounded-full bg-blue-600" />
                        <span className="text-xs text-gray-500">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ModuleSelection;
