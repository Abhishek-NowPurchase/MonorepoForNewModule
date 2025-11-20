import React from "react";
import { Loader, EmptyState } from "../../../../shared/component";
import { usePDFDownload } from "../../../../shared/hooks";
import { DetailFooter } from "./DetailFooter";
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

      <DetailFooter
        onBack={onBack}
        onDownloadPDF={handleLogSheetPDFDownload}
        onEdit={onEdit}
      />
    </div>
  );
};

export default DetailComponent;
