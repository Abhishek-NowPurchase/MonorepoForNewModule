import React from "react";

import "../../styles/core-form.css";
import SectionRenderer from "./SectionRenderer";

interface ConfigurationFormProps {
  form: any;
  sections: any;
  handleSubmit: (values: any) => void;
  onCancel?: () => void;
  submitButtonText?: string;
  isSubmitting?: boolean;
}

const ConfigurationForm = ({
  form,
  sections,
  handleSubmit,
  onCancel,
  submitButtonText = "Submit",
  isSubmitting = false,
}: ConfigurationFormProps) => {
  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      window.location.href = "/grades";
    }
  };

  // 🔧 Real-time validation for Create Grade button
  const isFormValid = React.useMemo(() => {
    const values = form.values || {};
    const errors = form.errors || {};

    // 1. Check if there are any errors in the form
    if (Object.keys(errors).length > 0) {
      return false;
    }

    // 2. Grade Overview - Always Required Fields
    const requiredFields = ['tagId', 'gradeName', 'gradeCode', 'gradeType'];
    for (const field of requiredFields) {
      if (!values[field] || (typeof values[field] === 'string' && values[field].trim() === '')) {
        return false;
      }
    }

    // 3. Manual validation for custom renderer fields
    // Check rawMaterials field manually since it uses custom renderer
    if (values.bathChemistry === 'with' || values.bathChemistry === 'without') {
      const rawMaterials = values.rawMaterials || [];
      if (!Array.isArray(rawMaterials) || rawMaterials.length === 0) {
        return false;
      }
      
      // Check category validation
      const categories = rawMaterials.map((material: any) => material.category);
      const hasAdditives = categories.includes("ADDITIVES");
      const hasLadle = categories.includes("LADLE");
      const hasNodularizer = categories.includes("NODULARIZER");
      
      if (!hasAdditives || !hasLadle || !hasNodularizer) {
        const missingCategories: string[] = [];
        if (!hasAdditives) missingCategories.push("ADDITIVES");
        if (!hasLadle) missingCategories.push("LADLE");
        if (!hasNodularizer) missingCategories.push("NODULARIZER");
        return false;
      }
      
      // Check additionElements field
      const additionElements = values.additionElements || [];
      if (!Array.isArray(additionElements) || additionElements.length === 0) {
        return false;
      }
    }

    // 3. DI Parameters - Required ONLY if gradeType === "DI"
    if (values.gradeType === 'DI') {
      const diFields = ['tappingTempMin', 'tappingTempMax', 'mgTreatmentTime'];
      for (const field of diFields) {
        if (values[field] === null || values[field] === undefined || values[field] === '') {
          return false;
        }
      }
    }

    // 4. Bath Chemistry - Must have a value
    if (!values.bathChemistry || values.bathChemistry === '') {
      return false;
    }

    // 5. Addition Elements - At least one element must be selected
    const additionElements = values.additionElements || [];
    if (!Array.isArray(additionElements) || additionElements.length === 0) {
      return false;
    }
    return true;
  }, [form.values, form.errors]);

  return (
    <div className="configuration-form-container">
      <form onSubmit={handleSubmit} className="grade-form">
      <div className="form-content">
          {sections.sections?.length > 0 ? (
            sections.sections.map((section: any) => (
              <SectionRenderer
                key={section.id}
                sectionData={section}
                form={form}
              />
            ))
          ) : (
            <div className="no-sections">
              <p>No sections available</p>
            </div>
          )}
      </div>

        <div className="grade-form-footer">
          <button
            data-variant="secondary"
            data-active="false"
            aria-busy="false"
            className="grade-form-btn grade-form-btn--secondary"
            type="button"
            aria-label="Creation cancelled"
            onClick={handleCancel}
          >
            <i className="ri-close-line"></i>
            CANCEL
          </button>
          <button
            data-variant="primary"
            data-active="false"
            aria-busy={isSubmitting ? "true" : "false"}
            className="grade-form-btn grade-form-btn--primary"
            type="submit"
            // disabled={!isFormValid || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <i className="ri-loader-4-line" style={{ animation: 'spin 1s linear infinite' }}></i>
                {submitButtonText.includes('Update') ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              <>
                <i className="ri-check-line"></i>
                {submitButtonText}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ConfigurationForm;
