import { dbUtils } from '../utils/db';
import type { Movie, Genre } from '../types/movie';

interface SyncResult {
  success: boolean;
  moviesAdded: number;
  error?: string;
}

interface SyncProgress {
  current: number;
  total: number;
  status: string;
}

// TMDB API types
interface TMDBMovie {
  id: number;
  title: string;
  original_title: string;
  release_date: string;
  overview: string;
  genre_ids: number[];
  vote_average: number;
  runtime?: number;
  poster_path: string | null;
  backdrop_path: string | null;
}

// TMDB Genre ID to our Genre mapping
const TMDB_GENRE_MAP: Record<number, Genre[]> = {
  28: ['action'],
  12: ['adventure'],
  16: ['family'], // Animation -> family (since animation is now a content type)
  35: ['comedy'],
  80: ['detective'],
  99: ['documentary'],
  18: ['drama'],
  10751: ['family'],
  14: ['fantasy'],
  36: ['historical'],
  27: ['horror'],
  10402: ['musical'],
  9648: ['detective'],
  10749: ['romance'],
  878: ['sci-fi'],
  10770: ['drama'],
  53: ['thriller'],
  10752: ['war'],
  37: ['adventure']
};

// Map TMDB genres to moods
const GENRE_TO_MOOD_MAP: Partial<Record<Genre, string[]>> = {
  'action': ['adrenaline', 'energize'],
  'adventure': ['adrenaline', 'fantasy'],
  'biography': ['philosophical', 'emotional'],
  'comedy': ['comedy', 'light-positive'],
  'crime': ['adrenaline', 'philosophical'],
  'detective': ['adrenaline', 'philosophical'],
  'documentary': ['philosophical'],
  'drama': ['emotional', 'philosophical'],
  'erotic': ['romance'],
  'family': ['cozy', 'light-positive'],
  'fantasy': ['fantasy', 'cozy'],
  'historical': ['philosophical', 'nostalgia'],
  'horror': ['horror', 'adrenaline'],
  'kids': ['light-positive', 'cozy'],
  'comic': ['adrenaline', 'fantasy'],
  'melodrama': ['emotional', 'romance'],
  'music': ['energize', 'light-positive'],
  'musical': ['energize', 'light-positive'],
  'mystery': ['horror', 'philosophical'],
  'noir': ['philosophical', 'nostalgia'],
  'reality': ['light-positive'],
  'romance': ['romance', 'emotional'],
  'sci-fi': ['fantasy', 'philosophical'],
  'short': ['light-positive'],
  'sport': ['energize', 'adrenaline'],
  'talk-show': ['light-positive'],
  'thriller': ['adrenaline', 'horror'],
  'war': ['emotional', 'philosophical'],
  'western': ['adrenaline', 'nostalgia']
};

class SyncService {
  private readonly MAX_RETRIES = 3;
  private readonly INITIAL_DELAY = 1000; // 1 секунда
  private readonly TMDB_BASE_URL = 'https://api.themoviedb.org/3';
  private readonly TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p';
  private progressCallback?: (progress: SyncProgress) => void;

  /**
   * Set progress callback for UI updates
   */
  setProgressCallback(callback: (progress: SyncProgress) => void) {
    this.progressCallback = callback;
  }

  /**
   * Clear progress callback
   */
  clearProgressCallback() {
    this.progressCallback = undefined;
  }

  /**
   * Report progress to callback
   */
  private reportProgress(current: number, total: number, status: string) {
    if (this.progressCallback) {
      this.progressCallback({ current, total, status });
    }
  }

  /**
   * Загрузить детали конкретного фильма из TMDB
   */
  async fetchMovieDetails(movieId: string, apiKey: string): Promise<{
    director: string;
    cast: string[];
    runtime: number;
  } | null> {
    try {
      if (!apiKey) {
        console.warn('TMDB API key not provided');
        return null;
      }

      // Extract TMDB ID from our movie ID (format: "tmdb-12345")
      const tmdbId = movieId.replace('tmdb-', '');
      
      const response = await fetch(
        `${this.TMDB_BASE_URL}/movie/${tmdbId}?api_key=${apiKey}&language=ru-RU&append_to_response=credits`
      );

      if (!response.ok) {
        console.error(`Failed to fetch movie details: ${response.status}`);
        return null;
      }

      const data = await response.json();

      // Extract director
      const director = data.credits?.crew?.find((c: any) => c.job === 'Director')?.name || 'Неизвестно';

      // Extract top 5 cast members
      const cast = data.credits?.cast?.slice(0, 5).map((c: any) => c.name) || [];

      // Get runtime
      const runtime = data.runtime || 120;

      return {
        director,
        cast,
        runtime
      };
    } catch (error) {
      console.error('Error fetching movie details:', error);
      return null;
    }
  }

  /**
   * Загрузить данные из локального JSON файла
   */
  async loadFromLocalJSON(): Promise<SyncResult> {
    try {
      const response = await fetch('/data/movies.json');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      const movies: Movie[] = data.movies || [];
      
      // Очищаем существующие данные и добавляем новые
      await dbUtils.clearMovies();
      await dbUtils.addMovies(movies);
      
      return {
        success: true,
        moviesAdded: movies.length
      };
    } catch (error) {
      console.error('Error loading from local JSON:', error);
      return {
        success: false,
        moviesAdded: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Загрузить фильмы по жанру из локального JSON
   */
  async loadGenreFromLocalJSON(genre: Genre): Promise<SyncResult> {
    try {
      const genreFileName = `movies-${genre}.json`;
      const response = await fetch(`/data/${genreFileName}`);
      
      if (!response.ok) {
        // Если файл не найден, возвращаем успех с 0 фильмов (это нормально)
        if (response.status === 404) {
          console.warn(`Genre file not found: ${genreFileName}`);
          return {
            success: true,
            moviesAdded: 0
          };
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      const movies: Movie[] = data.movies || [];
      
      // Добавляем фильмы (не очищаем существующие)
      await dbUtils.addMovies(movies);
      
      return {
        success: true,
        moviesAdded: movies.length
      };
    } catch (error) {
      console.error(`Error loading genre ${genre}:`, error);
      return {
        success: false,
        moviesAdded: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Загрузить несколько жанров одновременно
   */
  async loadGenresFromLocalJSON(genres: Genre[]): Promise<SyncResult> {
    try {
      this.reportProgress(0, genres.length, 'Загрузка жанров...');
      
      let totalAdded = 0;
      const errors: string[] = [];

      for (let i = 0; i < genres.length; i++) {
        const genre = genres[i];
        this.reportProgress(i, genres.length, `Загрузка жанра: ${genre}...`);
        
        const result = await this.loadGenreFromLocalJSON(genre);
        
        if (result.success) {
          totalAdded += result.moviesAdded;
        } else if (result.error) {
          // Не добавляем ошибку если это просто отсутствующий файл
          errors.push(result.error);
        }
      }

      this.reportProgress(genres.length, genres.length, 'Готово!');

      // Считаем успехом если хотя бы что-то загрузилось или просто нет файлов
      return {
        success: true,
        moviesAdded: totalAdded,
        error: errors.length > 0 && totalAdded === 0 ? errors.join('; ') : undefined
      };
    } catch (error) {
      console.error('Error loading genres:', error);
      return {
        success: false,
        moviesAdded: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Загрузить данные из TMDB API
   */
  async fetchFromTMDB(apiKey: string, maxMovies: number = 1000): Promise<SyncResult> {
    try {
      if (!apiKey) {
        return {
          success: false,
          moviesAdded: 0,
          error: 'API ключ TMDB не указан'
        };
      }

      this.reportProgress(0, maxMovies, 'Загрузка популярных фильмов из TMDB...');

      const movies: Movie[] = [];
      const moviesPerPage = 20;
      const totalPages = Math.ceil(maxMovies / moviesPerPage);

      // Fetch popular movies page by page (only basic info, no details)
      for (let page = 1; page <= totalPages && movies.length < maxMovies; page++) {
        try {
          const response = await fetch(
            `${this.TMDB_BASE_URL}/movie/popular?api_key=${apiKey}&language=ru-RU&page=${page}`
          );

          if (!response.ok) {
            if (response.status === 401) {
              throw new Error('Неверный API ключ TMDB');
            }
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const data = await response.json();
          const tmdbMovies: TMDBMovie[] = data.results || [];

          // Convert TMDB movies to our format (without additional API calls)
          for (const tmdbMovie of tmdbMovies) {
            if (movies.length >= maxMovies) break;

            const movie = this.convertBasicTMDBMovie(tmdbMovie);
            movies.push(movie);
            
            this.reportProgress(
              movies.length,
              maxMovies,
              `Загружено ${movies.length} из ${maxMovies} фильмов...`
            );
          }

          // Rate limiting: wait 250ms between requests
          await this.sleep(250);
        } catch (error) {
          console.error(`Error fetching page ${page}:`, error);
          // Continue with next page
        }
      }

      // Save to database
      this.reportProgress(movies.length, maxMovies, 'Сохранение в базу данных...');
      await dbUtils.clearMovies();
      await dbUtils.addMovies(movies);

      this.reportProgress(movies.length, maxMovies, 'Готово!');

      return {
        success: true,
        moviesAdded: movies.length
      };
    } catch (error) {
      console.error('Error fetching from TMDB:', error);
      return {
        success: false,
        moviesAdded: 0,
        error: error instanceof Error ? error.message : 'Неизвестная ошибка'
      };
    }
  }

  /**
   * Convert basic TMDB movie without additional API calls
   */
  private convertBasicTMDBMovie(tmdbMovie: TMDBMovie): Movie {
    const genres = this.mapTMDBGenres(tmdbMovie.genre_ids || []);
    const moods = this.mapGenresToMoods(genres);

    return {
      id: `tmdb-${tmdbMovie.id}`,
      title: tmdbMovie.title,
      originalTitle: tmdbMovie.original_title,
      year: tmdbMovie.release_date ? new Date(tmdbMovie.release_date).getFullYear() : 0,
      description: tmdbMovie.overview || 'Описание отсутствует',
      genres,
      moods,
      countries: ['Другие'], // TMDB не предоставляет страны в базовом запросе
      contentType: 'movie', // TMDB API возвращает только фильмы в /movie/popular
      rating: Math.round(tmdbMovie.vote_average * 10) / 10,
      duration: tmdbMovie.runtime || 120,
      director: 'Неизвестно',
      cast: [],
      poster: tmdbMovie.poster_path 
        ? `${this.TMDB_IMAGE_BASE}/w500${tmdbMovie.poster_path}`
        : '',
      backdrop: tmdbMovie.backdrop_path
        ? `${this.TMDB_IMAGE_BASE}/w1280${tmdbMovie.backdrop_path}`
        : '',
      language: 'ru',
      isFavorite: false,
      watchStatus: 'unwatched',
      source: 'imdb',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  /**
   * Map TMDB genre IDs to our Genre types
   */
  private mapTMDBGenres(genreIds: number[]): Genre[] {
    const genres = new Set<Genre>();
    
    genreIds.forEach(id => {
      const mappedGenres = TMDB_GENRE_MAP[id];
      if (mappedGenres) {
        mappedGenres.forEach(g => genres.add(g));
      }
    });

    return Array.from(genres);
  }

  /**
   * Map genres to moods
   */
  private mapGenresToMoods(genres: Genre[]): string[] {
    const moods = new Set<string>();
    
    genres.forEach(genre => {
      const genreMoods = GENRE_TO_MOOD_MAP[genre];
      if (genreMoods) {
        genreMoods.forEach(m => moods.add(m));
      }
    });

    return Array.from(moods);
  }

  /**
   * Загрузить данные из ПоискКино (локальный JSON файл)
   */
  async fetchFromKinopoisk(): Promise<SyncResult> {
    try {
      this.reportProgress(0, 1, 'Загрузка из ПоискКино...');
      
      // Загружаем из локального JSON файла, созданного скриптом poiskkino-sync.js
      const response = await fetch('/data/movies-poiskkino.json');
      
      if (!response.ok) {
        if (response.status === 404) {
          return {
            success: false,
            moviesAdded: 0,
            error: 'Файл movies-poiskkino.json не найден. Запустите скрипт poiskkino-sync.js для загрузки данных.'
          };
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      this.reportProgress(0, 1, 'Парсинг данных...');
      const data = await response.json();
      const movies: Movie[] = data.movies || [];
      
      if (movies.length === 0) {
        return {
          success: false,
          moviesAdded: 0,
          error: 'Файл movies-poiskkino.json пуст'
        };
      }
      
      this.reportProgress(0, 1, `Обновление ${movies.length} фильмов...`);
      
      // Очищаем базу и добавляем свежие данные
      await dbUtils.clearMovies();
      await dbUtils.addMovies(movies);
      
      this.reportProgress(1, 1, 'Готово!');
      
      return {
        success: true,
        moviesAdded: movies.length
      };
    } catch (error) {
      console.error('Error fetching from ПоискКино:', error);
      return {
        success: false,
        moviesAdded: 0,
        error: error instanceof Error ? error.message : 'Неизвестная ошибка'
      };
    }
  }

  /**
   * Загрузить данные из выбранных источников с retry и exponential backoff
   */
  async syncFromSources(
    sources: { imdb: boolean; kinopoisk: boolean },
    apiKey?: string
  ): Promise<SyncResult> {
    let totalAdded = 0;
    const errors: string[] = [];

    // Загружаем из выбранных источников
    if (sources.imdb) {
      if (!apiKey) {
        errors.push('IMDB/TMDB: API ключ не указан');
      } else {
        const result = await this.fetchWithRetry(() => this.fetchFromTMDB(apiKey, 1000));
        if (result.success) {
          totalAdded += result.moviesAdded;
        } else if (result.error) {
          errors.push(`IMDB/TMDB: ${result.error}`);
        }
      }
    }

    if (sources.kinopoisk) {
      const result = await this.fetchWithRetry(() => this.fetchFromKinopoisk());
      if (result.success) {
        // В реальной реализации здесь будут фильмы
        // results.push(movies);
      } else if (result.error) {
        errors.push(`Kinopoisk: ${result.error}`);
      }
    }

    return {
      success: errors.length === 0 || totalAdded > 0,
      moviesAdded: totalAdded,
      error: errors.length > 0 ? errors.join('; ') : undefined
    };
  }

  /**
   * Выполнить запрос с retry и exponential backoff
   */
  private async fetchWithRetry(
    fetchFn: () => Promise<SyncResult>,
    retries = this.MAX_RETRIES
  ): Promise<SyncResult> {
    let lastResult: SyncResult | null = null;
    
    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        const result = await fetchFn();
        lastResult = result;
        
        // Если успешно - возвращаем результат
        if (result.success) {
          return result;
        }
        
        // Если загружены фильмы, но есть ошибка - все равно считаем успехом
        if (result.moviesAdded > 0) {
          return {
            success: true,
            moviesAdded: result.moviesAdded,
            error: result.error
          };
        }
        
        // Если не успешно и не последняя попытка - ждем и повторяем
        if (attempt < retries - 1) {
          const delay = this.INITIAL_DELAY * Math.pow(2, attempt);
          console.log(`Retry attempt ${attempt + 1}/${retries} after ${delay}ms`);
          await this.sleep(delay);
        }
      } catch (error) {
        console.error(`Attempt ${attempt + 1} failed:`, error);
        
        if (attempt < retries - 1) {
          const delay = this.INITIAL_DELAY * Math.pow(2, attempt);
          await this.sleep(delay);
        } else {
          lastResult = {
            success: false,
            moviesAdded: 0,
            error: error instanceof Error ? error.message : 'Unknown error'
          };
        }
      }
    }
    
    // Если дошли сюда - все попытки неудачны
    return lastResult || {
      success: false,
      moviesAdded: 0,
      error: `Failed after ${retries} attempts`
    };
  }

  /**
   * Вспомогательная функция для задержки
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Проверить наличие данных в базе
   */
  async hasData(): Promise<boolean> {
    const movies = await dbUtils.getAllMovies();
    return movies.length > 0;
  }

  /**
   * Инициализация данных при первом запуске
   */
  async initializeData(): Promise<SyncResult> {
    const hasData = await this.hasData();
    
    if (!hasData) {
      console.log('No data found. Loading initial catalog from local JSON...');
      return await this.loadFromLocalJSON();
    }
    
    return {
      success: true,
      moviesAdded: 0
    };
  }
}

// Экспортируем singleton
export const syncService = new SyncService();

// Export types
export type { SyncResult, SyncProgress };
