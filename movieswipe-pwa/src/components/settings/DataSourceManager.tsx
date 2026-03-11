import React, { useState } from 'react';
import { useSettingsStore } from '../../store/settingsStore';
import { syncService, type SyncProgress } from '../../services/syncService';
import { useMovieStore } from '../../store/movieStore';
import { useLanguage } from '../../hooks/useLanguage';
import { LoadingSpinner } from '../common/LoadingSpinner';
import './DataSourceManager.css';

export const DataSourceManager: React.FC = () => {
  const { dataSources, lastSync, tmdbApiKey, toggleDataSource, setTmdbApiKey } = useSettingsStore();
  const { movies, loadMovies } = useMovieStore();
  const { t } = useLanguage();
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [progress, setProgress] = useState<SyncProgress | null>(null);
  const [apiKeyInput, setApiKeyInput] = useState(tmdbApiKey || '');
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);

  const handleToggleSource = (source: 'imdb' | 'kinopoisk') => {
    toggleDataSource(source);
    
    // Show API key input if IMDB is enabled and no key is set
    if (source === 'imdb' && !tmdbApiKey) {
      setShowApiKeyInput(true);
    }
  };

  const handleSaveApiKey = () => {
    if (apiKeyInput.trim()) {
      setTmdbApiKey(apiKeyInput.trim());
      setShowApiKeyInput(false);
    }
  };

  const handleSync = async () => {
    setIsSyncing(true);
    setSyncError(null);
    setProgress(null);

    try {
      // Check if IMDB is selected and API key is required
      if (dataSources.imdb && !tmdbApiKey) {
        setSyncError('Для загрузки из IMDB/TMDB требуется API ключ');
        setShowApiKeyInput(true);
        setIsSyncing(false);
        return;
      }

      // Set progress callback
      syncService.setProgressCallback((p) => {
        setProgress(p);
      });

      // Sync from selected sources
      const result = await syncService.syncFromSources(dataSources, tmdbApiKey);
      
      if (result.success) {
        // Обновляем timestamp последней синхронизации
        useSettingsStore.getState().updateLastSync();
        
        // Перезагружаем фильмы в store
        await loadMovies();
        
        console.log(`✅ Sync successful: ${result.moviesAdded} movies loaded`);
        setProgress({
          current: result.moviesAdded,
          total: result.moviesAdded,
          status: `Загружено ${result.moviesAdded} фильмов`
        });
      } else {
        setSyncError(result.error || 'Ошибка синхронизации');
      }
    } catch (error) {
      setSyncError(error instanceof Error ? error.message : 'Ошибка синхронизации');
    } finally {
      setIsSyncing(false);
      syncService.clearProgressCallback();
      
      // Clear progress after 3 seconds
      setTimeout(() => {
        setProgress(null);
      }, 3000);
    }
  };

  const formatLastSync = (timestamp: string | null): string => {
    if (!timestamp) return 'Никогда';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Только что';
    if (diffMins < 60) return `${diffMins} мин назад`;
    if (diffHours < 24) return `${diffHours} ч назад`;
    if (diffDays < 7) return `${diffDays} дн назад`;
    
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="data-source-manager">
      <h3 className="data-source-manager-title">{t.settings.dataSource}</h3>
      
      <div className="data-source-manager-sources">
        <label className="data-source-checkbox">
          <input
            type="checkbox"
            checked={dataSources.imdb}
            onChange={() => handleToggleSource('imdb')}
            disabled={isSyncing}
          />
          <span className="data-source-checkbox-label">
            <span className="data-source-checkbox-name">{t.settings.tmdbSource}</span>
            <span className="data-source-checkbox-description">
              Международная база данных фильмов (требуется API ключ)
            </span>
          </span>
        </label>

        <label className="data-source-checkbox">
          <input
            type="checkbox"
            checked={dataSources.kinopoisk}
            onChange={() => handleToggleSource('kinopoisk')}
            disabled={isSyncing}
          />
          <span className="data-source-checkbox-label">
            <span className="data-source-checkbox-name">{t.settings.kinopoiskSource}</span>
            <span className="data-source-checkbox-description">
              Российская база данных фильмов (в разработке)
            </span>
          </span>
        </label>
      </div>

      {(showApiKeyInput || (dataSources.imdb && !tmdbApiKey)) && (
        <div className="data-source-manager-api-key">
          <label className="data-source-manager-api-key-label">
            {t.settings.apiKey}:
            <a 
              href="https://www.themoviedb.org/settings/api" 
              target="_blank" 
              rel="noopener noreferrer"
              className="data-source-manager-api-key-link"
            >
              Получить ключ
            </a>
          </label>
          <div className="data-source-manager-api-key-input-group">
            <input
              type="text"
              value={apiKeyInput}
              onChange={(e) => setApiKeyInput(e.target.value)}
              placeholder={t.settings.apiKeyPlaceholder}
              className="data-source-manager-api-key-input"
              disabled={isSyncing}
            />
            <button
              onClick={handleSaveApiKey}
              disabled={!apiKeyInput.trim() || isSyncing}
              className="data-source-manager-api-key-save"
            >
              {t.common.save}
            </button>
          </div>
        </div>
      )}

      <div className="data-source-manager-sync">
        <div className="data-source-manager-sync-info">
          <div className="data-source-manager-sync-row">
            <span className="data-source-manager-sync-label">Последняя синхронизация:</span>
            <span className="data-source-manager-sync-time">
              {formatLastSync(lastSync)}
            </span>
          </div>
          <div className="data-source-manager-sync-row">
            <span className="data-source-manager-sync-label">Фильмов в базе:</span>
            <span className="data-source-manager-sync-count">
              {movies.length.toLocaleString('ru-RU')}
            </span>
          </div>
        </div>

        <button
          className="data-source-manager-sync-button"
          onClick={handleSync}
          disabled={isSyncing || (!dataSources.imdb && !dataSources.kinopoisk)}
        >
          {isSyncing ? (
            <>
              <LoadingSpinner size="small" />
              <span>{t.common.loading}</span>
            </>
          ) : (
            <>
              <span>🔄</span>
              <span>{t.settings.updateCatalog}</span>
            </>
          )}
        </button>
      </div>

      {progress && (
        <div className="data-source-manager-progress">
          <div className="data-source-manager-progress-bar">
            <div 
              className="data-source-manager-progress-fill"
              style={{ width: `${(progress.current / progress.total) * 100}%` }}
            />
          </div>
          <div className="data-source-manager-progress-text">
            {progress.status}
          </div>
        </div>
      )}

      {syncError && (
        <div className="data-source-manager-error">
          ⚠️ {syncError}
        </div>
      )}
    </div>
  );
};
