# Backend Deployment Guide - MediCare Pro

## ✅ Backend is Now Deployment Ready!

All configurations are now using environment variables from `.env` file, making it ready for deployment to any platform.

---

## 📋 What Was Configured

### 1. **Environment Variables** (`.env.example`)
- Django settings (SECRET_KEY, DEBUG, ALLOWED_HOSTS)
- Database configuration (SQLite, PostgreSQL, MySQL)
- CORS settings for frontend URLs
- JWT token lifetime settings
- Production-specific settings

### 2. **Django Settings** (`settings.py`)
- Dynamic configuration using `python-decouple`
- Static files configuration
- Media files configuration
- Production security settings (HTTPS, secure cookies, HSTS)
- Logging configuration
- Database flexibility (SQLite for dev, PostgreSQL/MySQL for production)

### 3. **Deployment Files**
- `Procfile` - Heroku/Railway deployment configuration
- `runtime.txt` - Python version specification
- `requirements.txt` - Enhanced with production packages
- `.gitignore` - Comprehensive ignore patterns

---

## 🚀 Quick Start

### Local Development

1. **Copy environment file:**
   ```bash
   cd backend
   cp .env.example .env
   ```

2. **Create virtual environment:**
   ```bash
   python -m venv venv
   
   # On Windows
   venv\Scripts\activate
   
   # On macOS/Linux
   source venv/bin/activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Run migrations:**
   ```bash
   python manage.py migrate
   ```

5. **Create superuser (optional):**
   ```bash
   python manage.py createsuperuser
   ```

6. **Run development server:**
   ```bash
   python manage.py runserver
   ```

---

## 🌐 Production Deployment

### Option 1: Deploy to Heroku

1. **Install Heroku CLI and login:**
   ```bash
   heroku login
   ```

2. **Create new Heroku app:**
   ```bash
   heroku create your-app-name
   ```

3. **Add PostgreSQL addon:**
   ```bash
   heroku addons:create heroku-postgresql:mini
   ```

4. **Set environment variables:**
   ```bash
   heroku config:set SECRET_KEY="your-secret-key-here"
   heroku config:set DEBUG=False
   heroku config:set ALLOWED_HOSTS="your-app-name.herokuapp.com"
   heroku config:set CORS_ALLOWED_ORIGINS="https://your-frontend-domain.com"
   ```

5. **Deploy:**
   ```bash
   git push heroku main
   ```

6. **Run migrations:**
   ```bash
   heroku run python manage.py migrate
   ```

### Option 2: Deploy to Railway

1. **Install Railway CLI:**
   ```bash
   npm install -g @railway/cli
   ```

2. **Login and initialize:**
   ```bash
   railway login
   railway init
   ```

3. **Add PostgreSQL:**
   ```bash
   railway add postgresql
   ```

4. **Set environment variables in Railway dashboard:**
   - `SECRET_KEY`
   - `DEBUG=False`
   - `ALLOWED_HOSTS`
   - `CORS_ALLOWED_ORIGINS`

5. **Deploy:**
   ```bash
   railway up
   ```

### Option 3: Deploy to Render

1. **Create new Web Service on Render dashboard**

2. **Connect your repository**

3. **Configure:**
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `gunicorn backend.wsgi:application`

4. **Add environment variables:**
   - `SECRET_KEY`
   - `DEBUG=False`
   - `ALLOWED_HOSTS`
   - `CORS_ALLOWED_ORIGINS`
   - `DATABASE_URL` (auto-provided if using Render PostgreSQL)

5. **Add PostgreSQL database** (optional)

6. **Deploy**

### Option 4: Deploy to DigitalOcean/AWS/GCP

1. **Set up server with Ubuntu**

2. **Install dependencies:**
   ```bash
   sudo apt update
   sudo apt install python3-pip python3-venv nginx postgresql
   ```

3. **Clone repository and set up:**
   ```bash
   git clone your-repo-url
   cd backend
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   pip install gunicorn
   ```

4. **Configure environment variables:**
   ```bash
   nano .env
   # Add all production variables
   ```

5. **Set up PostgreSQL database**

6. **Run migrations:**
   ```bash
   python manage.py migrate
   python manage.py collectstatic
   ```

7. **Configure Gunicorn and Nginx**

8. **Set up systemd service for auto-restart**

---

## 🔧 Environment Variables Reference

### Required Variables

```env
# Django Core
SECRET_KEY=your-secret-key-here
DEBUG=False
ALLOWED_HOSTS=your-domain.com,www.your-domain.com

# Database (PostgreSQL for production)
DB_ENGINE=django.db.backends.postgresql
DB_NAME=your_db_name
DB_USER=your_db_user
DB_PASSWORD=your_secure_password
DB_HOST=your_db_host
DB_PORT=5432

# CORS (Frontend URLs)
CORS_ALLOWED_ORIGINS=https://your-frontend.com,https://www.your-frontend.com

# JWT Settings
JWT_ACCESS_TOKEN_LIFETIME_HOURS=5
JWT_REFRESH_TOKEN_LIFETIME_DAYS=1
```

### Optional Variables

```env
# Logging
LOG_LEVEL=INFO

# Security (for HTTPS)
SECURE_SSL_REDIRECT=True
```

---

## 📦 Production Requirements

Update `requirements.txt` for production:

```bash
# Uncomment these lines in requirements.txt:
gunicorn==21.2.0
whitenoise==6.6.0
```

Then install:
```bash
pip install -r requirements.txt
```

---

## 🔐 Security Checklist

Before deploying to production:

- [ ] Set `DEBUG=False`
- [ ] Use a strong, unique `SECRET_KEY`
- [ ] Configure proper `ALLOWED_HOSTS`
- [ ] Set up HTTPS/SSL certificate
- [ ] Use PostgreSQL or MySQL (not SQLite)
- [ ] Configure proper CORS origins
- [ ] Set secure cookie settings
- [ ] Enable HSTS headers
- [ ] Set up proper logging
- [ ] Configure static files serving
- [ ] Set up database backups
- [ ] Use environment variables for all sensitive data
- [ ] Review and update JWT token lifetimes
- [ ] Set up monitoring and error tracking

---

## 🧪 Testing Before Deployment

1. **Test with production settings locally:**
   ```bash
   # Create a .env.production file
   DEBUG=False
   # ... other production settings
   
   # Test
   python manage.py check --deploy
   ```

2. **Run tests:**
   ```bash
   python manage.py test
   ```

3. **Check for security issues:**
   ```bash
   python manage.py check --deploy
   ```

---

## 📊 Database Migration

### From SQLite to PostgreSQL

1. **Dump existing data:**
   ```bash
   python manage.py dumpdata > data.json
   ```

2. **Update `.env` with PostgreSQL settings**

3. **Run migrations:**
   ```bash
   python manage.py migrate
   ```

4. **Load data:**
   ```bash
   python manage.py loaddata data.json
   ```

---

## 🔍 Troubleshooting

### Issue: Static files not loading
**Solution:**
```bash
python manage.py collectstatic
```
Add `whitenoise` to `MIDDLEWARE` in settings.py

### Issue: Database connection failed
**Solution:**
- Verify database credentials in `.env`
- Check database host is accessible
- Ensure database exists

### Issue: CORS errors
**Solution:**
- Verify `CORS_ALLOWED_ORIGINS` includes your frontend URL
- Check for trailing slashes
- Ensure protocol (http/https) matches

### Issue: 500 Internal Server Error
**Solution:**
- Check logs: `heroku logs --tail` or server logs
- Verify all environment variables are set
- Check `DEBUG=False` and `ALLOWED_HOSTS` are configured

---

## 📝 Useful Commands

```bash
# Check deployment readiness
python manage.py check --deploy

# Create migrations
python manage.py makemigrations

# Apply migrations
python manage.py migrate

# Collect static files
python manage.py collectstatic

# Create superuser
python manage.py createsuperuser

# Run tests
python manage.py test

# Start development server
python manage.py runserver

# Start with gunicorn (production)
gunicorn backend.wsgi:application --bind 0.0.0.0:8000
```

---

## 🆘 Support

For deployment issues:
1. Check the logs first
2. Verify all environment variables are set correctly
3. Ensure database is properly configured
4. Check CORS settings match your frontend URL

---

## 📚 Additional Resources

- [Django Deployment Checklist](https://docs.djangoproject.com/en/stable/howto/deployment/checklist/)
- [Heroku Django Guide](https://devcenter.heroku.com/articles/django-app-configuration)
- [Railway Documentation](https://docs.railway.app/)
- [Render Django Guide](https://render.com/docs/deploy-django)
- [Gunicorn Documentation](https://docs.gunicorn.org/)

---

## 🎉 You're Ready to Deploy!

Your backend is now fully configured for deployment. Just:
1. Update `.env` with production values
2. Choose your deployment platform
3. Follow the platform-specific steps above
4. Deploy and enjoy! 🚀
