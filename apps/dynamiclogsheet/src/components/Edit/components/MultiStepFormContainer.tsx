import React from "react";
import { Stepper } from "../../../../../shared/component";
import type { StepperStep } from "../../../../../shared/component";
import { LogSheetSection } from "../../../../../shared/Api/dynamicLogSheet";
import { FormContent } from "./FormContent";
import "./MultiStepFormContainer.scss";

interface MultiStepFormContainerProps {
  stepperSteps: StepperStep[];
  selectedSectionIndex: number;
  setSelectedSectionIndex: (index: number) => void;
  currentSection: LogSheetSection | undefined;
  getCurrentSectionForm: () => string;
  getInitialDataForCurrentForm: () => Record<string, any>;
  viewWithCss: any;
  actions: any;
  handleFormDataChange: (formData: any) => void;
  logSheet: any;
}

export const MultiStepFormContainer: React.FC<MultiStepFormContainerProps> = ({
  stepperSteps,
  selectedSectionIndex,
  setSelectedSectionIndex,
  currentSection,
  getCurrentSectionForm,
  getInitialDataForCurrentForm,
  viewWithCss,
  actions,
  handleFormDataChange,
  logSheet,
}) => {
  return (
    <div className="multi-step-form-container">
      {/* Horizontal Stepper */}
      <Stepper
        steps={stepperSteps}
        activeStep={selectedSectionIndex}
        onStepClick={setSelectedSectionIndex}
        maxWidth="1200px"
      />

      {/* Section Content Area */}
      <div className="multi-step-content-area">
        {currentSection && (
          <div className="multi-step-content-wrapper">
            <FormContent
              formJson={getCurrentSectionForm()}
              formName={currentSection.section_name}
              getForm={getCurrentSectionForm}
              initialData={getInitialDataForCurrentForm()}
              viewWithCss={viewWithCss}
              actions={actions}
              handleFormDataChange={handleFormDataChange}
              logSheet={logSheet}
            />
          </div>
        )}
      </div>
    </div>
  );
};

