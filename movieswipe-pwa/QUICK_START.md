# Быстрый старт - Генерация базы фильмов

## Шаг 1: Получить TMDB API ключ

1. Зарегистрируйтесь на [themoviedb.org](https://www.themoviedb.org/signup)
2. Перейдите в [Settings → API](https://www.themoviedb.org/settings/api)
3. Запросите API ключ (выберите "Developer")
4. Скопируйте "API Key (v3 auth)"

## Шаг 2: Генерация файлов

### Вариант 1: Только базовый файл (быстро)

Генерирует `movies.json` с 100 популярными фильмами (~30 секунд):

```bash
TMDB_API_KEY=your_api_key_here npm run generate:base
```

### Вариант 2: Все жанры (полная база)

Генерирует все жанры по 500 фильмов (~40-50 минут):

```bash
TMDB_API_KEY=your_api_key_here npm run generate:all
```

### Вариант 3: Конкретные жанры

Генерирует только нужные жанры:

```bash
# Комедии
TMDB_API_KEY=your_key node scripts/generate-genre-files.js --genre=comedy

# Боевики
TMDB_API_KEY=your_key node scripts/generate-genre-files.js --genre=action

# Драмы
TMDB_API_KEY=your_key node scripts/generate-genre-files.js --genre=drama
```

## Шаг 3: Запуск приложения

```bash
# Разработка
npm run dev

# Продакшн сборка
npm run build
npm run preview
```

## Доступные жанры

- `comedy` - Комедии
- `action` - Боевики  
- `drama` - Драмы
- `sci-fi` - Фантастика
- `horror` - Ужасы
- `romance` - Романтика
- `thriller` - Триллеры
- `animation` - Анимация
- `adventure` - Приключения
- `family` - Семейные
- `fantasy` - Фэнтези
- `detective` - Детективы

## Результат

После генерации в `public/data/` появятся файлы:

```
public/data/
├── movies.json              # Базовая коллекция
├── movies-comedy.json       # Комедии
├── movies-action.json       # Боевики
└── ...
```

## Как работает приложение

1. При первом запуске загружается `movies.json` (базовая коллекция)
2. Когда пользователь выбирает жанр в фильтрах → автоматически загружается соответствующий файл
3. Данные кэшируются в IndexedDB
4. Постеры загружаются динамически при просмотре
5. Всё работает offline после загрузки

## Размеры

| Файл | Фильмов | Размер | Время загрузки |
|------|---------|--------|----------------|
| movies.json | 100 | ~108 KB | <1 сек |
| movies-comedy.json | 500 | ~540 KB | 1-2 сек |
| Все жанры | 8000+ | ~8.5 MB | По требованию |

## Советы

### Для разработки
Используйте только базовый файл:
```bash
TMDB_API_KEY=your_key npm run generate:base
```

### Для продакшена
Генерируйте популярные жанры:
```bash
TMDB_API_KEY=your_key node scripts/generate-genre-files.js --genre=comedy
TMDB_API_KEY=your_key node scripts/generate-genre-files.js --genre=action
TMDB_API_KEY=your_key node scripts/generate-genre-files.js --genre=drama
```

### Автоматизация
Добавьте в CI/CD для автоматического обновления:
```yaml
- name: Generate movie data
  env:
    TMDB_API_KEY: ${{ secrets.TMDB_API_KEY }}
  run: npm run generate:all
```

## Troubleshooting

### "TMDB_API_KEY не установлен"
Убедитесь, что передали API ключ:
```bash
TMDB_API_KEY=your_key npm run generate:base
```

### "Нет результатов"
- Проверьте правильность API ключа
- Проверьте интернет соединение
- Убедитесь, что не превышены лимиты API

### Медленная генерация
Это нормально - TMDB API имеет rate limits. Скрипт автоматически соблюдает лимиты (250ms между запросами).

## Дополнительная информация

- [GENRE_LOADING.md](./GENRE_LOADING.md) - Подробная документация по системе загрузки
- [scripts/README.md](./scripts/README.md) - Документация по скрипту генерации
- [TMDB_GUIDE.md](./TMDB_GUIDE.md) - Руководство по TMDB API

## Поддержка

Если возникли проблемы:
1. Проверьте API ключ
2. Проверьте интернет соединение
3. Посмотрите логи в консоли
4. Создайте issue в репозитории
