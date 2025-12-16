import React from "react";
import { Footer } from "../../../../shared/component";

interface NewPageFooterProps {
  isSubmitting: boolean;
  isLoading: boolean;
  onCancel: () => void;
  onSubmit: () => void;
}

export const NewPageFooter: React.FC<NewPageFooterProps> = ({
  isSubmitting,
  isLoading,
  onCancel,
  onSubmit,
}) => {
  return (
    <Footer>
      <button
        data-variant="secondary"
        data-active="false"
        aria-busy={isSubmitting ? "true" : "false"}
        className="shared-footer-btn shared-footer-btn--secondary"
        type="button"
        aria-label="Cancel creation"
        onClick={onCancel}
        disabled={isSubmitting}
      >
        <i className="ri-close-line"></i>
        CANCEL
      </button>
      <button
        data-variant="primary"
        data-active="false"
        aria-busy={isSubmitting ? "true" : "false"}
        className="shared-footer-btn shared-footer-btn--primary"
        type="button"
        onClick={onSubmit}
        disabled={isSubmitting || isLoading}
      >
        {isSubmitting ? (
          <>
            <i className="ri-loader-4-line footer-loading-icon"></i>
            SAVING...
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

