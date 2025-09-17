import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  selectGradeState, 
  selectBTCChoice,
  setBTCChoice,
  updateElement,
  toggleTolerance 
} from '../store/gradeSlice';
import BTCDecisionGate from './BTCDecisionGate';
import TargetChemistryCard from './TargetChemistryCard';

// 🔗 BTC AND CHEMISTRY SECTION COMPONENT
const BtcAndChemistrySection = ({
  isLinked = false,
  summary = "",
  onDetach,
  onRelink,
}) => {
  const dispatch = useDispatch();
  const gradeState = useSelector(selectGradeState);
  const { 
    btcChoice, 
    rememberChoice, 
    elements, 
    toleranceEnabled, 
    gradeOverview 
  } = gradeState;

  const handleBTCChoiceChange = (choice, remember) => {
    dispatch(setBTCChoice({ choice, remember }));
  };

  const handleElementsChange = (newElements) => {
    // Update each element individually to maintain Redux state
    Object.entries(newElements).forEach(([symbol, element]) => {
      if (elements[symbol]) {
        // Update existing element
        Object.entries(element).forEach(([field, value]) => {
          dispatch(updateElement({ elementSymbol: symbol, field, value }));
        });
      }
    });
  };

  const handleToleranceEnabledChange = (enabled) => {
    dispatch(toggleTolerance(enabled));
  };

  // 🎯 LINKED STATE - Show summary view
  if (isLinked) {
    return (
      <div className="btc-chemistry-section bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Bath Chemistry & Target Chemistry
          </h2>
          <div className="flex items-center space-x-2">
            <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
              Linked
            </span>
            <button
              onClick={onDetach}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Detach
            </button>
          </div>
        </div>
        
        <div className="p-4 bg-gray-50 rounded-lg">
          <TargetChemistryCard
            btcEnabled={btcChoice === 'with'}
            elements={elements}
            toleranceEnabled={toleranceEnabled}
            gradeType={gradeOverview.gradeType}
            onElementsChange={handleElementsChange}
            onToleranceEnabledChange={handleToleranceEnabledChange}
            isLinked={true}
            onDetach={onDetach}
            summary={summary}
            showHeader={false}
            displayMode="summary"
          />
        </div>
      </div>
    );
  }

  // 🎯 DETACHED STATE - Show full editable form
  return (
    <div className="btc-chemistry-section space-y-6">
      {/* Show relink option when detached */}
      {!isLinked && onRelink && (
        <div className="flex justify-end">
          <button
            onClick={onRelink}
            className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            Relink to Grade
          </button>
        </div>
      )}

      {/* BTC Decision Gate */}
      <BTCDecisionGate
        btcChoice={btcChoice}
        rememberChoice={rememberChoice}
        onChoiceChange={handleBTCChoiceChange}
      />

      {/* Target Chemistry Card - Full Editable Form */}
      <TargetChemistryCard
        btcEnabled={btcChoice === 'with'}
        elements={elements}
        toleranceEnabled={toleranceEnabled}
        gradeType={gradeOverview.gradeType}
        onElementsChange={handleElementsChange}
        onToleranceEnabledChange={handleToleranceEnabledChange}
        isLinked={false} // Always detached when this component is showing editable form
        showHeader={false} // Don't show separate header since we're combined
      />
    </div>
  );
};

export default BtcAndChemistrySection;
