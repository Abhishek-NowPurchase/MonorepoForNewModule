import React, { useRef } from "react";
import html2pdf from "html2pdf.js";
import { Loader } from "../../../../shared/component";
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
  const contentRef = useRef<HTMLDivElement>(null);

  const handleDownloadPDF = async () => {
    if (!contentRef.current) return;

    const element = contentRef.current;
    
    try {
      await html2pdf()
        .set({
          margin: [0.2, 0.2, 0.2, 0.2],
          filename: `log-sheet-${new Date().getTime()}.pdf`,
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: { scale: 2 },
          jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
        })
        .from(element)
        .save();
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate PDF. Please try again.");
    }
  };
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
      <div className="page-container">
        <div className="detail-container">
          <div className="empty-state">
            <p>{error || "Log sheet preview not found"}</p>
            <button onClick={onBack} className="back-button">
              Back to List
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="detail-content" style={{ paddingBottom: '80px' }}>
        <div ref={contentRef} dangerouslySetInnerHTML={{ __html: htmlContent }} />
      </div>
      
      {/* Fixed Footer */}
      <div className="detail-footer">
        <button onClick={onBack} className="detail-footer-btn detail-footer-btn--secondary">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path
              d="M12 5L7 10L12 15"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          BACK
        </button>
        <div className="detail-footer-actions">
          <button onClick={handleDownloadPDF} className="detail-footer-btn detail-footer-btn--secondary">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M8 11L8 2M8 11L5 8M8 11L11 8M2 13L2 14C2 14.5523 2.44772 15 3 15L13 15C13.5523 15 14 14.5523 14 14L14 13"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            DOWNLOAD PDF
          </button>
          <button onClick={onEdit} className="detail-footer-btn detail-footer-btn--primary">
            EDIT
          </button>
        </div>
      </div>
    </div>
  );
};

export default DetailComponent;
