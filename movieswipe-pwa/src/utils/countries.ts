import type { Country } from '../types/movie';

// ТОП-10 стран по производству фильмов
export const TOP_COUNTRIES: Country[] = [
  'США',
  'Россия',
  'Франция',
  'Великобритания',
  'Германия',
  'Италия',
  'Испания',
  'Япония',
  'Южная Корея',
  'Индия',
  'Другие'
];

// Переводы названий стран
export const COUNTRY_LABELS: Record<Country, { ru: string; en: string; de: string }> = {
  'США': { ru: 'США', en: 'USA', de: 'USA' },
  'Россия': { ru: 'Россия', en: 'Russia', de: 'Russland' },
  'Франция': { ru: 'Франция', en: 'France', de: 'Frankreich' },
  'Великобритания': { ru: 'Великобритания', en: 'United Kingdom', de: 'Vereinigtes Königreich' },
  'Германия': { ru: 'Германия', en: 'Germany', de: 'Deutschland' },
  'Италия': { ru: 'Италия', en: 'Italy', de: 'Italien' },
  'Испания': { ru: 'Испания', en: 'Spain', de: 'Spanien' },
  'Япония': { ru: 'Япония', en: 'Japan', de: 'Japan' },
  'Южная Корея': { ru: 'Южная Корея', en: 'South Korea', de: 'Südkorea' },
  'Индия': { ru: 'Индия', en: 'India', de: 'Indien' },
  'Другие': { ru: 'Другие', en: 'Other', de: 'Andere' }
};

// Маппинг различных вариантов написания стран к нашим стандартным названиям
export const COUNTRY_MAPPING: Record<string, Country> = {
  // США
  'США': 'США',
  'US': 'США',
  'USA': 'США',
  'United States': 'США',
  'United States of America': 'США',
  'Соединенные Штаты': 'США',
  
  // Россия
  'Россия': 'Россия',
  'Russia': 'Россия',
  'Russian Federation': 'Россия',
  'СССР': 'Россия',
  'Soviet Union': 'Россия',
  
  // Франция
  'Франция': 'Франция',
  'France': 'Франция',
  
  // Великобритания
  'Великобритания': 'Великобритания',
  'UK': 'Великобритания',
  'United Kingdom': 'Великобритания',
  'Britain': 'Великобритания',
  'England': 'Великобритания',
  'Англия': 'Великобритания',
  
  // Германия
  'Германия': 'Германия',
  'Germany': 'Германия',
  'ФРГ': 'Германия',
  'West Germany': 'Германия',
  'East Germany': 'Германия',
  
  // Италия
  'Италия': 'Италия',
  'Italy': 'Италия',
  
  // Испания
  'Испания': 'Испания',
  'Spain': 'Испания',
  
  // Япония
  'Япония': 'Япония',
  'Japan': 'Япония',
  
  // Южная Корея
  'Южная Корея': 'Южная Корея',
  'South Korea': 'Южная Корея',
  'Korea': 'Южная Корея',
  'Корея': 'Южная Корея',
  
  // Индия
  'Индия': 'Индия',
  'India': 'Индия'
};

// Получить стандартное название страны
export function normalizeCountry(country: string): Country {
  const normalized = COUNTRY_MAPPING[country];
  return normalized || 'Другие';
}

// Получить название страны на нужном языке
export function getCountryLabel(country: Country, language: 'ru' | 'en' | 'de' = 'ru'): string {
  return COUNTRY_LABELS[country]?.[language] || country;
}

// Получить все страны с переводами
export function getAllCountriesWithLabels(language: 'ru' | 'en' | 'de' = 'ru'): Array<{ value: Country; label: string }> {
  return TOP_COUNTRIES.map(country => ({
    value: country,
    label: getCountryLabel(country, language)
  }));
}

// Нормализовать массив стран из API
export function normalizeCountries(countries: string[]): string[] {
  if (!countries || countries.length === 0) {
    return ['Другие'];
  }
  
  const normalized = countries
    .map(c => normalizeCountry(c))
    .filter((c, index, self) => self.indexOf(c) === index); // убираем дубликаты
  
  return normalized.length > 0 ? normalized : ['Другие'];
}
