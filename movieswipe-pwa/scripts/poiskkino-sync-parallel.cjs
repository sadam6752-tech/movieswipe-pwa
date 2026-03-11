#!/usr/bin/env node

/**
 * ПоискКино Parallel Sync - Параллельная загрузка с двумя API ключами
 * 
 * Использование:
 * node poiskkino-sync-parallel.cjs API_KEY_1 API_KEY_2
 */

const { spawn } = require('child_process');
const path = require('path');

const args = process.argv.slice(2);

if (args.length < 2) {
  console.error('❌ Ошибка: Нужно указать два API ключа');
  console.log('\nИспользование:');
  console.log('  node poiskkino-sync-parallel.cjs API_KEY_1 API_KEY_2');
  console.log('\nПример:');
  console.log('  node poiskkino-sync-parallel.cjs ABC123 XYZ789');
  process.exit(1);
}

const [apiKey1, apiKey2] = args;

console.log('🚀 Параллельная синхронизация с двумя API ключами');
console.log('=' .repeat(60));
console.log('');
console.log('📋 Стратегия:');
console.log('  API Key 1: Загрузка новых фильмов (2019-2024)');
console.log('  API Key 2: Загрузка старых фильмов (2000-2018)');
console.log('');
console.log('⚡ Это загрузит ~100,000 фильмов за один день!');
console.log('');
console.log('=' .repeat(60));
console.log('');

// Создаем два отдельных файла прогресса
const progress1 = {
  lastCursor: null,
  totalMovies: 0,
  requestsToday: 0,
  lastRequestDate: null,
  yearRange: {
    start: 2019,
    end: new Date().getFullYear()
  },
  completed: false
};

const progress2 = {
  lastCursor: null,
  totalMovies: 0,
  requestsToday: 0,
  lastRequestDate: null,
  yearRange: {
    start: 2000,
    end: 2018
  },
  completed: false
};

const fs = require('fs');
fs.writeFileSync(
  path.join(__dirname, '.sync-progress-1.json'),
  JSON.stringify(progress1, null, 2)
);
fs.writeFileSync(
  path.join(__dirname, '.sync-progress-2.json'),
  JSON.stringify(progress2, null, 2)
);

// Запускаем два процесса
console.log('🎬 Запуск процесса 1 (новые фильмы 2019-2024)...');
const process1 = spawn('node', [
  path.join(__dirname, 'poiskkino-sync-worker.cjs'),
  apiKey1,
  '.sync-progress-1.json',
  'movies-poiskkino-new.json'
], {
  stdio: 'inherit'
});

setTimeout(() => {
  console.log('\n🎬 Запуск процесса 2 (старые фильмы 2000-2018)...\n');
  const process2 = spawn('node', [
    path.join(__dirname, 'poiskkino-sync-worker.cjs'),
    apiKey2,
    '.sync-progress-2.json',
    'movies-poiskkino-old.json'
  ], {
    stdio: 'inherit'
  });

  process2.on('close', (code) => {
    console.log(`\n✅ Процесс 2 завершен с кодом ${code}`);
    checkCompletion();
  });
}, 2000);

process1.on('close', (code) => {
  console.log(`\n✅ Процесс 1 завершен с кодом ${code}`);
  checkCompletion();
});

let completed = 0;
function checkCompletion() {
  completed++;
  if (completed === 2) {
    console.log('\n' + '='.repeat(60));
    console.log('🎉 Оба процесса завершены!');
    console.log('\n📝 Теперь объедини файлы:');
    console.log('  node merge-movies.cjs');
    console.log('='.repeat(60));
  }
}
