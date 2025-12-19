import React from 'react';
import './ErrorDisplay.css';

export interface ErrorDisplayProps {
  title?: string;
  message: string;
  onBack: () => void;
  backButtonText?: string;
  className?: string;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  title = 'Error',
  message,
  onBack,
  backButtonText = 'Back to Listing',
  className = '',
}) => (
  <div className={`error-display-container ${className}`}>
    <div className="error-display-content">
      <div className="error-icon">
        <svg
          width="64"
          height="64"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
          <path
            d="M12 8V12M12 16H12.01"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </div>
      <h1 className="error-title">{title}</h1>
      <p className="error-message">{message}</p>
      <button onClick={onBack} className="error-back-button">
        {backButtonText}
      </button>
    </div>
  </div>
);

