import React from "react";
import { FormContent } from "./FormContent";
import "./SingleFormContainer.scss";

interface SingleFormContainerProps {
  getForm: () => string;
  getFormJson: string;
  getInitialDataForCurrentForm: () => Record<string, any>;
  viewWithCss: any;
  actions: any;
  handleFormDataChange: (formData: any) => void;
  logSheet: any;
}

export const SingleFormContainer: React.FC<SingleFormContainerProps> = ({
  getForm,
  getFormJson,
  getInitialDataForCurrentForm,
  viewWithCss,
  actions,
  handleFormDataChange,
  logSheet,
}) => {
  return (
    <div className="single-form-container">
      <FormContent
        formJson={getFormJson}
        formName={logSheet?.["from-name"] || logSheet?.name || "Form"}
        getForm={getForm}
        initialData={getInitialDataForCurrentForm()}
        viewWithCss={viewWithCss}
        actions={actions}
        handleFormDataChange={handleFormDataChange}
        logSheet={logSheet}
      />
    </div>
  );
};

