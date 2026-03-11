import { dbUtils } from '../utils/db';
import type { Movie, SortOption } from '../types/movie';

class FavoritesService {
  /**
   * Добавить фильм в избранное
   * Сохранение должно происходить за <100ms
   */
  async addToFavorites(movieId: string): Promise<boolean> {
    try {
      const startTime = performance.now();
      
      // Проверяем, не добавлен ли уже фильм
      const isFav = await dbUtils.isFavorite(movieId);
      if (isFav) {
        console.log(`Movie ${movieId} is already in favorites`);
        return true;
      }

      await dbUtils.addToFavorites(movieId);
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      if (duration > 100) {
        console.warn(`addToFavorites took ${duration}ms (target: <100ms)`);
      }
      
      return true;
    } catch (error) {
      console.error('Error adding to favorites:', error);
      return false;
    }
  }

  /**
   * Удалить фильм из избранного
   */
  async removeFromFavorites(movieId: string): Promise<boolean> {
    try {
      await dbUtils.removeFromFavorites(movieId);
      return true;
    } catch (error) {
      console.error('Error removing from favorites:', error);
      return false;
    }
  }

  /**
   * Получить все избранные фильмы
   */
  async getFavorites(): Promise<Movie[]> {
    try {
      return await dbUtils.getFavorites();
    } catch (error) {
      console.error('Error getting favorites:', error);
      return [];
    }
  }

  /**
   * Проверить, находится ли фильм в избранном
   */
  async isFavorite(movieId: string): Promise<boolean> {
    try {
      return await dbUtils.isFavorite(movieId);
    } catch (error) {
      console.error('Error checking favorite status:', error);
      return false;
    }
  }

  /**
   * Переключить статус избранного
   */
  async toggleFavorite(movieId: string): Promise<boolean> {
    const isFav = await this.isFavorite(movieId);
    
    if (isFav) {
      return await this.removeFromFavorites(movieId);
    } else {
      return await this.addToFavorites(movieId);
    }
  }

  /**
   * Сортировка избранных фильмов
   */
  sortFavorites(movies: Movie[], sortBy: SortOption): Movie[] {
    const sorted = [...movies];
    
    switch (sortBy) {
      case 'date':
        // Сортировка по дате добавления (новые первыми)
        // Используем createdAt как прокси для даты добавления
        sorted.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        break;
        
      case 'title':
        // Сортировка по названию (алфавитный порядок)
        sorted.sort((a, b) => a.title.localeCompare(b.title, 'ru'));
        break;
        
      case 'rating':
        // Сортировка по рейтингу (высокие первыми)
        sorted.sort((a, b) => b.rating - a.rating);
        break;
        
      default:
        console.warn(`Unknown sort option: ${sortBy}`);
    }
    
    return sorted;
  }

  /**
   * Очистить все избранное
   */
  async clearFavorites(): Promise<boolean> {
    try {
      await dbUtils.clearFavorites();
      return true;
    } catch (error) {
      console.error('Error clearing favorites:', error);
      return false;
    }
  }

  /**
   * Получить количество избранных фильмов
   */
  async getFavoritesCount(): Promise<number> {
    try {
      const favorites = await this.getFavorites();
      return favorites.length;
    } catch (error) {
      console.error('Error getting favorites count:', error);
      return 0;
    }
  }
}

// Экспортируем singleton
export const favoritesService = new FavoritesService();
