import React, { useState, useEffect } from "react";
import { LogSheet } from "../../../../shared/Api/dynamicLogSheet";
import { FormData } from "../../pages/Edit/hooks";
import { Loader } from "../../../../shared/component";
import { useFormBuilderConfig } from "../../../../shared/hooks";
import {
  useDateFieldKeys,
  useFormSections,
  useFormData,
  useFormJson,
  useFormSubmission,
} from "./hooks";
import {
  EditFooter,
  MultiStepFormContainer,
  SingleFormContainer,
} from "./components";
import "../../pages/Edit/Edit.scss";

interface EditComponentProps {
  logSheet: LogSheet | null;
  formData: FormData;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  onInputChange: (field: keyof FormData, value: string) => void;
  onCancel: () => void;
  onSave: (structuredFormData?: Record<string, any>) => void;
}

const EditComponent: React.FC<EditComponentProps> = ({
  logSheet,
  formData,
  isLoading,
  isSaving,
  error,
  onInputChange,
  onCancel,
  onSave,
}) => {
  const [selectedSectionIndex, setSelectedSectionIndex] = useState<number>(0);

  // Initialize form builder configuration
  const { viewWithCss } = useFormBuilderConfig();

  // Extract date field keys
  const { getDateFieldKeys } = useDateFieldKeys(logSheet);

  // Get sections and multi-step detection
  const { getAllSectionsJson, isMultiStep, stepperSteps } = useFormSections(
    logSheet
  );

  // Get form JSON functions (needed before useFormData)
  const { getForm, getCurrentSectionForm, getFormJson } = useFormJson({
    logSheet,
    getAllSectionsJson,
    selectedSectionIndex,
  });

  // Manage form data
  const {
    formValues,
    setFormValues,
    getInitialFormData,
    getInitialDataForCurrentForm,
  } = useFormData({
    logSheet,
    isMultiStep,
    selectedSectionIndex,
    getAllSectionsJson,
    getCurrentSectionFormJson: getCurrentSectionForm,
    getFormJson,
  });

  const currentSection = getAllSectionsJson[selectedSectionIndex];
  const currentSectionId = currentSection?.section_id;

  // Reset selected section index when sections change
  useEffect(() => {
    if (
      getAllSectionsJson.length > 0 &&
      selectedSectionIndex >= getAllSectionsJson.length
    ) {
      setSelectedSectionIndex(0);
    }
  }, [getAllSectionsJson.length, selectedSectionIndex]);

  // Handle form submission and data changes
  const {
    handleFormDataChange,
    onSubmit,
    actions,
    structureFormDataForAPI,
  } = useFormSubmission({
    logSheet,
    formValues,
    setFormValues,
    isMultiStep,
    getAllSectionsJson,
    getDateFieldKeys,
    onSave,
    currentSectionId,
  });

  // Handle footer save action
  const handleSave = () => {
    if (
      isMultiStep &&
      selectedSectionIndex < getAllSectionsJson.length - 1
    ) {
      // Move to next step
      setSelectedSectionIndex(selectedSectionIndex + 1);
    } else {
      // Submit the form - structureFormDataForAPI uses formValues directly
      // For multi-step, it uses formValues per section
      // For single form, it combines formValues under 'default' key
      const structuredData = structureFormDataForAPI();
      onSave(structuredData);
    }
  };

  // Show loader while loading
  if (isLoading) {
    return (
      <Loader size="medium" message="Loading form data..." fullScreen={true} />
    );
  }

  return (
    <div className="edit-component-container">
      {isMultiStep ? (
        <MultiStepFormContainer
          stepperSteps={stepperSteps}
          selectedSectionIndex={selectedSectionIndex}
          setSelectedSectionIndex={setSelectedSectionIndex}
          currentSection={currentSection}
          getCurrentSectionForm={getCurrentSectionForm}
          getInitialDataForCurrentForm={getInitialDataForCurrentForm}
          viewWithCss={viewWithCss}
          actions={actions}
          handleFormDataChange={handleFormDataChange}
          logSheet={logSheet}
        />
      ) : (
        <SingleFormContainer
          getForm={getForm}
          getFormJson={getFormJson}
          getInitialDataForCurrentForm={getInitialDataForCurrentForm}
          viewWithCss={viewWithCss}
          actions={actions}
          handleFormDataChange={handleFormDataChange}
          logSheet={logSheet}
        />
      )}

      <EditFooter
        isSaving={isSaving}
        isLoading={isLoading}
        isMultiStep={isMultiStep}
        selectedSectionIndex={selectedSectionIndex}
        totalSections={getAllSectionsJson.length}
        onCancel={onCancel}
        onSave={handleSave}
      />
    </div>
  );
};

export default EditComponent;
