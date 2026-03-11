import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import './SearchBar.css';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({ 
  value, 
  onChange, 
  placeholder 
}) => {
  const [localValue, setLocalValue] = useState(value);
  const { t } = useLanguage();
  
  const defaultPlaceholder = placeholder || t.catalog.searchPlaceholder;

  // Debounce search with 200ms delay
  useEffect(() => {
    const timer = setTimeout(() => {
      onChange(localValue);
    }, 200);

    return () => clearTimeout(timer);
  }, [localValue, onChange]);

  const handleClear = () => {
    setLocalValue('');
    onChange('');
  };

  return (
    <div className="search-bar">
      <div className="search-bar-icon">🔍</div>
      <input
        type="text"
        className="search-bar-input"
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        placeholder={defaultPlaceholder}
      />
      {localValue && (
        <button 
          className="search-bar-clear"
          onClick={handleClear}
          aria-label={t.common.cancel}
        >
          ✕
        </button>
      )}
    </div>
  );
};
