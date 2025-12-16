import React, { useRef, useEffect } from "react";
import { FormViewer } from "@react-form-builder/core";
import type { IFormViewer } from "@react-form-builder/core";
import "./FormRenderer.scss";

export interface FormRendererProps {
  formJson: string;
  formName: string;
  getForm: () => string;
  initialData: Record<string, any>;
  viewWithCss: any;
  actions: any;
  handleFormDataChange?: (formData: any) => void;
  viewerRef?: React.RefObject<IFormViewer | null>;
  sectionIndex?: number;
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
  viewerRef,
  sectionIndex = 0,
  emptyMessage = "No form data available.",
  errorMessage = "Error: Invalid form data format.",
}) => {
  // Store initial data in a ref so it doesn't change on every render
  // This prevents FormViewer from re-initializing when formData reference changes
  const initialDataRef = useRef(initialData);

  // Only update initial data when section changes, not when individual field values change
  useEffect(() => {
    initialDataRef.current = initialData;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sectionIndex]); // Only update when section changes, not on every field update

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
        key={`form-${sectionIndex}`}
        view={viewWithCss}
        formName={formName}
        getForm={getForm}
        actions={actions}
        initialData={initialDataRef.current}
        onFormDataChange={handleFormDataChange}
        viewerRef={viewerRef}
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

