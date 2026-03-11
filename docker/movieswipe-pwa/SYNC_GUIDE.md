# 🎬 MovieSwipe PWA - Data Synchronization Guide

## Обзор

Docker Compose включает два сервиса:

1. **movieswipe-pwa** - Веб-приложение (Nginx + React PWA)
2. **movieswipe-sync** - Сервис синхронизации данных (Node.js скрипты)

---

## Запуск приложения

### Способ 1: Только приложение (без синхронизации)

```bash
cd docker/movieswipe-pwa
docker-compose up -d
```

Приложение будет доступно на http://localhost:3000

### Способ 2: Приложение + синхронизация

```bash
cd docker/movieswipe-pwa

# Создать .env файл с API ключами
cp .env.example .env
# Отредактировать .env и добавить свои API ключи

# Запустить оба сервиса
docker-compose --profile sync up -d
```

---

## Синхронизация данных

### Запуск синхронизации вручную

```bash
# Запустить скрипт Poiskkino синхронизации
docker-compose run movieswipe-sync node scripts/poiskkino-sync.cjs

# Или запустить другой скрипт
docker-compose run movieswipe-sync node scripts/export-db.cjs
```

### Запуск синхронизации с переменными окружения

```bash
docker-compose run -e TMDB_API_KEY=your_key movieswipe-sync node scripts/poiskkino-sync.cjs
```

### Просмотр логов синхронизации

```bash
docker-compose logs movieswipe-sync
```

---

## Структура данных

Данные фильмов хранятся в:

```
movieswipe-pwa/public/data/
├── movies-poiskkino.json      # Финские фильмы
├── movies.json                # Основная база
└── movies-poiskkino.backup.json # Резервная копия
```

Эти файлы монтируются в контейнер как volume:

```yaml
volumes:
  - ./../../movieswipe-pwa/public/data:/app/public/data
```

---

## API Ключи

### TMDB API Key

1. Перейти на https://www.themoviedb.org/settings/api
2. Создать аккаунт (если нет)
3. Запросить API ключ
4. Скопировать ключ в `.env` файл

### Poiskkino API Key

1. Перейти на https://www.poiskkino.fi/
2. Зарегистрироваться
3. Получить API ключ
4. Скопировать ключ в `.env` файл

---

## Примеры использования

### Пример 1: Запустить приложение и синхронизировать данные

```bash
cd docker/movieswipe-pwa

# Создать .env
cp .env.example .env
# Отредактировать .env

# Запустить приложение
docker-compose up -d movieswipe-pwa

# Запустить синхронизацию
docker-compose run movieswipe-sync node scripts/poiskkino-sync.cjs

# Проверить результат на http://localhost:3000
```

### Пример 2: Запустить только синхронизацию

```bash
cd docker/movieswipe-pwa

# Создать .env
cp .env.example .env

# Запустить синхронизацию
docker-compose run movieswipe-sync node scripts/poiskkino-sync.cjs

# Данные будут сохранены в movieswipe-pwa/public/data/
```

### Пример 3: Запустить несколько скриптов синхронизации

```bash
cd docker/movieswipe-pwa

# Экспортировать базу данных
docker-compose run movieswipe-sync node scripts/export-db.cjs

# Синхронизировать Poiskkino
docker-compose run movieswipe-sync node scripts/poiskkino-sync.cjs

# Синхронизировать с несколькими ключами
docker-compose run movieswipe-sync node scripts/poiskkino-sync-multi.cjs
```

---

## Остановка сервисов

```bash
# Остановить все сервисы
docker-compose down

# Остановить только приложение
docker-compose stop movieswipe-pwa

# Остановить и удалить контейнеры
docker-compose down -v
```

---

## Troubleshooting

### Проблема: "Cannot find module 'scripts/poiskkino-sync.cjs'"

**Решение**: Убедитесь, что вы находитесь в директории `docker/movieswipe-pwa` и файлы скопированы правильно.

```bash
docker-compose run movieswipe-sync ls -la scripts/
```

### Проблема: "API key not found"

**Решение**: Создайте `.env` файл и добавьте API ключи:

```bash
cp .env.example .env
# Отредактировать .env
```

### Проблема: "Permission denied" при записи данных

**Решение**: Проверьте права доступа к директории `movieswipe-pwa/public/data/`:

```bash
chmod 755 movieswipe-pwa/public/data/
```

---

## Автоматизация синхронизации

### Использование cron (на хосте)

```bash
# Добавить в crontab
0 2 * * * cd /path/to/docker/movieswipe-pwa && docker-compose run movieswipe-sync node scripts/poiskkino-sync.cjs
```

### Использование Docker scheduler

Можно создать отдельный контейнер с cron для автоматической синхронизации.

---

## Дополнительные команды

```bash
# Просмотр статуса сервисов
docker-compose ps

# Просмотр логов приложения
docker-compose logs -f movieswipe-pwa

# Просмотр логов синхронизации
docker-compose logs -f movieswipe-sync

# Выполнить команду в контейнере
docker-compose exec movieswipe-pwa sh

# Перестроить образы
docker-compose build
```

---

## Структура файлов

```
docker/movieswipe-pwa/
├── Dockerfile              # Основной образ (приложение)
├── Dockerfile.sync         # Образ для синхронизации
├── docker-compose.yml      # Docker Compose конфигурация
├── .env.example            # Пример переменных окружения
├── nginx.conf              # Nginx конфигурация
├── .dockerignore           # Файлы для исключения из образа
└── scripts/
    ├── build.sh            # Скрипт сборки
    ├── test.sh             # Скрипт тестирования
    └── push.sh             # Скрипт загрузки на Docker Hub
```

---

## Ссылки

- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [TMDB API](https://www.themoviedb.org/settings/api)
- [Poiskkino](https://www.poiskkino.fi/)
- [MovieSwipe PWA](https://github.com/sadam6752-tech/movieswipe-pwa)

---

**Версия**: 1.0.0  
**Дата**: 11 марта 2026
