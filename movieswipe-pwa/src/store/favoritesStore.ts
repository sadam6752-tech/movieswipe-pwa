import { create } from 'zustand';
import type { Movie, SortOption } from '../types/movie';
import { favoritesService } from '../services/favoritesService';

interface FavoritesState {
  // State
  favorites: Movie[];
  sortBy: SortOption;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  loadFavorites: () => Promise<void>;
  addFavorite: (movieId: string) => Promise<boolean>;
  removeFavorite: (movieId: string) => Promise<boolean>;
  toggleFavorite: (movieId: string) => Promise<boolean>;
  isFavorite: (movieId: string) => Promise<boolean>;
  setSortBy: (sortBy: SortOption) => void;
  clearFavorites: () => Promise<void>;
}

export const useFavoritesStore = create<FavoritesState>((set, get) => ({
  // Initial state
  favorites: [],
  sortBy: 'date',
  isLoading: false,
  error: null,
  
  // Load favorites from database
  loadFavorites: async () => {
    set({ isLoading: true, error: null });
    try {
      const favorites = await favoritesService.getFavorites();
      const { sortBy } = get();
      const sortedFavorites = favoritesService.sortFavorites(favorites, sortBy);
      set({ favorites: sortedFavorites, isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        isLoading: false 
      });
    }
  },
  
  // Add movie to favorites
  addFavorite: async (movieId: string) => {
    try {
      const success = await favoritesService.addToFavorites(movieId);
      if (success) {
        await get().loadFavorites();
      }
      return success;
    } catch (error) {
      console.error('Error adding favorite:', error);
      return false;
    }
  },
  
  // Remove movie from favorites
  removeFavorite: async (movieId: string) => {
    try {
      const success = await favoritesService.removeFromFavorites(movieId);
      if (success) {
        await get().loadFavorites();
      }
      return success;
    } catch (error) {
      console.error('Error removing favorite:', error);
      return false;
    }
  },
  
  // Toggle favorite status
  toggleFavorite: async (movieId: string) => {
    try {
      const success = await favoritesService.toggleFavorite(movieId);
      if (success) {
        await get().loadFavorites();
      }
      return success;
    } catch (error) {
      console.error('Error toggling favorite:', error);
      return false;
    }
  },
  
  // Check if movie is in favorites
  isFavorite: async (movieId: string) => {
    return await favoritesService.isFavorite(movieId);
  },
  
  // Set sort option and re-sort favorites
  setSortBy: (sortBy: SortOption) => {
    const { favorites } = get();
    const sortedFavorites = favoritesService.sortFavorites(favorites, sortBy);
    set({ sortBy, favorites: sortedFavorites });
  },
  
  // Clear all favorites
  clearFavorites: async () => {
    try {
      await favoritesService.clearFavorites();
      set({ favorites: [] });
    } catch (error) {
      console.error('Error clearing favorites:', error);
    }
  }
}));
