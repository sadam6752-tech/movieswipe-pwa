import React from 'react';
import './LoadingSpinner.css';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  text?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'medium',
  text 
}) => {
  return (
    <div className="loading-spinner-container">
      <div className={`loading-spinner loading-spinner--${size}`}>
        <div className="loading-spinner-circle"></div>
      </div>
      {text && <p className="loading-spinner-text">{text}</p>}
    </div>
  );
};
