#!/usr/bin/env node

/**
 * Экспорт базы данных фильмов
 * 
 * Копирует файл movies-poiskkino.json и прогресс синхронизации
 * для переноса на другой сервер
 */

const fs = require('fs');
const path = require('path');

const SOURCE_FILE = path.join(__dirname, '../public/data/movies-poiskkino.json');
const PROGRESS_FILE = path.join(__dirname, '.sync-progress.json');
const EXPORT_DIR = path.join(__dirname, 'export');
const TIMESTAMP = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);

async function exportDatabase() {
  console.log('📦 Экспорт базы данных...\n');

  try {
    // Создаём папку для экспорта
    if (!fs.existsSync(EXPORT_DIR)) {
      fs.mkdirSync(EXPORT_DIR, { recursive: true });
    }

    // Проверяем наличие файла с фильмами
    if (!fs.existsSync(SOURCE_FILE)) {
      console.error('❌ Файл movies-poiskkino.json не найден!');
      console.error(`   Путь: ${SOURCE_FILE}`);
      process.exit(1);
    }

    // Читаем файл с фильмами
    const moviesData = fs.readFileSync(SOURCE_FILE, 'utf8');
    const moviesArray = JSON.parse(moviesData);
    
    // Проверяем формат (массив или объект с полем movies)
    const movies = Array.isArray(moviesArray) ? moviesArray : moviesArray.movies || [];

    console.log(`✅ Найдено фильмов: ${movies.length}`);

    // Читаем прогресс синхронизации (если есть)
    let progress = null;
    if (fs.existsSync(PROGRESS_FILE)) {
      const progressData = fs.readFileSync(PROGRESS_FILE, 'utf8');
      progress = JSON.parse(progressData);
      console.log(`✅ Прогресс синхронизации: ${progress.totalMovies} фильмов, ${progress.requestsUsed} запросов`);
    }

    // Создаём архив для экспорта
    const exportData = {
      exportDate: new Date().toISOString(),
      movies: movies,
      progress: progress,
      stats: {
        totalMovies: movies.length,
        requestsUsed: progress?.requestsUsed || 0,
        lastSync: progress?.lastSync || null
      }
    };

    // Сохраняем в файл
    const exportFileName = `movieswipe-db-${TIMESTAMP}.json`;
    const exportPath = path.join(EXPORT_DIR, exportFileName);
    
    fs.writeFileSync(exportPath, JSON.stringify(exportData, null, 2), 'utf8');

    // Получаем размер файла
    const stats = fs.statSync(exportPath);
    const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);

    console.log('\n✅ Экспорт завершён!');
    console.log(`📁 Файл: ${exportPath}`);
    console.log(`📊 Размер: ${fileSizeMB} MB`);
    console.log(`🎬 Фильмов: ${movies.length}`);
    
    if (progress) {
      console.log(`📈 Запросов использовано: ${progress.requestsUsed}`);
      console.log(`📅 Последняя синхронизация: ${new Date(progress.lastSync).toLocaleString('ru-RU')}`);
    }

    console.log('\n📤 Для переноса на другой сервер:');
    console.log(`   1. Скопируйте файл: ${exportFileName}`);
    console.log(`   2. На другом сервере запустите: node import-db.cjs ${exportFileName}`);

  } catch (error) {
    console.error('❌ Ошибка экспорта:', error.message);
    process.exit(1);
  }
}

// Запуск
exportDatabase();
