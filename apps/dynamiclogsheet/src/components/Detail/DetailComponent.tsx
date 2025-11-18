import React, { useRef } from "react";
import html2pdf from "html2pdf.js";
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
      <div className="page-container">
        <div className="detail-container">
          <div className="empty-state">
            <p>Loading log sheet preview...</p>
          </div>
        </div>
      </div>
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
      <div className="detail-header">
        <button onClick={onBack} className="back-button">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path
              d="M12 5L7 10L12 15"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Back
        </button>
        <h1 className="detail-title">Log Sheet Preview</h1>
        <div className="header-actions">
          <button onClick={handleDownloadPDF} className="download-button">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M8 11L8 2M8 11L5 8M8 11L11 8M2 13L2 14C2 14.5523 2.44772 15 3 15L13 15C13.5523 15 14 14.5523 14 14L14 13"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Download PDF
          </button>
          <button onClick={onEdit} className="edit-button">
            Edit
          </button>
        </div>
      </div>
      <div className="detail-content">
        <div ref={contentRef} dangerouslySetInnerHTML={{ __html: htmlContent }} />
      </div>
    </div>
  );
};

export default DetailComponent;
