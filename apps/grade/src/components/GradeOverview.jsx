import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectGradeState, updateGradeOverview } from '../store/gradeSlice';
import { GRADE_TYPES, BUSINESS_CONSTANTS, UI_CONSTANTS } from '../constants/gradeConstants';
import { TextInput, MinMax } from 'now-design-molecules';
import { Button } from 'now-design-atoms';

// 📊 GRADE OVERVIEW COMPONENT
const GradeOverview = () => {
  const dispatch = useDispatch();
  const gradeOverview = useSelector(selectGradeState).gradeOverview;

  const handleFieldChange = (field, value) => {
    dispatch(updateGradeOverview({ field, value }));
  };

  const handleTemperatureRangeChange = (range) => {
    if (range.min !== undefined) {
      dispatch(updateGradeOverview({ field: 'tappingTemperatureMin', value: range.min }));
    }
    if (range.max !== undefined) {
      dispatch(updateGradeOverview({ field: 'tappingTemperatureMax', value: range.max }));
    }
  };

  const isDuctileIron = gradeOverview.gradeType === 'DI';

  return (
    <div className="grade-overview bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        Grade Overview & Identification
      </h2>
      <p className="text-sm text-gray-600 mb-4">
        Define the basic grade information and metallurgical parameters.
      </p>
      
      {/* Basic Grade Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <TextInput
          id="tagId"
          label="Tag ID"
          value={gradeOverview.tagId}
          onChange={(e) => handleFieldChange('tagId', e.target.value)}
          placeholder="e.g., DI-001"
          required
          helperText="Unique alphanumeric identifier for spectrometer integration"
          regex={/^[A-Za-z0-9-]+$/}
          validateOn="blur"
        />

        <TextInput
          id="gradeName"
          label="Grade Name"
          value={gradeOverview.gradeName}
          onChange={(e) => handleFieldChange('gradeName', e.target.value)}
          placeholder="e.g., Ductile 60-40-18"
          required
          helperText="Descriptive name for the grade"
        />

        <TextInput
          id="gradeCode"
          label="Grade Code"
          value={gradeOverview.gradeCode}
          onChange={(e) => handleFieldChange('gradeCode', e.target.value)}
          placeholder="e.g., 60-40-18"
          required
          helperText="Standard industry code for the grade"
        />

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Grade Type <span className="text-red-500">*</span>
          </label>
          <select
            value={gradeOverview.gradeType}
            onChange={(e) => handleFieldChange('gradeType', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {GRADE_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Ductile Iron Specific Fields */}
      {isDuctileIron && (
        <>
          <div className="border-t pt-4">
            <div className="flex items-center gap-2 mb-4">
              <span className="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                DI Specific Parameters
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <MinMax
                id="tappingTemperature"
                label="Tapping Temperature Range (°C)"
                value={{
                  min: gradeOverview.tappingTemperatureMin,
                  max: gradeOverview.tappingTemperatureMax
                }}
                onChange={handleTemperatureRangeChange}
                domain={{ min: UI_CONSTANTS.MIN_TEMPERATURE, max: UI_CONSTANTS.MAX_TEMPERATURE }}
                step={UI_CONSTANTS.STEP_VALUES.TEMPERATURE}
                precision={0}
                unit="°C"
                helperText="Allowed operating temperature range for DI grades"
                fieldWidth={220}
              />

              <TextInput
                id="mgTreatmentTime"
                label="Mg Treatment Time (minutes)"
                value={gradeOverview.mgTreatmentTime?.toString() || ''}
                onChange={(e) => handleFieldChange('mgTreatmentTime', parseFloat(e.target.value) || 0)}
                placeholder="e.g., 1"
                type="number"
                inputMode="decimal"
                step={UI_CONSTANTS.STEP_VALUES.TIME}
                min="0.1"
                max="10"
                helperText="Duration between Mg treatment and beginning of pouring"
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default GradeOverview;
