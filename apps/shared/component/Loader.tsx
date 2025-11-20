import React from 'react';
import './Loader.css';

export interface LoaderProps {
  size?: 'small' | 'medium' | 'large';
  message?: string;
  fullScreen?: boolean;
  className?: string;
}

const Loader = ({
  size = 'medium',
  message = 'Loading...',
  fullScreen = false,
  className = '',
}: LoaderProps) => {
  const sizeMap = {
    small: '32px',
    medium: '48px',
    large: '64px',
  };

  const spinnerSize = sizeMap[size];

  const content = (
    <div className={`loader-container ${className}`}>
      <div
        className="loader-spinner"
        style={{
          width: spinnerSize,
          height: spinnerSize,
        }}
      />
      {message && (
        <p className="loader-message">{message}</p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="loader-fullscreen">
        {content}
      </div>
    );
  }

  return content;
};

export default Loader;

