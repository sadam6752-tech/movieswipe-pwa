// Система переводов для MovieSwipe PWA

export type Language = 'ru' | 'en' | 'de';

export interface Translations {
  // Общие
  common: {
    back: string;
    save: string;
    cancel: string;
    delete: string;
    edit: string;
    search: string;
    filter: string;
    sort: string;
    loading: string;
    error: string;
    noResults: string;
  };
  
  // Навигация
  nav: {
    swipe: string;
    mood: string;
    catalog: string;
    favorites: string;
    settings: string;
  };
  
  // Свайп
  swipe: {
    title: string;
    noMovies: string;
    swipeRight: string;
    swipeLeft: string;
  };
  
  // Настроение
  mood: {
    title: string;
    subtitle: string;
    selectMovie: string;
    reset: string;
    weSelected: string;
    addToFavorites: string;
    moreDetails: string;
    anotherMovie: string;
    backToSelection: string;
    selectAtLeastOne: string;
    noMoviesFound: string;
  };
  
  // Каталог
  catalog: {
    title: string;
    searchPlaceholder: string;
    filters: string;
    showFilters: string;
    hideFilters: string;
    genres: string;
    countries: string;
    contentType: string;
    rating: string;
    year: string;
    showMore: string;
    moviesRemaining: string;
    noMovies: string;
  };
  
  // Избранное
  favorites: {
    title: string;
    empty: string;
    sortByDate: string;
    sortByTitle: string;
    sortByRating: string;
    removeFromFavorites: string;
  };
  
  // Детали фильма
  details: {
    director: string;
    cast: string;
    duration: string;
    year: string;
    rating: string;
    genres: string;
    addToFavorites: string;
    inFavorites: string;
    loadingDetails: string;
  };
  
  // Настройки
  settings: {
    title: string;
    theme: string;
    themeDark: string;
    themeLight: string;
    language: string;
    languageRu: string;
    languageEn: string;
    languageDe: string;
    dataSource: string;
    tmdbSource: string;
    kinopoiskSource: string;
    localSource: string;
    apiKey: string;
    apiKeyPlaceholder: string;
    updateCatalog: string;
    clearData: string;
    about: string;
    showAdultContent: string;
    contentTypeFilters: string;
    showMovies: string;
    showSeries: string;
  };
  
  // Настроения
  moods: {
    'light-positive': string;
    'romance': string;
    'energize': string;
    'relax': string;
    'emotional': string;
    'comedy': string;
    'philosophical': string;
    'adrenaline': string;
    'cozy': string;
    'nostalgia': string;
    'horror': string;
    'fantasy': string;
  };
}

export const translations: Record<Language, Translations> = {
  ru: {
    common: {
      back: 'Назад',
      save: 'Сохранить',
      cancel: 'Отмена',
      delete: 'Удалить',
      edit: 'Редактировать',
      search: 'Поиск',
      filter: 'Фильтр',
      sort: 'Сортировка',
      loading: 'Загрузка...',
      error: 'Ошибка',
      noResults: 'Ничего не найдено'
    },
    nav: {
      swipe: 'Свайп',
      mood: 'Настроение',
      catalog: 'Каталог',
      favorites: 'Избранное',
      settings: 'Настройки'
    },
    swipe: {
      title: 'Свайп',
      noMovies: 'Нет доступных фильмов',
      swipeRight: 'Свайп вправо - добавить в избранное',
      swipeLeft: 'Свайп влево - пропустить'
    },
    mood: {
      title: 'Выберите настроение',
      subtitle: 'Выберите одно или несколько настроений, и мы подберём фильм для вас',
      selectMovie: 'Выбрать фильм',
      reset: 'Сбросить',
      weSelected: 'Мы подобрали для вас:',
      addToFavorites: '❤️ Добавить в избранное',
      moreDetails: '📖 Подробнее',
      anotherMovie: '🔄 Другой фильм',
      backToSelection: '← Назад к выбору',
      selectAtLeastOne: '⚠️ Выберите хотя бы одно настроение',
      noMoviesFound: '😔 Не найдено фильмов с выбранными настроениями'
    },
    catalog: {
      title: 'Каталог фильмов',
      searchPlaceholder: 'Поиск по названию, актёрам, режиссёру...',
      filters: 'Фильтры',
      showFilters: 'Показать фильтры',
      hideFilters: 'Скрыть фильтры',
      genres: 'Жанры',
      countries: 'Страны',
      contentType: 'Тип контента',
      rating: 'Рейтинг',
      year: 'Год выпуска',
      showMore: 'Показать ещё',
      moviesRemaining: 'фильмов',
      noMovies: 'Фильмы не найдены'
    },
    favorites: {
      title: 'Избранное',
      empty: 'У вас пока нет избранных фильмов',
      sortByDate: 'По дате добавления',
      sortByTitle: 'По названию',
      sortByRating: 'По рейтингу',
      removeFromFavorites: 'Удалить из избранного'
    },
    details: {
      director: 'Режиссёр',
      cast: 'В ролях',
      duration: 'Длительность',
      year: 'Год',
      rating: 'Рейтинг',
      genres: 'Жанры',
      addToFavorites: 'Добавить в избранное',
      inFavorites: 'В избранном',
      loadingDetails: 'Загрузка деталей...'
    },
    settings: {
      title: 'Настройки',
      theme: 'Тема',
      themeDark: 'Тёмная',
      themeLight: 'Светлая',
      language: 'Язык интерфейса',
      languageRu: 'Русский',
      languageEn: 'English',
      languageDe: 'Deutsch',
      dataSource: 'Источник данных',
      tmdbSource: 'IMDB / TMDB',
      kinopoiskSource: 'Кинопоиск',
      localSource: 'Локальный JSON',
      apiKey: 'API ключ',
      apiKeyPlaceholder: 'Введите ваш API ключ',
      updateCatalog: 'Обновить каталог',
      clearData: 'Очистить данные',
      about: 'О приложении',
      showAdultContent: 'Показывать контент 18+',
      contentTypeFilters: 'Фильтры типов контента',
      showMovies: 'Показывать фильмы',
      showSeries: 'Показывать сериалы'
    },
    moods: {
      'light-positive': 'Лёгкость и позитив',
      'romance': 'Романтика',
      'energize': 'Зарядиться энергией',
      'relax': 'Расслабиться',
      'emotional': 'Погрустить',
      'comedy': 'Посмеяться',
      'philosophical': 'Задуматься',
      'adrenaline': 'Драйв',
      'cozy': 'Уют',
      'nostalgia': 'Ностальгия',
      'horror': 'Испугаться',
      'fantasy': 'Фантастика'
    }
  },
  
  en: {
    common: {
      back: 'Back',
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      search: 'Search',
      filter: 'Filter',
      sort: 'Sort',
      loading: 'Loading...',
      error: 'Error',
      noResults: 'No results found'
    },
    nav: {
      swipe: 'Swipe',
      mood: 'Mood',
      catalog: 'Catalog',
      favorites: 'Favorites',
      settings: 'Settings'
    },
    swipe: {
      title: 'Swipe',
      noMovies: 'No movies available',
      swipeRight: 'Swipe right - add to favorites',
      swipeLeft: 'Swipe left - skip'
    },
    mood: {
      title: 'Choose your mood',
      subtitle: 'Select one or more moods, and we will pick a movie for you',
      selectMovie: 'Select movie',
      reset: 'Reset',
      weSelected: 'We picked for you:',
      addToFavorites: '❤️ Add to favorites',
      moreDetails: '📖 More details',
      anotherMovie: '🔄 Another movie',
      backToSelection: '← Back to selection',
      selectAtLeastOne: '⚠️ Select at least one mood',
      noMoviesFound: '😔 No movies found with selected moods'
    },
    catalog: {
      title: 'Movie Catalog',
      searchPlaceholder: 'Search by title, actors, director...',
      filters: 'Filters',
      showFilters: 'Show filters',
      hideFilters: 'Hide filters',
      genres: 'Genres',
      countries: 'Countries',
      contentType: 'Content Type',
      rating: 'Rating',
      year: 'Release year',
      showMore: 'Show more',
      moviesRemaining: 'movies',
      noMovies: 'No movies found'
    },
    favorites: {
      title: 'Favorites',
      empty: 'You have no favorite movies yet',
      sortByDate: 'By date added',
      sortByTitle: 'By title',
      sortByRating: 'By rating',
      removeFromFavorites: 'Remove from favorites'
    },
    details: {
      director: 'Director',
      cast: 'Cast',
      duration: 'Duration',
      year: 'Year',
      rating: 'Rating',
      genres: 'Genres',
      addToFavorites: 'Add to favorites',
      inFavorites: 'In favorites',
      loadingDetails: 'Loading details...'
    },
    settings: {
      title: 'Settings',
      theme: 'Theme',
      themeDark: 'Dark',
      themeLight: 'Light',
      language: 'Interface language',
      languageRu: 'Русский',
      languageEn: 'English',
      languageDe: 'Deutsch',
      dataSource: 'Data source',
      tmdbSource: 'IMDB / TMDB',
      kinopoiskSource: 'Kinopoisk',
      localSource: 'Local JSON',
      apiKey: 'API key',
      apiKeyPlaceholder: 'Enter your API key',
      updateCatalog: 'Update catalog',
      clearData: 'Clear data',
      about: 'About',
      showAdultContent: 'Show 18+ content',
      contentTypeFilters: 'Content type filters',
      showMovies: 'Show movies',
      showSeries: 'Show series'
    },
    moods: {
      'light-positive': 'Light & Positive',
      'romance': 'Romance',
      'energize': 'Energize',
      'relax': 'Relax',
      'emotional': 'Emotional',
      'comedy': 'Comedy',
      'philosophical': 'Philosophical',
      'adrenaline': 'Adrenaline',
      'cozy': 'Cozy',
      'nostalgia': 'Nostalgia',
      'horror': 'Horror',
      'fantasy': 'Fantasy'
    }
  },
  
  de: {
    common: {
      back: 'Zurück',
      save: 'Speichern',
      cancel: 'Abbrechen',
      delete: 'Löschen',
      edit: 'Bearbeiten',
      search: 'Suche',
      filter: 'Filter',
      sort: 'Sortieren',
      loading: 'Lädt...',
      error: 'Fehler',
      noResults: 'Keine Ergebnisse gefunden'
    },
    nav: {
      swipe: 'Wischen',
      mood: 'Stimmung',
      catalog: 'Katalog',
      favorites: 'Favoriten',
      settings: 'Einstellungen'
    },
    swipe: {
      title: 'Wischen',
      noMovies: 'Keine Filme verfügbar',
      swipeRight: 'Nach rechts wischen - zu Favoriten hinzufügen',
      swipeLeft: 'Nach links wischen - überspringen'
    },
    mood: {
      title: 'Wähle deine Stimmung',
      subtitle: 'Wähle eine oder mehrere Stimmungen und wir suchen einen Film für dich aus',
      selectMovie: 'Film auswählen',
      reset: 'Zurücksetzen',
      weSelected: 'Wir haben für dich ausgewählt:',
      addToFavorites: '❤️ Zu Favoriten hinzufügen',
      moreDetails: '📖 Mehr Details',
      anotherMovie: '🔄 Anderer Film',
      backToSelection: '← Zurück zur Auswahl',
      selectAtLeastOne: '⚠️ Wähle mindestens eine Stimmung',
      noMoviesFound: '😔 Keine Filme mit ausgewählten Stimmungen gefunden'
    },
    catalog: {
      title: 'Filmkatalog',
      searchPlaceholder: 'Suche nach Titel, Schauspielern, Regisseur...',
      filters: 'Filter',
      showFilters: 'Filter anzeigen',
      hideFilters: 'Filter ausblenden',
      genres: 'Genres',
      countries: 'Länder',
      contentType: 'Inhaltstyp',
      rating: 'Bewertung',
      year: 'Erscheinungsjahr',
      showMore: 'Mehr anzeigen',
      moviesRemaining: 'Filme',
      noMovies: 'Keine Filme gefunden'
    },
    favorites: {
      title: 'Favoriten',
      empty: 'Du hast noch keine Lieblingsfilme',
      sortByDate: 'Nach Datum hinzugefügt',
      sortByTitle: 'Nach Titel',
      sortByRating: 'Nach Bewertung',
      removeFromFavorites: 'Aus Favoriten entfernen'
    },
    details: {
      director: 'Regisseur',
      cast: 'Besetzung',
      duration: 'Dauer',
      year: 'Jahr',
      rating: 'Bewertung',
      genres: 'Genres',
      addToFavorites: 'Zu Favoriten hinzufügen',
      inFavorites: 'In Favoriten',
      loadingDetails: 'Details werden geladen...'
    },
    settings: {
      title: 'Einstellungen',
      theme: 'Theme',
      themeDark: 'Dunkel',
      themeLight: 'Hell',
      language: 'Sprache der Benutzeroberfläche',
      languageRu: 'Русский',
      languageEn: 'English',
      languageDe: 'Deutsch',
      dataSource: 'Datenquelle',
      tmdbSource: 'IMDB / TMDB',
      kinopoiskSource: 'Kinopoisk',
      localSource: 'Lokales JSON',
      apiKey: 'API-Schlüssel',
      apiKeyPlaceholder: 'Gib deinen API-Schlüssel ein',
      updateCatalog: 'Katalog aktualisieren',
      clearData: 'Daten löschen',
      about: 'Über',
      showAdultContent: '18+ Inhalte anzeigen',
      contentTypeFilters: 'Inhaltstyp-Filter',
      showMovies: 'Filme anzeigen',
      showSeries: 'Serien anzeigen'
    },
    moods: {
      'light-positive': 'Leicht & Positiv',
      'romance': 'Romantik',
      'energize': 'Energie tanken',
      'relax': 'Entspannen',
      'emotional': 'Emotional',
      'comedy': 'Komödie',
      'philosophical': 'Philosophisch',
      'adrenaline': 'Adrenalin',
      'cozy': 'Gemütlich',
      'nostalgia': 'Nostalgie',
      'horror': 'Horror',
      'fantasy': 'Fantasy'
    }
  }
};

// Хук для получения переводов
export function useTranslations(language: Language = 'ru'): Translations {
  return translations[language];
}

// Функция для получения перевода
export function t(key: string, language: Language = 'ru'): string {
  const keys = key.split('.');
  let value: any = translations[language];
  
  for (const k of keys) {
    value = value?.[k];
    if (value === undefined) return key;
  }
  
  return value || key;
}
