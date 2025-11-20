import React from "react";

export interface BackIconProps {
  width?: number;
  height?: number;
}

export const BackIcon: React.FC<BackIconProps> = ({
  width = 20,
  height = 20,
}) => (
  <svg width={width} height={height} viewBox="0 0 20 20" fill="none">
    <path
      d="M12 5L7 10L12 15"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

