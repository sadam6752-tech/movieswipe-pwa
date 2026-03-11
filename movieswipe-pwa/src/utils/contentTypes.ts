import type { ContentType } from '../types/movie';

// Все типы контента
export const ALL_CONTENT_TYPES: ContentType[] = [
  'movie',
  'tv-series',
  'cartoon',
  'anime',
  'animated-series',
  'tv-show',
  'concert'
];

// Переводы типов контента
export const CONTENT_TYPE_LABELS: Record<ContentType, { ru: string; en: string; de: string }> = {
  'movie': { ru: 'Фильмы', en: 'Movies', de: 'Filme' },
  'tv-series': { ru: 'Сериалы', en: 'TV Series', de: 'Serien' },
  'cartoon': { ru: 'Мультфильмы', en: 'Cartoons', de: 'Zeichentrickfilme' },
  'anime': { ru: 'Аниме', en: 'Anime', de: 'Anime' },
  'animated-series': { ru: 'Мультсериалы', en: 'Animated Series', de: 'Animationsserien' },
  'tv-show': { ru: 'ТВ-шоу', en: 'TV Shows', de: 'TV-Shows' },
  'concert': { ru: 'Концерты', en: 'Concerts', de: 'Konzerte' }
};

// Получить название типа контента на нужном языке
export function getContentTypeLabel(contentType: ContentType, language: 'ru' | 'en' | 'de' = 'ru'): string {
  return CONTENT_TYPE_LABELS[contentType]?.[language] || contentType;
}

// Получить все типы контента с переводами
export function getAllContentTypesWithLabels(language: 'ru' | 'en' | 'de' = 'ru'): Array<{ value: ContentType; label: string }> {
  return ALL_CONTENT_TYPES.map(type => ({
    value: type,
    label: getContentTypeLabel(type, language)
  }));
}
