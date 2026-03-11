import React from 'react';
import './MoodButton.css';

interface MoodButtonProps {
  label: string;
  icon: string;
  selected: boolean;
  onClick: () => void;
}

export const MoodButton: React.FC<MoodButtonProps> = ({
  label,
  icon,
  selected,
  onClick
}) => {
  return (
    <button
      className={`mood-button ${selected ? 'mood-button--selected' : ''}`}
      onClick={onClick}
      aria-pressed={selected}
      aria-label={label}
    >
      <span className="mood-button-icon">{icon}</span>
      <span className="mood-button-label">{label}</span>
    </button>
  );
};
