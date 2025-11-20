import React from "react";
import { FormRenderer } from "../../../../../shared/component";
import { LogSheet } from "../../../../../shared/Api/dynamicLogSheet";

interface FormContentProps {
  formJson: string;
  formName: string;
  getForm: () => string;
  initialData: Record<string, any>;
  viewWithCss: any;
  actions: any;
  handleFormDataChange: (formData: any) => void;
  logSheet: LogSheet | null;
}

/**
 * FormContent component - wrapper around shared FormRenderer
 * Provides LogSheet-specific defaults (formName fallback)
 */
export const FormContent: React.FC<FormContentProps> = ({
  formJson,
  formName,
  getForm,
  initialData,
  viewWithCss,
  actions,
  handleFormDataChange,
  logSheet,
}) => {
  return (
    <FormRenderer
      formJson={formJson}
      formName={formName || logSheet?.name || "Form"}
      getForm={getForm}
      initialData={initialData}
      viewWithCss={viewWithCss}
      actions={actions}
      handleFormDataChange={handleFormDataChange}
    />
  );
};

