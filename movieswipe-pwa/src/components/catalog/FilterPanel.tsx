import React from 'react';
import type { Genre, Country, ContentType } from '../../types/movie';
import { ALL_GENRES } from '../../utils/genres';
import { TOP_COUNTRIES } from '../../utils/countries';
import { ALL_CONTENT_TYPES } from '../../utils/contentTypes';
import { MOODS, MOOD_LABELS } from '../../utils/constants';
import { useLanguage } from '../../hooks/useLanguage';
import { useSettingsStore } from '../../store/settingsStore';
import './FilterPanel.css';

interface FilterPanelProps {
  selectedGenres: Genre[];
  selectedCountries: string[];
  selectedContentTypes: ContentType[];
  selectedMoods: string[];
  ratingRange: [number, number];
  yearRange: [number, number];
  onGenresChange: (genres: Genre[]) => void;
  onCountriesChange: (countries: string[]) => void;
  onContentTypesChange: (types: ContentType[]) => void;
  onMoodsChange: (moods: string[]) => void;
  onRatingChange: (range: [number, number]) => void;
  onYearChange: (range: [number, number]) => void;
  onReset: () => void;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  selectedGenres,
  selectedCountries,
  selectedContentTypes,
  selectedMoods,
  ratingRange,
  yearRange,
  onGenresChange,
  onCountriesChange,
  onContentTypesChange,
  onMoodsChange,
  onRatingChange,
  onYearChange,
  onReset
}) => {
  const { t, getGenreName, getCountryName, getContentTypeName } = useLanguage();
  const { showAdultContent } = useSettingsStore();
  
  // Фильтруем жанры: скрываем эротику если showAdultContent = false
  const availableGenres = showAdultContent 
    ? ALL_GENRES 
    : ALL_GENRES.filter(g => g !== 'erotic');
  
  const handleGenreToggle = (genre: Genre) => {
    if (selectedGenres.includes(genre)) {
      onGenresChange(selectedGenres.filter(g => g !== genre));
    } else {
      onGenresChange([...selectedGenres, genre]);
    }
  };

  const handleCountryToggle = (country: string) => {
    if (selectedCountries.includes(country)) {
      onCountriesChange(selectedCountries.filter(c => c !== country));
    } else {
      onCountriesChange([...selectedCountries, country]);
    }
  };

  const handleContentTypeToggle = (type: ContentType) => {
    if (selectedContentTypes.includes(type)) {
      onContentTypesChange(selectedContentTypes.filter(t => t !== type));
    } else {
      onContentTypesChange([...selectedContentTypes, type]);
    }
  };

  const handleMoodToggle = (mood: string) => {
    if (selectedMoods.includes(mood)) {
      onMoodsChange(selectedMoods.filter(m => m !== mood));
    } else {
      onMoodsChange([...selectedMoods, mood]);
    }
  };

  const hasActiveFilters = 
    selectedGenres.length > 0 || 
    selectedCountries.length > 0 ||
    selectedContentTypes.length > 0 ||
    selectedMoods.length > 0 || 
    ratingRange[0] > 0 || 
    ratingRange[1] < 10 ||
    yearRange[0] > 1900 ||
    yearRange[1] < new Date().getFullYear();

  return (
    <div className="filter-panel">
      <div className="filter-panel-header">
        <h3 className="filter-panel-title">{t.catalog.filters}</h3>
        {hasActiveFilters && (
          <button className="filter-panel-reset" onClick={onReset}>
            {t.common.cancel}
          </button>
        )}
      </div>

      {/* Genres */}
      <div className="filter-section">
        <h4 className="filter-section-title">{t.catalog.genres}</h4>
        <div className="filter-chips">
          {availableGenres.map((genre) => (
            <button
              key={genre}
              className={`filter-chip ${selectedGenres.includes(genre) ? 'active' : ''}`}
              onClick={() => handleGenreToggle(genre)}
            >
              {getGenreName(genre)}
            </button>
          ))}
        </div>
      </div>

      {/* Countries */}
      <div className="filter-section">
        <h4 className="filter-section-title">{t.catalog.countries}</h4>
        <div className="filter-chips">
          {TOP_COUNTRIES.map((country) => (
            <button
              key={country}
              className={`filter-chip ${selectedCountries.includes(country) ? 'active' : ''}`}
              onClick={() => handleCountryToggle(country)}
            >
              {getCountryName(country as Country)}
            </button>
          ))}
        </div>
      </div>

      {/* Content Types */}
      <div className="filter-section">
        <h4 className="filter-section-title">{t.catalog.contentType}</h4>
        <div className="filter-chips">
          {ALL_CONTENT_TYPES.map((type) => (
            <button
              key={type}
              className={`filter-chip ${selectedContentTypes.includes(type) ? 'active' : ''}`}
              onClick={() => handleContentTypeToggle(type)}
            >
              {getContentTypeName(type)}
            </button>
          ))}
        </div>
      </div>

      {/* Moods */}
      <div className="filter-section">
        <h4 className="filter-section-title">Настроения</h4>
        <div className="filter-chips">
          {MOODS.map((mood) => (
            <button
              key={mood}
              className={`filter-chip ${selectedMoods.includes(mood) ? 'active' : ''}`}
              onClick={() => handleMoodToggle(mood)}
            >
              {MOOD_LABELS[mood]}
            </button>
          ))}
        </div>
      </div>

      {/* Rating */}
      <div className="filter-section">
        <h4 className="filter-section-title">
          {t.catalog.rating}: {ratingRange[0].toFixed(1)} - {ratingRange[1].toFixed(1)}
        </h4>
        <div className="filter-range">
          <input
            type="range"
            min="0"
            max="10"
            step="0.5"
            value={ratingRange[0]}
            onChange={(e) => onRatingChange([parseFloat(e.target.value), ratingRange[1]])}
            className="filter-range-input"
          />
          <input
            type="range"
            min="0"
            max="10"
            step="0.5"
            value={ratingRange[1]}
            onChange={(e) => onRatingChange([ratingRange[0], parseFloat(e.target.value)])}
            className="filter-range-input"
          />
        </div>
      </div>

      {/* Year */}
      <div className="filter-section">
        <h4 className="filter-section-title">
          {t.catalog.year}: {yearRange[0]} - {yearRange[1]}
        </h4>
        <div className="filter-range">
          <input
            type="range"
            min="1900"
            max={new Date().getFullYear()}
            step="1"
            value={yearRange[0]}
            onChange={(e) => onYearChange([parseInt(e.target.value), yearRange[1]])}
            className="filter-range-input"
          />
          <input
            type="range"
            min="1900"
            max={new Date().getFullYear()}
            step="1"
            value={yearRange[1]}
            onChange={(e) => onYearChange([yearRange[0], parseInt(e.target.value)])}
            className="filter-range-input"
          />
        </div>
      </div>
    </div>
  );
};
