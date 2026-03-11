import React from 'react';
import { useSettingsStore } from '../../store/settingsStore';
import { DataSourceManager } from './DataSourceManager';
import { useTranslations } from '../../i18n/translations';
import type { Language } from '../../i18n/translations';
import './SettingsPanel.css';

export const SettingsPanel: React.FC = () => {
  const { 
    theme, 
    language, 
    showAdultContent, 
    contentTypeFilters,
    setTheme, 
    setLanguage, 
    setShowAdultContent,
    setShowMovies,
    setShowSeries
  } = useSettingsStore();
  const t = useTranslations(language as Language);

  const handleThemeChange = (newTheme: 'dark' | 'light') => {
    setTheme(newTheme);
  };

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLanguage(e.target.value as Language);
  };

  const handleAdultContentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setShowAdultContent(e.target.checked);
  };

  const handleShowMoviesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setShowMovies(e.target.checked);
  };

  const handleShowSeriesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setShowSeries(e.target.checked);
  };

  return (
    <div className="settings-panel">
      <div className="settings-panel-header">
        <h1 className="settings-panel-title">{t.settings.title}</h1>
      </div>

      <div className="settings-panel-content">
        {/* Theme settings */}
        <div className="settings-section">
          <h2 className="settings-section-title">{t.settings.theme}</h2>
          
          <div className="settings-option">
            <label className="settings-option-label">{t.settings.theme}</label>
            <div className="settings-theme-toggle">
              <button
                className={`settings-theme-button ${theme === 'dark' ? 'active' : ''}`}
                onClick={() => handleThemeChange('dark')}
              >
                🌙 {t.settings.themeDark}
              </button>
              <button
                className={`settings-theme-button ${theme === 'light' ? 'active' : ''}`}
                onClick={() => handleThemeChange('light')}
              >
                ☀️ {t.settings.themeLight}
              </button>
            </div>
          </div>
        </div>

        {/* Language settings */}
        <div className="settings-section">
          <h2 className="settings-section-title">{t.settings.language}</h2>
          
          <div className="settings-option">
            <label htmlFor="language-select" className="settings-option-label">
              {t.settings.language}
            </label>
            <select
              id="language-select"
              className="settings-select"
              value={language}
              onChange={handleLanguageChange}
            >
              <option value="ru">{t.settings.languageRu}</option>
              <option value="en">{t.settings.languageEn}</option>
              <option value="de">{t.settings.languageDe}</option>
            </select>
          </div>
        </div>

        {/* Content settings */}
        <div className="settings-section">
          <h2 className="settings-section-title">{t.settings.contentTypeFilters}</h2>
          
          <div className="settings-option">
            <label htmlFor="show-movies-checkbox" className="settings-option-label">
              <input
                id="show-movies-checkbox"
                type="checkbox"
                checked={contentTypeFilters.showMovies}
                onChange={handleShowMoviesChange}
                style={{ marginRight: '8px' }}
              />
              {t.settings.showMovies}
            </label>
          </div>

          <div className="settings-option">
            <label htmlFor="show-series-checkbox" className="settings-option-label">
              <input
                id="show-series-checkbox"
                type="checkbox"
                checked={contentTypeFilters.showSeries}
                onChange={handleShowSeriesChange}
                style={{ marginRight: '8px' }}
              />
              {t.settings.showSeries}
            </label>
          </div>
          
          <div className="settings-option">
            <label htmlFor="adult-content-checkbox" className="settings-option-label">
              <input
                id="adult-content-checkbox"
                type="checkbox"
                checked={showAdultContent}
                onChange={handleAdultContentChange}
                style={{ marginRight: '8px' }}
              />
              {t.settings.showAdultContent}
            </label>
          </div>
        </div>

        {/* Data sources */}
        <div className="settings-section">
          <DataSourceManager />
        </div>

        {/* App info */}
        <div className="settings-section">
          <h2 className="settings-section-title">{t.settings.about}</h2>
          
          <div className="settings-info">
            <div className="settings-info-item">
              <span className="settings-info-label">Версия</span>
              <span className="settings-info-value">2.0.0</span>
            </div>
            <div className="settings-info-item">
              <span className="settings-info-label">Тип</span>
              <span className="settings-info-value">Progressive Web App</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
