import React from "react";
import { Loader, EmptyState, Footer, BackIcon, DownloadIcon } from "../../../../shared/component";
import { usePDFDownload } from "../../../../shared/hooks";
import "../../pages/Detail/Detail.scss";

interface DetailComponentProps {
  htmlContent: string | null;
  isLoading: boolean;
  error: string | null;
  onBack: () => void;
  onEdit: () => void;
}

const DetailComponent: React.FC<DetailComponentProps> = ({
  htmlContent,
  isLoading,
  error,
  onBack,
  onEdit,
}) => {
  const { contentRef, handleDownloadPDF } = usePDFDownload({
    showAlert: true,
  });

  // Custom PDF download handler with log sheet specific filename
  const handleLogSheetPDFDownload = () => {
    handleDownloadPDF({
      filename: `log-sheet-${new Date().getTime()}.pdf`,
    });
  };

  // Early returns for loading and error states
  if (isLoading) {
    return (
      <Loader
        size="medium"
        message="Loading log sheet preview..."
        fullScreen={true}
      />
    );
  }

  if (error || !htmlContent) {
    return (
      <EmptyState
        message={error || "Log sheet preview not found"}
        onBack={onBack}
      />
    );
  }

  return (
    <div className="page-container">
      <div className="detail-content" style={{ paddingBottom: "80px" }}>
        <div ref={contentRef} dangerouslySetInnerHTML={{ __html: htmlContent }} />
      </div>

      <Footer>
        <button
          onClick={onBack}
          className="shared-footer-btn shared-footer-btn--secondary"
        >
          <BackIcon />
          BACK
        </button>
        <div className="shared-footer-actions">
          <button
            onClick={handleLogSheetPDFDownload}
            className="shared-footer-btn shared-footer-btn--secondary"
          >
            <DownloadIcon />
            DOWNLOAD PDF
          </button>
          <button
            onClick={onEdit}
            className="shared-footer-btn shared-footer-btn--primary"
          >
            EDIT
          </button>
        </div>
      </Footer>
    </div>
  );
};

export default DetailComponent;
