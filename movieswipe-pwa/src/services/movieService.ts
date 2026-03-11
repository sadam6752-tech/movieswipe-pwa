import { dbUtils } from '../utils/db';
import type { Movie, MovieFilters } from '../types/movie';
import { MOOD_MAPPINGS } from '../utils/constants';

class MovieService {
  /**
   * Получить все фильмы
   */
  async getAllMovies(): Promise<Movie[]> {
    return await dbUtils.getAllMovies();
  }

  /**
   * Получить фильм по ID
   */
  async getMovieById(id: string): Promise<Movie | undefined> {
    return await dbUtils.getMovieById(id);
  }

  /**
   * Обновить детали фильма (режиссер, актеры, длительность)
   */
  async updateMovieDetails(
    id: string,
    details: { director: string; cast: string[]; runtime: number }
  ): Promise<void> {
    await dbUtils.updateMovie(id, {
      director: details.director,
      cast: details.cast,
      duration: details.runtime,
      updatedAt: new Date().toISOString()
    });
  }

  /**
   * Проверить, есть ли фильмы определенного жанра в базе
   */
  async hasMoviesOfGenre(genre: string): Promise<boolean> {
    const movies = await this.getAllMovies();
    return movies.some(movie => movie.genres.includes(genre as any));
  }

  /**
   * Поиск фильмов по запросу
   * Поиск по названию, актерам и режиссеру (case-insensitive)
   */
  async searchMovies(query: string): Promise<Movie[]> {
    if (!query.trim()) {
      return await this.getAllMovies();
    }
    return await dbUtils.searchMovies(query);
  }

  /**
   * Фильтрация фильмов по настроениям
   * Маппинг настроений на жанры и рейтинги
   */
  filterByMoods(movies: Movie[], moods: string[]): Movie[] {
    if (moods.length === 0) {
      return movies;
    }

    // Получаем маппинги для выбранных настроений
    const selectedMappings = MOOD_MAPPINGS.filter(m => moods.includes(m.mood));
    
    // Собираем все жанры и диапазоны рейтингов
    const allowedGenres = new Set<string>();
    let minRating = 10;
    let maxRating = 0;
    
    selectedMappings.forEach(mapping => {
      mapping.genres.forEach(genre => allowedGenres.add(genre));
      minRating = Math.min(minRating, mapping.ratingRange[0]);
      maxRating = Math.max(maxRating, mapping.ratingRange[1]);
    });

    // Фильтруем фильмы
    return movies.filter(movie => {
      // Проверяем, есть ли хотя бы один подходящий жанр
      const hasMatchingGenre = movie.genres.some(genre => allowedGenres.has(genre));
      
      // Проверяем рейтинг
      const hasMatchingRating = movie.rating >= minRating && movie.rating <= maxRating;
      
      // Проверяем, есть ли хотя бы одно совпадающее настроение
      const hasMatchingMood = movie.moods.some(mood => moods.includes(mood));
      
      return (hasMatchingGenre || hasMatchingMood) && hasMatchingRating;
    });
  }

  /**
   * Фильтрация фильмов по множественным критериям
   */
  filterMovies(movies: Movie[], filters: MovieFilters): Movie[]  {
    return movies.filter(movie => {
      // Фильтр по жанрам
      if (filters.genres.length > 0) {
        const hasMatchingGenre = movie.genres.some(genre => 
          filters.genres.includes(genre)
        );
        if (!hasMatchingGenre) return false;
      }

      // Фильтр по странам
      if (filters.countries.length > 0) {
        const hasMatchingCountry = movie.countries?.some(country => 
          filters.countries.includes(country)
        );
        if (!hasMatchingCountry) return false;
      }

      // Фильтр по типу контента
      if (filters.contentTypes.length > 0) {
        if (!movie.contentType || !filters.contentTypes.includes(movie.contentType)) {
          return false;
        }
      }

      // Фильтр по рейтингу
      if (movie.rating < filters.ratingMin || movie.rating > filters.ratingMax) {
        return false;
      }

      // Фильтр по годам
      if (movie.year < filters.yearMin || movie.year > filters.yearMax) {
        return false;
      }

      // Фильтр по настроениям
      if (filters.moods.length > 0) {
        const hasMatchingMood = movie.moods.some(mood => 
          filters.moods.includes(mood)
        );
        if (!hasMatchingMood) return false;
      }

      return true;
    });
  }

  /**
   * Получить случайный фильм из списка
   */
  getRandomMovie(movies: Movie[]): Movie | null {
    if (movies.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * movies.length);
    return movies[randomIndex];
  }

  /**
   * Получить случайный фильм по настроениям
   */
  async getRandomMovieByMoods(moods: string[]): Promise<Movie | null> {
    const allMovies = await this.getAllMovies();
    const filteredMovies = this.filterByMoods(allMovies, moods);
    return this.getRandomMovie(filteredMovies);
  }
}

// Экспортируем singleton
export const movieService = new MovieService();
