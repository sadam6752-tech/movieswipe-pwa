#!/usr/bin/env node

/**
 * Импорт базы данных фильмов
 * 
 * Импортирует файл, экспортированный с другого сервера
 */

const fs = require('fs');
const path = require('path');

const TARGET_FILE = path.join(__dirname, '../public/data/movies-poiskkino.json');
const PROGRESS_FILE = path.join(__dirname, '.sync-progress.json');
const EXPORT_DIR = path.join(__dirname, 'export');

async function importDatabase(fileName) {
  console.log('📥 Импорт базы данных...\n');

  try {
    // Определяем путь к файлу импорта
    let importPath;
    
    if (fileName) {
      // Если указано имя файла, ищем в папке export
      importPath = path.join(EXPORT_DIR, fileName);
      
      if (!fs.existsSync(importPath)) {
        // Пробуем абсолютный путь
        importPath = path.resolve(fileName);
      }
    } else {
      // Если не указано, берём последний файл из export
      if (!fs.existsSync(EXPORT_DIR)) {
        console.error('❌ Папка export не найдена!');
        console.error('   Использование: node import-db.cjs <файл>');
        process.exit(1);
      }

      const files = fs.readdirSync(EXPORT_DIR)
        .filter(f => f.startsWith('movieswipe-db-') && f.endsWith('.json'))
        .sort()
        .reverse();

      if (files.length === 0) {
        console.error('❌ Файлы экспорта не найдены в папке export/');
        process.exit(1);
      }

      importPath = path.join(EXPORT_DIR, files[0]);
      console.log(`📁 Используется последний экспорт: ${files[0]}`);
    }

    // Проверяем наличие файла
    if (!fs.existsSync(importPath)) {
      console.error(`❌ Файл не найден: ${importPath}`);
      process.exit(1);
    }

    // Читаем файл импорта
    console.log(`📖 Чтение файла: ${path.basename(importPath)}`);
    const importData = JSON.parse(fs.readFileSync(importPath, 'utf8'));

    // Проверяем структуру и поддерживаем разные форматы
    let movies;
    let progress = null;
    let exportDate;

    // Формат 1: { movies: [...], progress: {...}, ... }
    if (importData.movies && Array.isArray(importData.movies)) {
      movies = importData.movies;
      progress = importData.progress;
      exportDate = importData.exportDate;
    }
    // Формат 2: просто массив фильмов
    else if (Array.isArray(importData)) {
      movies = importData;
      exportDate = new Date().toISOString();
      console.log('⚠️  Старый формат экспорта (только массив фильмов)');
    }
    // Формат 3: { movies: [...] } без дополнительных полей
    else if (importData.movies) {
      movies = importData.movies;
      exportDate = new Date().toISOString();
    }
    else {
      console.error('❌ Неверный формат файла импорта!');
      console.error('   Ожидается один из форматов:');
      console.error('   1. { "movies": [...], "progress": {...}, ... }');
      console.error('   2. [...] (массив фильмов)');
      console.error('   3. { "movies": [...] }');
      console.error(`   Получено: ${JSON.stringify(Object.keys(importData)).slice(0, 100)}`);
      process.exit(1);
    }

    if (!Array.isArray(movies) || movies.length === 0) {
      console.error('❌ Массив фильмов пуст или неверный!');
      process.exit(1);
    }

    console.log(`✅ Найдено фильмов: ${movies.length}`);
    if (exportDate) {
      console.log(`📅 Дата экспорта: ${new Date(exportDate).toLocaleString('ru-RU')}`);
    }

    // Создаём резервную копию текущей базы (если есть)
    if (fs.existsSync(TARGET_FILE)) {
      const backupPath = TARGET_FILE.replace('.json', `-backup-${Date.now()}.json`);
      fs.copyFileSync(TARGET_FILE, backupPath);
      console.log(`💾 Создана резервная копия: ${path.basename(backupPath)}`);
    }

    // Создаём папку data если не существует
    const dataDir = path.dirname(TARGET_FILE);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    // Сохраняем фильмы (как массив, не объект)
    fs.writeFileSync(TARGET_FILE, JSON.stringify(movies, null, 2), 'utf8');
    console.log(`✅ Фильмы импортированы: ${TARGET_FILE}`);

    // Сохраняем прогресс (если есть)
    if (progress) {
      // Создаём резервную копию прогресса
      if (fs.existsSync(PROGRESS_FILE)) {
        const progressBackup = PROGRESS_FILE.replace('.json', `-backup-${Date.now()}.json`);
        fs.copyFileSync(PROGRESS_FILE, progressBackup);
      }

      fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2), 'utf8');
      console.log(`✅ Прогресс синхронизации импортирован`);
      console.log(`   Запросов использовано: ${progress.requestsUsed || 0}`);
      console.log(`   Последняя синхронизация: ${new Date(progress.lastSync).toLocaleString('ru-RU')}`);
    }

    console.log('\n✅ Импорт завершён успешно!');
    console.log(`🎬 Всего фильмов: ${movies.length}`);
    console.log('\n📝 Следующие шаги:');
    console.log('   1. Пересоберите проект: npm run build');
    console.log('   2. Перезапустите сервер: sudo systemctl restart nginx');
    console.log('   3. Откройте приложение в браузере');

  } catch (error) {
    console.error('❌ Ошибка импорта:', error.message);
    process.exit(1);
  }
}

// Получаем имя файла из аргументов
const fileName = process.argv[2];

// Запуск
importDatabase(fileName);
