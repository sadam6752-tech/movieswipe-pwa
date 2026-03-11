import { useEffect, useState } from 'react';
import { useSettingsStore } from '../store/settingsStore';
import { syncService } from '../services/syncService';
import { movieService } from '../services/movieService';
import type { Genre } from '../types/movie';

/**
 * Hook для автоматической загрузки жанров при необходимости
 */
export const useGenreLoader = (selectedGenres: Genre[]) => {
  const { isGenreLoaded, addLoadedGenres } = useSettingsStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadMissingGenres = async () => {
      if (selectedGenres.length === 0) return;

      // Проверяем какие жанры не загружены
      const missingGenres: Genre[] = [];
      
      for (const genre of selectedGenres) {
        const loaded = isGenreLoaded(genre);
        const hasMovies = await movieService.hasMoviesOfGenre(genre);
        
        if (!loaded && !hasMovies) {
          missingGenres.push(genre);
        }
      }

      if (missingGenres.length === 0) return;

      // Загружаем недостающие жанры
      setIsLoading(true);
      setError(null);

      try {
        const result = await syncService.loadGenresFromLocalJSON(missingGenres);
        
        if (result.success) {
          addLoadedGenres(missingGenres);
        } else if (result.error) {
          setError(result.error);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ошибка загрузки жанров');
      } finally {
        setIsLoading(false);
      }
    };

    loadMissingGenres();
  }, [selectedGenres, isGenreLoaded, addLoadedGenres]);

  return { isLoading, error };
};
