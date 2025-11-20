import React from "react";
import { CloseIcon } from "../icons";
import "./FilterDrawer.css";

export interface FilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export const FilterDrawer: React.FC<FilterDrawerProps> = ({
  isOpen,
  onClose,
  title = "Filters",
  children,
  className = "",
}) => {
  if (!isOpen) return null;

  return (
    <>
      <div className="filter-drawer-overlay" onClick={onClose} />
      <div className="filter-drawer-container">
        <div className={`filter-drawer ${className}`}>
          <button className="filter-drawer-close-button" onClick={onClose}>
            <CloseIcon width={24} height={24} strokeWidth={2} />
          </button>

          <div className="filter-drawer-header">{title}</div>
          <div className="filter-drawer-divider" />

          <div className="filter-drawer-body">{children}</div>
        </div>
      </div>
    </>
  );
};

