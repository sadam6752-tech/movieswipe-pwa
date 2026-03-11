# Руководство по деплою MovieSwipe PWA

Полное руководство по запуску проекта на реальном сервере.

## 📋 Что нужно для деплоя

### Минимальные требования:
- ✅ Собранный проект (`npm run build`)
- ✅ Веб-сервер (Nginx, Apache, или хостинг)
- ✅ HTTPS (обязательно для PWA!)
- ✅ Файл с фильмами (`movies-poiskkino.json`)

### Опционально:
- Node.js (если хотите запускать синхронизацию на сервере)
- Доменное имя
- SSL сертификат (Let's Encrypt бесплатно)

---

## 🚀 Варианты деплоя

### Вариант 1: Vercel (Рекомендуется - БЕСПЛАТНО)

**Самый простой способ!** Автоматический деплой из GitHub.

#### Шаг 1: Подготовка

```bash
# 1. Создайте GitHub репозиторий
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/movieswipe-pwa.git
git push -u origin main

# 2. Убедитесь что файл с фильмами в репозитории
git add movieswipe-pwa/public/data/movies-poiskkino.json
git commit -m "Add movies database"
git push
```

#### Шаг 2: Деплой на Vercel

1. Зайдите на https://vercel.com/
2. Нажмите "Import Project"
3. Выберите ваш GitHub репозиторий
4. Настройки:
   - **Framework Preset:** Vite
   - **Root Directory:** `movieswipe-pwa`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
5. Нажмите "Deploy"

**Готово!** Ваш сайт будет доступен по адресу `https://your-project.vercel.app`

**Плюсы:**
- ✅ Бесплатно
- ✅ Автоматический HTTPS
- ✅ CDN по всему миру
- ✅ Автоматический деплой при push в GitHub
- ✅ Поддержка PWA из коробки

**Минусы:**
- ❌ Лимит 100GB трафика/месяц (достаточно для старта)

---

### Вариант 2: Netlify (Тоже бесплатно)

Аналог Vercel, тоже очень простой.

#### Деплой:

1. Зайдите на https://www.netlify.com/
2. Нажмите "Add new site" → "Import an existing project"
3. Выберите GitHub репозиторий
4. Настройки:
   - **Base directory:** `movieswipe-pwa`
   - **Build command:** `npm run build`
   - **Publish directory:** `movieswipe-pwa/dist`
5. Нажмите "Deploy"

**Плюсы:**
- ✅ Бесплатно
- ✅ Автоматический HTTPS
- ✅ CDN
- ✅ Простая настройка

---

### Вариант 3: GitHub Pages (Бесплатно)

Хостинг прямо на GitHub.

#### Настройка:

1. Установите `gh-pages`:
```bash
cd movieswipe-pwa
npm install --save-dev gh-pages
```

2. Добавьте в `package.json`:
```json
{
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d dist"
  },
  "homepage": "https://YOUR_USERNAME.github.io/movieswipe-pwa"
}
```

3. Обновите `vite.config.ts`:
```typescript
export default defineConfig({
  base: '/movieswipe-pwa/', // Название репозитория
  // ... остальное
});
```

4. Деплой:
```bash
npm run deploy
```

**Плюсы:**
- ✅ Бесплатно
- ✅ Простой деплой
- ✅ Интеграция с GitHub

**Минусы:**
- ❌ Нужно настроить HTTPS вручную
- ❌ Медленнее чем Vercel/Netlify

---

### Вариант 4: Свой VPS (DigitalOcean, Hetzner, etc.)

Для полного контроля.

#### Требования:
- VPS с Ubuntu/Debian
- Nginx
- Node.js (опционально)
- Certbot (для SSL)

#### Шаг 1: Подготовка сервера

```bash
# Подключитесь к серверу
ssh root@your-server-ip

# Обновите систему
apt update && apt upgrade -y

# Установите Nginx
apt install nginx -y

# Установите Certbot для SSL
apt install certbot python3-certbot-nginx -y
```

#### Шаг 2: Соберите проект локально

```bash
# На вашем компьютере
cd movieswipe-pwa
npm run build

# Результат в папке dist/
```

#### Шаг 3: Загрузите на сервер

```bash
# Создайте директорию на сервере
ssh root@your-server-ip "mkdir -p /var/www/movieswipe"

# Загрузите файлы
scp -r dist/* root@your-server-ip:/var/www/movieswipe/
```

#### Шаг 4: Настройте Nginx

```bash
# На сервере создайте конфиг
nano /etc/nginx/sites-available/movieswipe
```

Вставьте:
```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/movieswipe;
    index index.html;

    # Gzip сжатие
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # Кэширование статики
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Service Worker не кэшируем
    location = /sw.js {
        add_header Cache-Control "no-cache";
        expires 0;
    }

    # SPA fallback
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

Активируйте:
```bash
ln -s /etc/nginx/sites-available/movieswipe /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
```

#### Шаг 5: Настройте SSL

```bash
certbot --nginx -d your-domain.com
```

**Готово!** Сайт доступен по `https://your-domain.com`

**Плюсы:**
- ✅ Полный контроль
- ✅ Можно запускать синхронизацию на сервере
- ✅ Нет лимитов

**Минусы:**
- ❌ Нужно настраивать вручную
- ❌ Платно (~$5-10/месяц)
- ❌ Нужно обслуживать

---

## 📦 Подготовка к деплою

### 1. Соберите проект

```bash
cd movieswipe-pwa
npm run build
```

Результат в папке `dist/`:
```
dist/
├── index.html
├── assets/
│   ├── index-*.js
│   └── index-*.css
├── sw.js (Service Worker)
├── manifest.webmanifest
└── data/
    └── movies-poiskkino.json
```

### 2. Проверьте размер

```bash
du -sh dist/
# Должно быть ~430 KB + размер movies-poiskkino.json
```

### 3. Проверьте локально

```bash
npm run preview
# Откройте http://localhost:4173
```

---

## 🔒 Важно для PWA

### HTTPS обязателен!

PWA работает **только через HTTPS** (кроме localhost).

**Проверьте:**
- ✅ SSL сертификат установлен
- ✅ Редирект с HTTP на HTTPS
- ✅ Service Worker загружается

### Проверка PWA

После деплоя откройте DevTools → Application:
- ✅ Service Worker: Activated
- ✅ Manifest: Найден
- ✅ Installable: Да

---

## 📊 Размер файлов

| Файл | Размер |
|------|--------|
| HTML | 0.58 KB |
| CSS | 50.54 KB (7.49 KB gzip) |
| JS | 388 KB (123 KB gzip) |
| Service Worker | 0.13 KB |
| **Итого (без фильмов)** | **~430 KB** |
| movies-poiskkino.json | ~13 MB (13,526 фильмов) |
| **Общий размер** | **~13.5 MB** |

---

## 🚀 Рекомендации

### Для начала:
**Используйте Vercel или Netlify** - бесплатно, просто, быстро.

### Для продакшена:
**Свой VPS** - если нужен полный контроль и автоматическая синхронизация.

### Для экспериментов:
**GitHub Pages** - если проект уже на GitHub.

---

## 🔄 Автоматическая синхронизация на сервере

Если используете VPS, можете настроить автоматическую синхронизацию:

### 1. Установите Node.js на сервере

```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs
```

### 2. Загрузите скрипт

```bash
scp movieswipe-pwa/scripts/poiskkino-sync.cjs root@your-server:/root/
```

### 3. Настройте cron

```bash
crontab -e
```

Добавьте:
```bash
0 3 * * * cd /root && node poiskkino-sync.cjs --api-key YOUR_KEY && cp movies-poiskkino.json /var/www/movieswipe/data/
```

---

## 📝 Чеклист деплоя

- [ ] Проект собран (`npm run build`)
- [ ] Файл с фильмами включен
- [ ] Выбран хостинг
- [ ] Настроен HTTPS
- [ ] Service Worker работает
- [ ] PWA устанавливается
- [ ] Все страницы открываются
- [ ] Поиск работает
- [ ] Фильтры работают
- [ ] Offline режим работает

---

## 🆘 Troubleshooting

### Service Worker не работает
```bash
# Проверьте что используется HTTPS
# Проверьте что sw.js доступен
curl https://your-domain.com/sw.js
```

### Фильмы не загружаются
```bash
# Проверьте что файл доступен
curl https://your-domain.com/data/movies-poiskkino.json
```

### 404 на страницах
```nginx
# Добавьте в Nginx конфиг
location / {
    try_files $uri $uri/ /index.html;
}
```

---

## 💰 Стоимость

| Хостинг | Цена | Трафик | SSL |
|---------|------|--------|-----|
| Vercel | Бесплатно | 100GB/мес | ✅ |
| Netlify | Бесплатно | 100GB/мес | ✅ |
| GitHub Pages | Бесплатно | 100GB/мес | ✅ |
| DigitalOcean | $6/мес | Безлимит | ✅ |
| Hetzner | €4/мес | 20TB/мес | ✅ |

---

## 🎯 Быстрый старт (Vercel)

```bash
# 1. Установите Vercel CLI
npm i -g vercel

# 2. Войдите
vercel login

# 3. Деплой
cd movieswipe-pwa
vercel

# Готово! Ваш сайт онлайн
```

---

Нужна помощь с конкретным хостингом? Скажите какой вариант вас интересует! 🚀
