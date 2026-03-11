# 🏠 Развёртывание на локальном сервере

## 📦 Содержимое архива

Архив `movieswipe-pwa-deploy.tar.gz` содержит:
- ✅ Весь исходный код приложения
- ✅ База данных: 13,526 фильмов из ПоискКино (`public/data/movies-poiskkino.json`)
- ✅ Скрипт синхронизации (`scripts/poiskkino-sync.cjs`)
- ✅ Вся документация
- ❌ Исключено: `node_modules`, `dist`, `.git`

## 🚀 Быстрый старт

### 1. Распаковка архива

```bash
# Создайте директорию для проекта
mkdir movieswipe-app
cd movieswipe-app

# Распакуйте архив
tar -xzf movieswipe-pwa-deploy.tar.gz
```

### 2. Установка зависимостей

```bash
# Установите Node.js зависимости
npm install
```

**Требования:**
- Node.js >= 18.0.0
- npm >= 9.0.0

### 3. Запуск в режиме разработки

```bash
# Запустите dev-сервер
npm run dev
```

Приложение будет доступно по адресу: **http://localhost:5173**

### 4. Сборка для продакшена

```bash
# Соберите проект
npm run build

# Результат будет в папке dist/
```

## 🌐 Развёртывание на локальном сервере

### Вариант 1: Простой HTTP сервер (для тестирования)

```bash
# После сборки запустите preview
npm run preview

# Или используйте любой статический сервер
npx serve dist -p 3000
```

### Вариант 2: Nginx (рекомендуется для продакшена)

#### Установка Nginx (macOS)

```bash
brew install nginx
```

#### Конфигурация Nginx

Создайте файл `/usr/local/etc/nginx/servers/movieswipe.conf`:

```nginx
server {
    listen 8080;
    server_name localhost;
    
    root /path/to/movieswipe-app/dist;
    index index.html;
    
    # Поддержка React Router (SPA)
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Кэширование статических файлов
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Кэширование JSON данных
    location ~* \.json$ {
        expires 1d;
        add_header Cache-Control "public";
    }
    
    # Gzip сжатие
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
}
```

#### Запуск Nginx

```bash
# Проверьте конфигурацию
nginx -t

# Запустите Nginx
nginx

# Или перезапустите
nginx -s reload

# Остановка
nginx -s stop
```

Приложение будет доступно по адресу: **http://localhost:8080**

### Вариант 3: Apache (альтернатива)

#### Установка Apache (macOS)

```bash
brew install httpd
```

#### Конфигурация Apache

Отредактируйте `/usr/local/etc/httpd/httpd.conf`:

```apache
<VirtualHost *:8080>
    DocumentRoot "/path/to/movieswipe-app/dist"
    
    <Directory "/path/to/movieswipe-app/dist">
        Options Indexes FollowSymLinks
        AllowOverride All
        Require all granted
        
        # Поддержка React Router
        RewriteEngine On
        RewriteBase /
        RewriteRule ^index\.html$ - [L]
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteRule . /index.html [L]
    </Directory>
</VirtualHost>
```

#### Запуск Apache

```bash
# Запустите Apache
brew services start httpd

# Или вручную
apachectl start

# Остановка
apachectl stop
```

## 🔄 Обновление базы фильмов

### Синхронизация с ПоискКино API

```bash
# Перейдите в папку скриптов
cd scripts

# Запустите синхронизацию (требуется API ключ)
node poiskkino-sync.cjs --api-key YOUR_API_KEY

# Проверьте статус
node poiskkino-sync.cjs --status

# Ограничьте количество запросов
node poiskkino-sync.cjs --api-key YOUR_KEY --max-requests 50
```

**Получение API ключа:**
1. Перейдите на [poiskkino.dev](https://poiskkino.dev/)
2. Нажмите "Получить API"
3. Следуйте инструкциям в Telegram боте @poiskkinodev_bot

**Лимиты:**
- 200 запросов в сутки (бесплатно)
- До 250 фильмов за запрос
- ~50,000 фильмов в день

### Автоматическая синхронизация (cron)

```bash
# Откройте crontab
crontab -e

# Добавьте задачу (каждый день в 3:00)
0 3 * * * cd /path/to/movieswipe-app/scripts && node poiskkino-sync.cjs --api-key YOUR_KEY >> sync.log 2>&1
```

После синхронизации пересоберите проект:

```bash
npm run build
```

## 📊 Структура проекта

```
movieswipe-app/
├── dist/                    # Собранное приложение (после npm run build)
├── public/
│   └── data/
│       ├── movies.json              # Начальная база (50 фильмов)
│       └── movies-poiskkino.json    # База ПоискКино (13,526 фильмов)
├── scripts/
│   ├── poiskkino-sync.cjs           # Скрипт синхронизации
│   └── .sync-progress.json          # Прогресс синхронизации
├── src/                     # Исходный код
├── package.json
└── README.md
```

## 🔧 Настройки приложения

### Переменные окружения (опционально)

Создайте файл `.env` в корне проекта:

```env
# TMDB API (опционально, для альтернативного источника)
VITE_TMDB_API_KEY=your_tmdb_key

# Порт dev-сервера
VITE_PORT=5173
```

### Настройки в приложении

После запуска откройте **Настройки** в приложении:
- Выберите источник данных (Локальный JSON / TMDB / ПоискКино)
- Настройте тему (Темная / Светлая)
- Управляйте базой данных

## 🐛 Решение проблем

### Ошибка: "Cannot find module"

```bash
# Переустановите зависимости
rm -rf node_modules package-lock.json
npm install
```

### Ошибка: "Port already in use"

```bash
# Измените порт в package.json или используйте другой
npm run dev -- --port 5174
```

### Приложение не открывается в браузере

```bash
# Проверьте, что сервер запущен
lsof -i :5173

# Откройте вручную
open http://localhost:5173
```

### Nginx не запускается

```bash
# Проверьте конфигурацию
nginx -t

# Проверьте логи
tail -f /usr/local/var/log/nginx/error.log
```

## 📱 Доступ с других устройств в локальной сети

### 1. Узнайте IP адрес сервера

```bash
# macOS
ipconfig getifaddr en0

# Или
ifconfig | grep "inet "
```

### 2. Настройте Vite для доступа из сети

В `package.json` измените скрипт `dev`:

```json
"dev": "vite --host 0.0.0.0"
```

### 3. Откройте на другом устройстве

```
http://192.168.x.x:5173
```

**Для Nginx/Apache:** используйте IP сервера и настроенный порт.

## 🔒 Безопасность

### Для локального использования:
- ✅ Доступ только из локальной сети
- ✅ Не требуется HTTPS
- ✅ Не требуется домен

### Для публичного доступа:
- ⚠️ Настройте HTTPS (Let's Encrypt)
- ⚠️ Настройте firewall
- ⚠️ Используйте reverse proxy (Nginx)
- ⚠️ Регулярно обновляйте зависимости

## 📚 Дополнительная документация

- **[README.md](README.md)** - Полное описание проекта
- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Деплой на облачные платформы
- **[POISKKINO_GUIDE.md](POISKKINO_GUIDE.md)** - Работа с ПоискКино API
- **[TMDB_GUIDE.md](TMDB_GUIDE.md)** - Работа с TMDB API
- **[CHANGELOG.md](CHANGELOG.md)** - История изменений

## 💡 Полезные команды

```bash
# Разработка
npm run dev              # Запуск dev-сервера
npm run build            # Сборка для продакшена
npm run preview          # Предпросмотр сборки
npm run lint             # Проверка кода

# Синхронизация
node scripts/poiskkino-sync.cjs --api-key KEY    # Загрузка фильмов
node scripts/poiskkino-sync.cjs --status         # Проверка статуса
node scripts/poiskkino-sync.cjs --reset          # Сброс прогресса

# Сервер
nginx -t                 # Проверка конфигурации Nginx
nginx -s reload          # Перезагрузка Nginx
apachectl configtest     # Проверка конфигурации Apache
```

## 🎉 Готово!

Ваше приложение MovieSwipe PWA готово к использованию на локальном сервере.

**Быстрый старт:**
```bash
tar -xzf movieswipe-pwa-deploy.tar.gz
npm install
npm run dev
```

Откройте **http://localhost:5173** и наслаждайтесь!
