import React from "react";
import "./EmptyState.css";

export interface EmptyStateProps {
  message: string;
  onBack: () => void;
  backButtonText?: string;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  message,
  onBack,
  backButtonText = "Back to List",
  className = "",
}) => (
  <div className={`page-container-empty-state ${className}`}>
    <div className="detail-container">
      <div className="empty-state">
        <p>{message}</p>
        <button onClick={onBack} className="back-button">
          {backButtonText}
        </button>
      </div>
    </div>
  </div>
);

