# Быстрый деплой - 5 минут ⚡

Самый простой способ запустить MovieSwipe PWA на реальном сервере.

## 🚀 Vercel (Рекомендуется)

### Шаг 1: Подготовка (2 минуты)

```bash
# Создайте GitHub репозиторий
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/movieswipe-pwa.git
git push -u origin main
```

### Шаг 2: Деплой (3 минуты)

1. Откройте https://vercel.com/
2. Нажмите **"Import Project"**
3. Выберите ваш GitHub репозиторий
4. Настройки:
   - **Root Directory:** `movieswipe-pwa`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
5. Нажмите **"Deploy"**

**Готово!** 🎉

Ваш сайт: `https://your-project.vercel.app`

---

## ✅ Что вы получаете

- ✅ **HTTPS** - автоматически
- ✅ **CDN** - быстрая загрузка по всему миру
- ✅ **PWA** - работает из коробки
- ✅ **Автодеплой** - при каждом push в GitHub
- ✅ **Бесплатно** - 100GB трафика/месяц

---

## 🔄 Обновление сайта

```bash
# Внесите изменения
git add .
git commit -m "Update"
git push

# Vercel автоматически обновит сайт!
```

---

## 📱 Проверка PWA

После деплоя:

1. Откройте сайт на телефоне
2. Нажмите "Поделиться" → "На экран Домой"
3. Приложение установлено! 🎬

---

## 🆘 Проблемы?

### Сайт не открывается
- Подождите 1-2 минуты после деплоя
- Проверьте логи в Vercel Dashboard

### Фильмы не загружаются
```bash
# Убедитесь что файл в репозитории
git add movieswipe-pwa/public/data/movies-poiskkino.json
git commit -m "Add movies"
git push
```

### Service Worker не работает
- Vercel автоматически настраивает HTTPS
- Просто подождите несколько минут

---

## 💡 Альтернативы

### Netlify (тоже бесплатно)
1. https://www.netlify.com/
2. "Add new site" → "Import from Git"
3. Выберите репозиторий
4. Deploy!

### GitHub Pages
```bash
npm install --save-dev gh-pages
npm run deploy
```

---

## 📖 Подробнее

См. полное руководство: [DEPLOYMENT.md](./DEPLOYMENT.md)

---

**Время деплоя: 5 минут**
**Стоимость: Бесплатно**
**Сложность: Легко** ⭐

Готово! Ваше приложение онлайн! 🚀
