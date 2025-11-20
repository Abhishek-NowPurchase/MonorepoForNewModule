import React from "react";
import { FormViewer } from "@react-form-builder/core";
import "./FormRenderer.scss";

export interface FormRendererProps {
  formJson: string;
  formName: string;
  getForm: () => string;
  initialData: Record<string, any>;
  viewWithCss: any;
  actions: any;
  handleFormDataChange?: (formData: any) => void;
  emptyMessage?: string;
  errorMessage?: string;
}

/**
 * Generic form renderer component that renders forms using @react-form-builder
 * 
 * @example
 * ```typescript
 * <FormRenderer
 *   formJson={formJson}
 *   formName="My Form"
 *   getForm={() => formJson}
 *   initialData={{}}
 *   viewWithCss={viewWithCss}
 *   actions={actions}
 *   handleFormDataChange={handleChange}
 * />
 * ```
 */
export const FormRenderer: React.FC<FormRendererProps> = ({
  formJson,
  formName,
  getForm,
  initialData,
  viewWithCss,
  actions,
  handleFormDataChange,
  emptyMessage = "No form data available.",
  errorMessage = "Error: Invalid form data format.",
}) => {
  if (!formJson || formJson.trim() === "") {
    return (
      <div className="form-renderer-empty">
        <p>{emptyMessage}</p>
      </div>
    );
  }

  try {
    // Validate JSON before rendering
    JSON.parse(formJson);
    return (
      <FormViewer
        view={viewWithCss}
        formName={formName}
        getForm={getForm}
        actions={actions}
        initialData={initialData}
        onFormDataChange={handleFormDataChange}
      />
    );
  } catch (e) {
    return (
      <div className="form-renderer-error">
        <p>{errorMessage}</p>
        <pre>{String(e)}</pre>
      </div>
    );
  }
};

export default FormRenderer;

