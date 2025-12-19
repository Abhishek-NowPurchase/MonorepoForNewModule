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
  const initialDataRef = useRef(initialData);
  console.log('initialData------>');

  useEffect(() => {
    initialDataRef.current = initialData;
  }, [sectionIndex]);

  if (!formJson || formJson.trim() === "") {
    return (
      <div className="form-renderer-empty">
        <p>{emptyMessage}</p>
      </div>
    );
  }

  try {
    JSON.parse(formJson);
    return (
      <div className="mui-skin">
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
      </div>
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
