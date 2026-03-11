import type { Genre } from '../types/movie';

// Переводы жанров (убраны: animation, anime, concert - теперь это типы контента)
export const GENRE_LABELS: Record<Genre, { ru: string; en: string; de: string }> = {
  'action': { ru: 'Боевик', en: 'Action', de: 'Action' },
  'adventure': { ru: 'Приключения', en: 'Adventure', de: 'Abenteuer' },
  'biography': { ru: 'Биографический', en: 'Biography', de: 'Biografie' },
  'comedy': { ru: 'Комедия', en: 'Comedy', de: 'Komödie' },
  'crime': { ru: 'Криминал', en: 'Crime', de: 'Krimi' },
  'detective': { ru: 'Детектив', en: 'Detective', de: 'Detektiv' },
  'documentary': { ru: 'Документальный', en: 'Documentary', de: 'Dokumentarfilm' },
  'drama': { ru: 'Драма', en: 'Drama', de: 'Drama' },
  'erotic': { ru: 'Эротика', en: 'Erotic', de: 'Erotik' },
  'family': { ru: 'Семейный', en: 'Family', de: 'Familie' },
  'fantasy': { ru: 'Фэнтези', en: 'Fantasy', de: 'Fantasy' },
  'historical': { ru: 'Исторический', en: 'Historical', de: 'Historisch' },
  'horror': { ru: 'Ужасы', en: 'Horror', de: 'Horror' },
  'kids': { ru: 'Детский', en: 'Kids', de: 'Kinder' },
  'comic': { ru: 'Кинокомикс', en: 'Comic', de: 'Comic' },
  'melodrama': { ru: 'Мелодрама', en: 'Melodrama', de: 'Melodram' },
  'music': { ru: 'Музыка', en: 'Music', de: 'Musik' },
  'musical': { ru: 'Мюзикл', en: 'Musical', de: 'Musical' },
  'mystery': { ru: 'Мистика', en: 'Mystery', de: 'Mystery' },
  'noir': { ru: 'Нуар', en: 'Noir', de: 'Noir' },
  'reality': { ru: 'Реалити-шоу', en: 'Reality Show', de: 'Reality-Show' },
  'romance': { ru: 'Романтика', en: 'Romance', de: 'Romantik' },
  'sci-fi': { ru: 'Фантастика', en: 'Sci-Fi', de: 'Science-Fiction' },
  'short': { ru: 'Короткометражный', en: 'Short Film', de: 'Kurzfilm' },
  'sport': { ru: 'Спорт', en: 'Sport', de: 'Sport' },
  'talk-show': { ru: 'Ток-шоу', en: 'Talk Show', de: 'Talkshow' },
  'thriller': { ru: 'Триллер', en: 'Thriller', de: 'Thriller' },
  'war': { ru: 'Военный', en: 'War', de: 'Kriegsfilm' },
  'western': { ru: 'Вестерн', en: 'Western', de: 'Western' }
};

// Список всех жанров в алфавитном порядке (по русскому)
// Убраны: animation, anime, concert - теперь это типы контента
export const ALL_GENRES: Genre[] = [
  'biography',
  'action',
  'western',
  'war',
  'detective',
  'kids',
  'documentary',
  'drama',
  'historical',
  'comic',
  'comedy',
  'short',
  'crime',
  'melodrama',
  'mystery',
  'music',
  'musical',
  'sci-fi',
  'noir',
  'adventure',
  'reality',
  'family',
  'sport',
  'talk-show',
  'thriller',
  'horror',
  'fantasy',
  'erotic',
  'romance'
];

// Получить название жанра на нужном языке
export function getGenreLabel(genre: Genre, language: 'ru' | 'en' | 'de' = 'ru'): string {
  return GENRE_LABELS[genre]?.[language] || genre;
}

// Получить все жанры с переводами
export function getAllGenresWithLabels(language: 'ru' | 'en' | 'de' = 'ru'): Array<{ value: Genre; label: string }> {
  return ALL_GENRES.map(genre => ({
    value: genre,
    label: getGenreLabel(genre, language)
  }));
}
