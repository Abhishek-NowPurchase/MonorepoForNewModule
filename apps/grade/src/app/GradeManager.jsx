import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  selectGradeState,
  selectBTCChoice,
  selectSelectedModules,
  selectShowSuccessModal,
  showSuccessModal,
  resetForm,
} from "../store/gradeSlice";
import {
  validateGradeForm,
  getValidationSummary,
} from "../utils/gradeValidation";
// Import all components
import ModuleSelection from "../components/ModuleSelection";
import GradeOverview from "../components/GradeOverview";
import BtcAndChemistrySection from "../components/BtcAndChemistrySection";
import AdvancedSpectroOptions from "../components/AdvancedSpectroOptions";
import ChargemixData from "../components/ChargemixData";
import SuccessModal from "../components/SuccessModal";
import { Button } from "now-design-atoms";
import { gradeFormModel } from "../models/gradeFormModel";
import { comprehensiveGradeFormModel } from "../models/comprehensiveGradeFormModel";

// 🎯 MAIN GRADE MANAGER COMPONENT
const GradeManager = () => {
  const dispatch = useDispatch();
  const gradeState = useSelector(selectGradeState);
  const btcChoice = useSelector(selectBTCChoice);
  const selectedModules = useSelector(selectSelectedModules);
  const showSuccessModal = useSelector(selectShowSuccessModal);
  // 🔍 CHECK IF FORM CAN BE SUBMITTED
  const canSubmitForm = () => {
    // Use the new simple validation
    const validation = validateGradeForm(gradeState);
    return validation.isValid;
  };

  // 📋 GET VALIDATION STATUS
  const getFormStatus = () => {
    return getValidationSummary(gradeState);
  };

  // 🚀 HANDLE GRADE CREATION
  const handleCreateGrade = async () => {
    if (!canSubmitForm()) {
      const validation = getFormStatus();
      return;
    }

    try {
      // Here you would typically call your API

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Show success modal
      dispatch(showSuccessModal(true));
    } catch (error) {
      // Handle error silently
    }
  };

  // 🧹 RESET FORM
  const handleResetForm = () => {
    dispatch(resetForm());
  };

  // 🔄 LOAD BTC CHOICE FROM LOCAL STORAGE
  useEffect(() => {
    const savedBTCChoice = localStorage.getItem("btcChoice");
    if (
      savedBTCChoice &&
      (savedBTCChoice === "with" || savedBTCChoice === "without")
    ) {
      // Auto-populate BTC choice if user previously chose to remember
      // This would be handled by the BTC Decision component
    }
  }, []);

  // 📊 GET CURRENT VALIDATION STATUS
  const formStatus = getFormStatus();

  return (
    <div className="grade-manager min-h-screen">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* 🎯 HEADER */}
        <div className="grade-manager-header text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Grade Creation System
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Create and configure industrial material grades with advanced
            chemistry management
          </p>
        </div>

        {/* 🎛️ MODULE SELECTION */}
        <ModuleSelection />

        {/* 📊 GRADE OVERVIEW */}
        <GradeOverview />

        {/* 🔗 BTC AND CHEMISTRY SECTION - UNIFIED */}
        <BtcAndChemistrySection
          isLinked={false}
          summary=""
          onDetach={() => {}}
          onRelink={() => {}}
        />

        {/* 🔬 ADVANCED SPECTRO OPTIONS - Only show for SPECTRO module + BTC decision */}
        {selectedModules.includes("SPECTRO") && btcChoice !== null && (
          <AdvancedSpectroOptions
            visible={gradeState.advancedOptionsVisible}
            selectedElements={gradeState.selectedElements}
            rawMaterials={gradeState.rawMaterials}
            availableElements={Object.keys(gradeState.elements)}
            onVisibilityChange={(visible) =>
              dispatch({
                type: "grade/toggleAdvancedOptions",
                payload: visible,
              })
            }
            onElementSelectionChange={(elements) =>
              dispatch({
                type: "grade/updateSelectedElements",
                payload: elements,
              })
            }
            onRawMaterialsChange={(materials) =>
              dispatch({ type: "grade/updateRawMaterials", payload: materials })
            }
            isLinked={false}
            onDetach={() => {}}
            onRelink={() => {}}
          />
        )}

        {/* 🔋 CHARGEMIX DATA - Only show for IF module */}
        {selectedModules.includes("IF") && (
          <ChargemixData
            visible={gradeState.chargemixVisible}
            chargemixItems={gradeState.chargemixItems}
            onChargemixItemsChange={(items) =>
              dispatch({ type: "grade/updateChargemixItems", payload: items })
            }
            onVisibilityChange={(visible) =>
              dispatch({ type: "grade/toggleChargemix", payload: visible })
            }
            isLinked={false}
            onDetach={() => {}}
            onRelink={() => {}}
            summary=""
          />
        )}

        {/* 🚀 FORM ACTIONS */}
        <div className="grade-form-actions bg-white rounded-lg shadow-md p-8">
          <div className="flex gap-4 justify-center">
            <Button
              variant="primary"
              onClick={handleCreateGrade}
              disabled={!canSubmitForm()}
            >
              {gradeState.isLoading ? "Creating..." : "Create Grade"}
            </Button>

            <Button variant="secondary" onClick={handleResetForm}>
              Reset Form
            </Button>
          </div>
        </div>

        {/* 🎉 SUCCESS MODAL */}
        {showSuccessModal && <SuccessModal />}
      </div>
    </div>
  );
};

export default GradeManager;
