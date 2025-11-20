import React from "react";
import { BackIcon, DownloadIcon } from "../../../../shared/component";

interface DetailFooterProps {
  onBack: () => void;
  onDownloadPDF: () => void;
  onEdit: () => void;
}

export const DetailFooter: React.FC<DetailFooterProps> = ({
  onBack,
  onDownloadPDF,
  onEdit,
}) => (
  <div className="detail-footer">
    <button
      onClick={onBack}
      className="detail-footer-btn detail-footer-btn--secondary"
    >
      <BackIcon />
      BACK
    </button>
    <div className="detail-footer-actions">
      <button
        onClick={onDownloadPDF}
        className="detail-footer-btn detail-footer-btn--secondary"
      >
        <DownloadIcon />
        DOWNLOAD PDF
      </button>
      <button
        onClick={onEdit}
        className="detail-footer-btn detail-footer-btn--primary"
      >
        EDIT
      </button>
    </div>
  </div>
);
