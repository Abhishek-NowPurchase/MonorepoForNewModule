import React from "react";

export interface CloseIconProps {
  width?: number;
  height?: number;
  strokeWidth?: number;
}

export const CloseIcon: React.FC<CloseIconProps> = ({
  width = 24,
  height = 24,
  strokeWidth = 2,
}) => (
  <svg width={width} height={height} viewBox="0 0 24 24" fill="none">
    <path
      d="M18 6L6 18M6 6L18 18"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

