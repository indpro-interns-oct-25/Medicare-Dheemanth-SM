# 🚀 Quick Deploy - Backend

## ⚡ Fast Deployment Steps

### 1. Setup Environment
```bash
cp .env.example .env
# Edit .env with your production values
```

### 2. Key Environment Variables
```env
SECRET_KEY=your-secret-key
DEBUG=False
ALLOWED_HOSTS=your-domain.com
DB_ENGINE=django.db.backends.postgresql
CORS_ALLOWED_ORIGINS=https://your-frontend.com
```

### 3. Deploy to Heroku (Fastest)
```bash
heroku create your-app-name
heroku addons:create heroku-postgresql:mini
heroku config:set SECRET_KEY="your-key"
heroku config:set DEBUG=False
heroku config:set ALLOWED_HOSTS="your-app.herokuapp.com"
heroku config:set CORS_ALLOWED_ORIGINS="https://your-frontend.com"
git push heroku main
heroku run python manage.py migrate
```

### 4. Deploy to Railway
```bash
railway login
railway init
railway add postgresql
# Set env vars in dashboard
railway up
```

### 5. Deploy to Render
1. Connect GitHub repo
2. Add PostgreSQL database
3. Set environment variables in dashboard
4. Deploy

---

## 🔑 Must-Do Before Production

✅ Set `DEBUG=False`  
✅ Use strong `SECRET_KEY`  
✅ Configure `ALLOWED_HOSTS`  
✅ Set up PostgreSQL database  
✅ Configure `CORS_ALLOWED_ORIGINS`  
✅ Run `python manage.py check --deploy`  

---

## 📝 Quick Commands

```bash
# Check deployment readiness
python manage.py check --deploy

# Collect static files
python manage.py collectstatic --noinput

# Run migrations
python manage.py migrate --noinput

# Create superuser
python manage.py createsuperuser
```

---

## 🆘 Common Issues

**CORS Error?**  
→ Check `CORS_ALLOWED_ORIGINS` in `.env`

**Database Error?**  
→ Verify database credentials and run migrations

**Static Files Not Loading?**  
→ Run `collectstatic` and check `STATIC_ROOT`

---

**Full Guide:** See `README_DEPLOYMENT.md`
