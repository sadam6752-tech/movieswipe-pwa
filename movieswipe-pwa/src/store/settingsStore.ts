import { create } from 'zustand';
import type { Settings } from '../types/settings';
import type { Genre } from '../types/movie';
import type { Language } from '../i18n/translations';
import { storageService } from '../services/storageService';

const SETTINGS_KEY = 'movieswipe_settings';

// Default settings
const DEFAULT_SETTINGS: Settings = {
  language: 'ru',
  theme: 'dark',
  dataSources: {
    imdb: false,
    kinopoisk: true  // По умолчанию включен
  },
  tmdbApiKey: undefined,
  loadedGenres: [],
  lastSync: new Date().toISOString(),
  showAdultContent: false,
  contentTypeFilters: {
    showMovies: true,   // По умолчанию включен
    showSeries: true    // По умолчанию включен
  }
};

interface SettingsState extends Settings {
  // Actions
  loadSettings: () => void;
  setTheme: (theme: 'dark' | 'light') => void;
  setLanguage: (language: Language) => void;
  toggleDataSource: (source: 'imdb' | 'kinopoisk') => void;
  setTmdbApiKey: (apiKey: string) => void;
  addLoadedGenre: (genre: Genre) => void;
  addLoadedGenres: (genres: Genre[]) => void;
  isGenreLoaded: (genre: Genre) => boolean;
  updateLastSync: () => void;
  setShowAdultContent: (show: boolean) => void;
  setShowMovies: (show: boolean) => void;
  setShowSeries: (show: boolean) => void;
  resetSettings: () => void;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  // Initial state from default settings
  ...DEFAULT_SETTINGS,
  
  // Load settings from LocalStorage
  loadSettings: () => {
    const savedSettings = storageService.get<Settings>(SETTINGS_KEY);
    if (savedSettings) {
      // Обратная совместимость: добавляем новые поля если их нет
      const settings = {
        ...savedSettings,
        contentTypeFilters: savedSettings.contentTypeFilters || {
          showMovies: true,
          showSeries: true
        }
      };
      set(settings);
      
      // Apply theme to document
      document.documentElement.setAttribute('data-theme', settings.theme);
    } else {
      // Save default settings
      storageService.set(SETTINGS_KEY, DEFAULT_SETTINGS);
      document.documentElement.setAttribute('data-theme', DEFAULT_SETTINGS.theme);
    }
  },
  
  // Set theme
  setTheme: (theme: 'dark' | 'light') => {
    set({ theme });
    
    // Apply theme to document immediately
    document.documentElement.setAttribute('data-theme', theme);
    
    // Save to LocalStorage
    const currentSettings = get();
    storageService.set(SETTINGS_KEY, {
      language: currentSettings.language,
      theme,
      dataSources: currentSettings.dataSources,
      lastSync: currentSettings.lastSync
    });
  },
  
  // Set language
  setLanguage: (language: Language) => {
    set({ language });
    
    // Save to LocalStorage
    const currentSettings = get();
    storageService.set(SETTINGS_KEY, {
      language,
      theme: currentSettings.theme,
      dataSources: currentSettings.dataSources,
      tmdbApiKey: currentSettings.tmdbApiKey,
      loadedGenres: currentSettings.loadedGenres,
      lastSync: currentSettings.lastSync
    });
  },
  
  // Toggle data source
  toggleDataSource: (source: 'imdb' | 'kinopoisk') => {
    const currentSettings = get();
    const newDataSources = {
      ...currentSettings.dataSources,
      [source]: !currentSettings.dataSources[source]
    };
    
    set({ dataSources: newDataSources });
    
    // Save to LocalStorage
    storageService.set(SETTINGS_KEY, {
      language: currentSettings.language,
      theme: currentSettings.theme,
      dataSources: newDataSources,
      tmdbApiKey: currentSettings.tmdbApiKey,
      loadedGenres: currentSettings.loadedGenres,
      lastSync: currentSettings.lastSync
    });
  },
  
  // Set TMDB API key
  setTmdbApiKey: (apiKey: string) => {
    set({ tmdbApiKey: apiKey });
    
    // Save to LocalStorage
    const currentSettings = get();
    storageService.set(SETTINGS_KEY, {
      language: currentSettings.language,
      theme: currentSettings.theme,
      dataSources: currentSettings.dataSources,
      tmdbApiKey: apiKey,
      loadedGenres: currentSettings.loadedGenres,
      lastSync: currentSettings.lastSync
    });
  },
  
  // Add loaded genre
  addLoadedGenre: (genre: Genre) => {
    const currentSettings = get();
    if (!currentSettings.loadedGenres.includes(genre)) {
      const newLoadedGenres = [...currentSettings.loadedGenres, genre];
      set({ loadedGenres: newLoadedGenres });
      
      // Save to LocalStorage
      storageService.set(SETTINGS_KEY, {
        language: currentSettings.language,
        theme: currentSettings.theme,
        dataSources: currentSettings.dataSources,
        tmdbApiKey: currentSettings.tmdbApiKey,
        loadedGenres: newLoadedGenres,
        lastSync: currentSettings.lastSync
      });
    }
  },
  
  // Add multiple loaded genres
  addLoadedGenres: (genres: Genre[]) => {
    const currentSettings = get();
    const newLoadedGenres = [...new Set([...currentSettings.loadedGenres, ...genres])];
    set({ loadedGenres: newLoadedGenres });
    
    // Save to LocalStorage
    storageService.set(SETTINGS_KEY, {
      language: currentSettings.language,
      theme: currentSettings.theme,
      dataSources: currentSettings.dataSources,
      tmdbApiKey: currentSettings.tmdbApiKey,
      loadedGenres: newLoadedGenres,
      lastSync: currentSettings.lastSync
    });
  },
  
  // Check if genre is loaded
  isGenreLoaded: (genre: Genre) => {
    const currentSettings = get();
    return currentSettings.loadedGenres.includes(genre);
  },
  
  // Update last sync timestamp
  updateLastSync: () => {
    const lastSync = new Date().toISOString();
    set({ lastSync });
    
    // Save to LocalStorage
    const currentSettings = get();
    storageService.set(SETTINGS_KEY, {
      language: currentSettings.language,
      theme: currentSettings.theme,
      dataSources: currentSettings.dataSources,
      tmdbApiKey: currentSettings.tmdbApiKey,
      loadedGenres: currentSettings.loadedGenres,
      lastSync,
      showAdultContent: currentSettings.showAdultContent
    });
  },
  
  // Set show adult content
  setShowAdultContent: (show: boolean) => {
    set({ showAdultContent: show });
    
    // Save to LocalStorage
    const currentSettings = get();
    storageService.set(SETTINGS_KEY, {
      language: currentSettings.language,
      theme: currentSettings.theme,
      dataSources: currentSettings.dataSources,
      tmdbApiKey: currentSettings.tmdbApiKey,
      loadedGenres: currentSettings.loadedGenres,
      lastSync: currentSettings.lastSync,
      showAdultContent: show,
      contentTypeFilters: currentSettings.contentTypeFilters
    });
  },
  
  // Set show movies
  setShowMovies: (show: boolean) => {
    const currentSettings = get();
    set({ 
      contentTypeFilters: {
        ...currentSettings.contentTypeFilters,
        showMovies: show
      }
    });
    
    // Save to LocalStorage
    storageService.set(SETTINGS_KEY, {
      language: currentSettings.language,
      theme: currentSettings.theme,
      dataSources: currentSettings.dataSources,
      tmdbApiKey: currentSettings.tmdbApiKey,
      loadedGenres: currentSettings.loadedGenres,
      lastSync: currentSettings.lastSync,
      showAdultContent: currentSettings.showAdultContent,
      contentTypeFilters: {
        ...currentSettings.contentTypeFilters,
        showMovies: show
      }
    });
  },
  
  // Set show series
  setShowSeries: (show: boolean) => {
    const currentSettings = get();
    set({ 
      contentTypeFilters: {
        ...currentSettings.contentTypeFilters,
        showSeries: show
      }
    });
    
    // Save to LocalStorage
    storageService.set(SETTINGS_KEY, {
      language: currentSettings.language,
      theme: currentSettings.theme,
      dataSources: currentSettings.dataSources,
      tmdbApiKey: currentSettings.tmdbApiKey,
      loadedGenres: currentSettings.loadedGenres,
      lastSync: currentSettings.lastSync,
      showAdultContent: currentSettings.showAdultContent,
      contentTypeFilters: {
        ...currentSettings.contentTypeFilters,
        showSeries: show
      }
    });
  },
  
  // Reset to default settings
  resetSettings: () => {
    set(DEFAULT_SETTINGS);
    storageService.set(SETTINGS_KEY, DEFAULT_SETTINGS);
    document.documentElement.setAttribute('data-theme', DEFAULT_SETTINGS.theme);
  }
}));
