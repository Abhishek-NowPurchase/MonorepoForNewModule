import React from 'react';
import './Footer.css';

export interface FooterProps {
  children: React.ReactNode;
  className?: string;
}

const Footer: React.FC<FooterProps> = ({ children, className = '' }) => {
  return (
    <div className={`shared-footer ${className}`}>
      {children}
    </div>
  );
};

export default Footer;

