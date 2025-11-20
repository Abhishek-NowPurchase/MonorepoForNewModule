import React from "react";

export interface ResetIconProps {
  width?: number;
  height?: number;
  strokeWidth?: number;
}

export const ResetIcon: React.FC<ResetIconProps> = ({
  width = 16,
  height = 16,
  strokeWidth = 1.5,
}) => (
  <svg width={width} height={height} viewBox="0 0 16 16" fill="none">
    <path
      d="M12 4L4 12M4 4L12 12"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

