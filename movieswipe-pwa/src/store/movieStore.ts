import { create } from 'zustand';
import type { Movie } from '../types/movie';
import { movieService } from '../services/movieService';

interface MovieState {
  // State
  movies: Movie[];
  currentIndex: number;
  history: Movie[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  loadMovies: () => Promise<void>;
  nextMovie: () => void;
  previousMovie: () => void;
  resetStack: () => void;
  shuffleMovies: () => void;
  filterByMoods: (moods: string[]) => Movie[];
  setMovies: (movies: Movie[]) => void;
  setCurrentIndex: (index: number) => void;
  addToHistory: (movie: Movie) => void;
}

export const useMovieStore = create<MovieState>((set, get) => ({
  // Initial state
  movies: [],
  currentIndex: 0,
  history: [],
  isLoading: false,
  error: null,
  
  // Load movies from database
  loadMovies: async () => {
    set({ isLoading: true, error: null });
    try {
      const movies = await movieService.getAllMovies();
      // Перемешиваем фильмы при загрузке
      const shuffled = [...movies].sort(() => Math.random() - 0.5);
      set({ movies: shuffled, isLoading: false, currentIndex: 0, history: [] });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        isLoading: false 
      });
    }
  },
  
  // Move to next movie
  nextMovie: () => {
    const { currentIndex, movies } = get();
    if (currentIndex < movies.length - 1) {
      set({ currentIndex: currentIndex + 1 });
    }
  },
  
  // Move to previous movie (undo)
  previousMovie: () => {
    const { currentIndex, history } = get();
    if (history.length > 0) {
      // Remove last movie from history
      const newHistory = history.slice(0, -1);
      set({
        currentIndex: Math.max(0, currentIndex - 1),
        history: newHistory
      });
    }
  },
  
  // Reset stack to beginning
  resetStack: () => {
    set({ currentIndex: 0, history: [] });
  },
  
  // Shuffle movies randomly
  shuffleMovies: () => {
    const { movies } = get();
    const shuffled = [...movies].sort(() => Math.random() - 0.5);
    set({ movies: shuffled, currentIndex: 0, history: [] });
  },
  
  // Filter movies by moods
  filterByMoods: (moods: string[]) => {
    const { movies } = get();
    return movieService.filterByMoods(movies, moods);
  },
  
  // Set movies directly
  setMovies: (movies: Movie[]) => {
    set({ movies, currentIndex: 0, history: [] });
  },
  
  // Set current index
  setCurrentIndex: (index: number) => {
    set({ currentIndex: index });
  },
  
  // Add movie to history
  addToHistory: (movie: Movie) => {
    const { history } = get();
    set({ history: [...history, movie] });
  }
}));
