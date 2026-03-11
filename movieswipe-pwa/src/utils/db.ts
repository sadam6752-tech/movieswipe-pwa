import Dexie, { type Table } from 'dexie';
import type { Movie, FavoriteMovie } from '../types/movie';

// Класс базы данных
export class MovieSwipeDB extends Dexie {
  movies!: Table<Movie, string>;
  favorites!: Table<FavoriteMovie, string>;

  constructor() {
    super('MovieSwipeDB');
    
    // Версия 1: Исходная схема
    this.version(1).stores({
      movies: 'id, title, year, rating, *genres, *moods, source, createdAt',
      favorites: 'movieId, addedAt'
    });
    
    // Версия 2: Добавлено поле countries
    this.version(2).stores({
      movies: 'id, title, year, rating, *genres, *moods, *countries, source, createdAt',
      favorites: 'movieId, addedAt'
    }).upgrade(async (trans) => {
      // Миграция: добавляем countries для существующих фильмов
      const movies = await trans.table('movies').toArray();
      for (const movie of movies) {
        if (!movie.countries) {
          await trans.table('movies').update(movie.id, {
            countries: ['Другие']
          });
        }
      }
    });
    
    // Версия 3: Добавлено поле contentType
    this.version(3).stores({
      movies: 'id, title, year, rating, *genres, *moods, *countries, contentType, source, createdAt',
      favorites: 'movieId, addedAt'
    }).upgrade(async (trans) => {
      // Миграция: добавляем contentType для существующих фильмов
      const movies = await trans.table('movies').toArray();
      for (const movie of movies) {
        if (!movie.contentType) {
          await trans.table('movies').update(movie.id, {
            contentType: 'movie'
          });
        }
      }
    });
  }
}

// Экземпляр базы данных
export const db = new MovieSwipeDB();

// Утилиты для работы с БД
export const dbUtils = {
  // Фильмы
  async getAllMovies(): Promise<Movie[]> {
    return await db.movies.toArray();
  },
  
  async getMovieById(id: string): Promise<Movie | undefined> {
    return await db.movies.get(id);
  },
  
  async addMovie(movie: Movie): Promise<string> {
    return await db.movies.add(movie);
  },
  
  async addMovies(movies: Movie[]): Promise<string> {
    await db.movies.bulkAdd(movies);
    return `Added ${movies.length} movies`;
  },
  
  async updateMovie(id: string, changes: Partial<Movie>): Promise<number> {
    return await db.movies.update(id, changes);
  },
  
  async deleteMovie(id: string): Promise<void> {
    await db.movies.delete(id);
  },
  
  async clearMovies(): Promise<void> {
    await db.movies.clear();
  },
  
  async searchMovies(query: string): Promise<Movie[]> {
    const lowerQuery = query.toLowerCase();
    return await db.movies
      .filter(movie => 
        movie.title.toLowerCase().includes(lowerQuery) ||
        movie.originalTitle.toLowerCase().includes(lowerQuery) ||
        movie.director.toLowerCase().includes(lowerQuery) ||
        movie.cast.some(actor => actor.toLowerCase().includes(lowerQuery))
      )
      .toArray();
  },
  
  // Избранное
  async getFavorites(): Promise<Movie[]> {
    const favoriteIds = await db.favorites.toArray();
    const movieIds = favoriteIds.map(f => f.movieId);
    return await db.movies.where('id').anyOf(movieIds).toArray();
  },
  
  async addToFavorites(movieId: string): Promise<string> {
    const favorite: FavoriteMovie = {
      movieId,
      addedAt: new Date().toISOString()
    };
    return await db.favorites.add(favorite);
  },
  
  async removeFromFavorites(movieId: string): Promise<void> {
    await db.favorites.delete(movieId);
  },
  
  async isFavorite(movieId: string): Promise<boolean> {
    const favorite = await db.favorites.get(movieId);
    return favorite !== undefined;
  },
  
  async clearFavorites(): Promise<void> {
    await db.favorites.clear();
  }
};
