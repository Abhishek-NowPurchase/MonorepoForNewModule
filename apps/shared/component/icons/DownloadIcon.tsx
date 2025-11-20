import React from "react";

export interface DownloadIconProps {
  width?: number;
  height?: number;
}

export const DownloadIcon: React.FC<DownloadIconProps> = ({
  width = 16,
  height = 16,
}) => (
  <svg width={width} height={height} viewBox="0 0 16 16" fill="none">
    <path
      d="M8 11L8 2M8 11L5 8M8 11L11 8M2 13L2 14C2 14.5523 2.44772 15 3 15L13 15C13.5523 15 14 14.5523 14 14L14 13"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

