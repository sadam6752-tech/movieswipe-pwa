#!/usr/bin/env node

/**
 * Скрипт для генерации JSON файлов с фильмами по жанрам из TMDB API
 * 
 * Использование:
 * TMDB_API_KEY=your_api_key node scripts/generate-genre-files.js
 * 
 * Или с параметрами:
 * TMDB_API_KEY=your_api_key node scripts/generate-genre-files.js --genre comedy --limit 500
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// Конфигурация
const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p';
const OUTPUT_DIR = path.join(__dirname, '../public/data');

// Маппинг жанров TMDB на наши жанры
const GENRE_MAPPING = {
  28: 'action',
  12: 'adventure',
  16: 'animation',
  35: 'comedy',
  80: 'detective',
  99: 'documentary',
  18: 'drama',
  10751: 'family',
  14: 'fantasy',
  36: 'historical',
  27: 'horror',
  10402: 'musical',
  9648: 'detective',
  10749: 'romance',
  878: 'sci-fi',
  53: 'thriller',
  10752: 'war'
};

// Маппинг жанров на настроения
const GENRE_TO_MOOD = {
  'action': ['adrenaline', 'energize'],
  'adventure': ['adrenaline', 'fantasy'],
  'animation': ['light-positive', 'cozy'],
  'comedy': ['comedy', 'light-positive'],
  'detective': ['adrenaline', 'philosophical'],
  'documentary': ['philosophical'],
  'drama': ['emotional', 'philosophical'],
  'family': ['cozy', 'light-positive'],
  'fantasy': ['fantasy', 'cozy'],
  'historical': ['philosophical', 'nostalgia'],
  'horror': ['horror', 'adrenaline'],
  'musical': ['energize', 'light-positive'],
  'romance': ['romance', 'emotional'],
  'sci-fi': ['fantasy', 'philosophical'],
  'thriller': ['adrenaline', 'horror'],
  'war': ['emotional', 'philosophical']
};

// Обратный маппинг: наш жанр -> TMDB ID
const OUR_GENRE_TO_TMDB = {};
Object.entries(GENRE_MAPPING).forEach(([tmdbId, ourGenre]) => {
  if (!OUR_GENRE_TO_TMDB[ourGenre]) {
    OUR_GENRE_TO_TMDB[ourGenre] = [];
  }
  OUR_GENRE_TO_TMDB[ourGenre].push(parseInt(tmdbId));
});

// Утилита для HTTP запросов
function httpsGet(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

// Задержка
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Конвертация TMDB фильма в наш формат
function convertMovie(tmdbMovie, primaryGenre) {
  const genres = new Set();
  genres.add(primaryGenre);
  
  // Добавляем другие жанры
  tmdbMovie.genre_ids?.forEach(id => {
    const genre = GENRE_MAPPING[id];
    if (genre) genres.add(genre);
  });

  const genreArray = Array.from(genres);
  
  // Генерируем настроения на основе жанров
  const moods = new Set();
  genreArray.forEach(genre => {
    const genreMoods = GENRE_TO_MOOD[genre];
    if (genreMoods) {
      genreMoods.forEach(mood => moods.add(mood));
    }
  });

  return {
    id: `${primaryGenre}-${tmdbMovie.id}`,
    title: tmdbMovie.title,
    originalTitle: tmdbMovie.original_title,
    year: tmdbMovie.release_date ? new Date(tmdbMovie.release_date).getFullYear() : 0,
    description: tmdbMovie.overview || 'Описание отсутствует',
    genres: genreArray,
    moods: Array.from(moods),
    rating: Math.round(tmdbMovie.vote_average * 10) / 10,
    duration: 120, // Примерная длительность
    director: 'Неизвестно',
    cast: [],
    poster: tmdbMovie.poster_path 
      ? `${TMDB_IMAGE_BASE}/w500${tmdbMovie.poster_path}`
      : '',
    backdrop: tmdbMovie.backdrop_path
      ? `${TMDB_IMAGE_BASE}/w1280${tmdbMovie.backdrop_path}`
      : '',
    language: 'ru',
    isFavorite: false,
    watchStatus: 'unwatched',
    source: 'local',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

// Загрузка фильмов по жанру
async function fetchMoviesByGenre(genre, limit = 500) {
  console.log(`\n📥 Загрузка жанра: ${genre}`);
  
  const tmdbGenreIds = OUR_GENRE_TO_TMDB[genre];
  if (!tmdbGenreIds || tmdbGenreIds.length === 0) {
    console.error(`❌ Жанр "${genre}" не найден в маппинге`);
    return [];
  }

  const movies = [];
  const moviesPerPage = 20;
  const totalPages = Math.ceil(limit / moviesPerPage);
  const seenIds = new Set();

  for (let page = 1; page <= totalPages && movies.length < limit; page++) {
    try {
      // Используем discover API для фильтрации по жанру
      const url = `${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&language=ru-RU&sort_by=popularity.desc&with_genres=${tmdbGenreIds[0]}&page=${page}`;
      
      const data = await httpsGet(url);
      
      if (!data.results) {
        console.error(`❌ Нет результатов для страницы ${page}`);
        continue;
      }

      for (const tmdbMovie of data.results) {
        if (movies.length >= limit) break;
        
        // Избегаем дубликатов
        if (seenIds.has(tmdbMovie.id)) continue;
        seenIds.add(tmdbMovie.id);

        const movie = convertMovie(tmdbMovie, genre);
        movies.push(movie);
      }

      console.log(`  ✓ Страница ${page}/${totalPages}: ${movies.length}/${limit} фильмов`);

      // Rate limiting: 250ms между запросами
      await sleep(250);
    } catch (error) {
      console.error(`  ❌ Ошибка на странице ${page}:`, error.message);
    }
  }

  console.log(`✅ Загружено ${movies.length} фильмов для жанра "${genre}"`);
  return movies;
}

// Сохранение в JSON файл
function saveToFile(genre, movies) {
  const filename = `movies-${genre}.json`;
  const filepath = path.join(OUTPUT_DIR, filename);
  
  const data = {
    movies: movies
  };

  fs.writeFileSync(filepath, JSON.stringify(data, null, 2), 'utf8');
  
  const sizeKB = (fs.statSync(filepath).size / 1024).toFixed(2);
  console.log(`💾 Сохранено: ${filename} (${sizeKB} KB)`);
}

// Генерация базового файла с популярными фильмами
async function generateBaseFile(limit = 100) {
  console.log(`\n📥 Генерация базового файла (${limit} популярных фильмов)`);
  
  const movies = [];
  const moviesPerPage = 20;
  const totalPages = Math.ceil(limit / moviesPerPage);
  const seenIds = new Set();

  for (let page = 1; page <= totalPages && movies.length < limit; page++) {
    try {
      const url = `${TMDB_BASE_URL}/movie/popular?api_key=${TMDB_API_KEY}&language=ru-RU&page=${page}`;
      const data = await httpsGet(url);
      
      if (!data.results) continue;

      for (const tmdbMovie of data.results) {
        if (movies.length >= limit) break;
        if (seenIds.has(tmdbMovie.id)) continue;
        seenIds.add(tmdbMovie.id);

        // Определяем основной жанр
        const primaryGenreId = tmdbMovie.genre_ids?.[0];
        const primaryGenre = GENRE_MAPPING[primaryGenreId] || 'drama';

        const movie = convertMovie(tmdbMovie, primaryGenre);
        movies.push(movie);
      }

      console.log(`  ✓ Страница ${page}/${totalPages}: ${movies.length}/${limit} фильмов`);
      await sleep(250);
    } catch (error) {
      console.error(`  ❌ Ошибка на странице ${page}:`, error.message);
    }
  }

  const filepath = path.join(OUTPUT_DIR, 'movies.json');
  const data = { movies };
  fs.writeFileSync(filepath, JSON.stringify(data, null, 2), 'utf8');
  
  const sizeKB = (fs.statSync(filepath).size / 1024).toFixed(2);
  console.log(`✅ Базовый файл сохранен: movies.json (${sizeKB} KB, ${movies.length} фильмов)`);
}

// Главная функция
async function main() {
  console.log('🎬 MovieSwipe - Генератор файлов по жанрам\n');

  // Проверка API ключа
  if (!TMDB_API_KEY) {
    console.error('❌ Ошибка: TMDB_API_KEY не установлен');
    console.log('\nИспользование:');
    console.log('  TMDB_API_KEY=your_key node scripts/generate-genre-files.js');
    console.log('\nПолучить API ключ: https://www.themoviedb.org/settings/api');
    process.exit(1);
  }

  // Создаем директорию если не существует
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // Парсинг аргументов
  const args = process.argv.slice(2);
  const genreArg = args.find(arg => arg.startsWith('--genre='));
  const limitArg = args.find(arg => arg.startsWith('--limit='));
  const baseArg = args.includes('--base-only');

  const specificGenre = genreArg ? genreArg.split('=')[1] : null;
  const limit = limitArg ? parseInt(limitArg.split('=')[1]) : 500;

  // Генерация базового файла
  if (baseArg || !specificGenre) {
    await generateBaseFile(100);
  }

  if (baseArg) {
    console.log('\n✅ Готово!');
    return;
  }

  // Список жанров для генерации
  const genresToGenerate = specificGenre 
    ? [specificGenre]
    : Object.keys(OUR_GENRE_TO_TMDB);

  console.log(`\n📋 Жанры для генерации: ${genresToGenerate.join(', ')}`);
  console.log(`📊 Лимит фильмов на жанр: ${limit}\n`);

  // Генерация файлов по жанрам
  for (const genre of genresToGenerate) {
    try {
      const movies = await fetchMoviesByGenre(genre, limit);
      if (movies.length > 0) {
        saveToFile(genre, movies);
      }
    } catch (error) {
      console.error(`❌ Ошибка при генерации жанра "${genre}":`, error.message);
    }
  }

  console.log('\n✅ Генерация завершена!');
  console.log(`📁 Файлы сохранены в: ${OUTPUT_DIR}`);
}

// Запуск
main().catch(error => {
  console.error('❌ Критическая ошибка:', error);
  process.exit(1);
});
