import React from "react";
import "./SkeletonLoader.css";

interface SkeletonLoaderProps {
  variant?: 'form' | 'table' | 'card';
  className?: string;
}

const SkeletonLoader = ({ 
  variant = 'form', 
  className = '' 
}: SkeletonLoaderProps) => {
  if (variant === 'form') {
    return (
      <div className={`skeleton-container ${className}`}>
        <div className="skeleton-header">
          <div className="skeleton-title"></div>
          <div className="skeleton-subtitle"></div>
        </div>
        <div className="skeleton-form">
          <div className="skeleton-section">
            <div className="skeleton-field"></div>
            <div className="skeleton-field"></div>
            <div className="skeleton-field"></div>
          </div>
          <div className="skeleton-section">
            <div className="skeleton-field"></div>
            <div className="skeleton-field"></div>
          </div>
          <div className="skeleton-section">
            <div className="skeleton-field"></div>
            <div className="skeleton-field"></div>
          </div>
        </div>
        <div className="skeleton-button"></div>
      </div>
    );
  }

  if (variant === 'table') {
    return (
      <div className={`skeleton-container ${className}`}>
        <div className="skeleton-table">
          <div className="skeleton-table-header">
            <div className="skeleton-table-cell"></div>
            <div className="skeleton-table-cell"></div>
            <div className="skeleton-table-cell"></div>
            <div className="skeleton-table-cell"></div>
          </div>
          {[...Array(5)].map((_, index) => (
            <div key={index} className="skeleton-table-row">
              <div className="skeleton-table-cell"></div>
              <div className="skeleton-table-cell"></div>
              <div className="skeleton-table-cell"></div>
              <div className="skeleton-table-cell"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <div className={`skeleton-container ${className}`}>
        <div className="skeleton-card">
          <div className="skeleton-card-header">
            <div className="skeleton-title"></div>
            <div className="skeleton-subtitle"></div>
          </div>
          <div className="skeleton-card-content">
            <div className="skeleton-field"></div>
            <div className="skeleton-field"></div>
            <div className="skeleton-field"></div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default SkeletonLoader;
