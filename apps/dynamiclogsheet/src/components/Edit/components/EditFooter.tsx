import React from "react";
import { Footer } from "../../../../../shared/component";
import "../../../pages/Edit/Edit.scss";

interface EditFooterProps {
  isSaving: boolean;
  isLoading: boolean;
  isMultiStep: boolean;
  selectedSectionIndex: number;
  totalSections: number;
  onCancel: () => void;
  onSave: () => void;
}

export const EditFooter: React.FC<EditFooterProps> = ({
  isSaving,
  isLoading,
  isMultiStep,
  selectedSectionIndex,
  totalSections,
  onCancel,
  onSave,
}) => {
  const showContinue = isMultiStep && selectedSectionIndex < totalSections - 1;

  return (
    <Footer>
      <button
        data-variant="secondary"
        data-active="false"
        aria-busy={isSaving ? "true" : "false"}
        className="shared-footer-btn shared-footer-btn--secondary"
        type="button"
        aria-label="Creation cancelled"
        onClick={onCancel}
        disabled={isSaving}
      >
        <i className="ri-close-line"></i>
        CANCEL
      </button>
      <button
        data-variant="primary"
        data-active="false"
        aria-busy={isSaving ? "true" : "false"}
        className="shared-footer-btn shared-footer-btn--primary"
        type="button"
        onClick={onSave}
        disabled={isSaving || isLoading}
      >
        {isSaving ? (
          <>
            <i className="ri-loader-4-line footer-loading-icon"></i>
            SAVING...
          </>
        ) : showContinue ? (
          <>
            <i className="ri-check-line"></i>
            CONTINUE TO STEP {selectedSectionIndex + 2}
          </>
        ) : (
          <>
            <i className="ri-check-line"></i>
            SUBMIT
          </>
        )}
      </button>
    </Footer>
  );
};

