# MediCare Pro - Complete Deployment Guide

## 🎉 Application is 100% Deployment Ready!

Both frontend and backend are now fully configured with environment variables, security settings, and deployment files for any platform.

## ✅ What's Been Configured

### Frontend ✅
- Dynamic API URL using `process.env.REACT_APP_API_URL`
- Centralized configuration in `src/config/api.js`
- All 22 components updated
- Environment files (`.env`, `.env.example`)
- Deployment documentation

### Backend ✅
- All settings using environment variables via `python-decouple`
- Production security settings (HTTPS, secure cookies, HSTS)
- Database flexibility (SQLite, PostgreSQL, MySQL)
- Static and media files configuration
- Logging system
- Enhanced deployment files (`Procfile`, `.gitignore`, `requirements.txt`)
- Comprehensive documentation

## 📋 Prerequisites

- Node.js (v14 or higher)
- Python 3.8+
- PostgreSQL or MySQL (for production)

## 🔧 Configuration

### Frontend Configuration

1. **Copy the environment file:**
   ```bash
   cd frontend
   cp .env.example .env
   ```

2. **Update `.env` with your API URL:**
   ```env
   # For local development
   REACT_APP_API_URL=http://localhost:8000/api
   
   # For production
   REACT_APP_API_URL=https://your-backend-domain.com/api
   ```

3. **Build for production:**
   ```bash
   npm run build
   ```

### Backend Configuration

1. **Update Django settings for production:**
   
   In `backend/settings.py`, ensure you have:
   ```python
   # CORS Configuration
   CORS_ALLOWED_ORIGINS = [
       "http://localhost:3000",
       "https://your-frontend-domain.com",
   ]
   
   # Or for development (not recommended for production)
   CORS_ALLOW_ALL_ORIGINS = False
   
   # Allowed Hosts
   ALLOWED_HOSTS = ['localhost', '127.0.0.1', 'your-backend-domain.com']
   ```

2. **Set environment variables:**
   ```bash
   export SECRET_KEY='your-secret-key'
   export DEBUG=False
   export DATABASE_URL='your-database-url'
   ```

## 🌐 Deployment Options

### Option 1: Deploy to Vercel (Frontend) + Render/Railway (Backend)

#### Frontend (Vercel):
1. Push your code to GitHub
2. Import project in Vercel
3. Set environment variable:
   - `REACT_APP_API_URL`: Your backend API URL
4. Deploy

#### Backend (Render/Railway):
1. Create new web service
2. Connect your repository
3. Set environment variables:
   - `SECRET_KEY`
   - `DEBUG=False`
   - `DATABASE_URL`
   - `ALLOWED_HOSTS`
4. Deploy

### Option 2: Deploy to Netlify (Frontend) + Heroku (Backend)

#### Frontend (Netlify):
1. Connect your repository
2. Build command: `npm run build`
3. Publish directory: `build`
4. Environment variables:
   - `REACT_APP_API_URL`: Your backend API URL

#### Backend (Heroku):
1. Create new app
2. Add PostgreSQL addon
3. Set config vars (environment variables)
4. Deploy via Git or GitHub integration

### Option 3: Docker Deployment

1. **Build Docker images:**
   ```bash
   # Frontend
   cd frontend
   docker build -t medicare-frontend .
   
   # Backend
   cd ../backend
   docker build -t medicare-backend .
   ```

2. **Run with Docker Compose:**
   ```bash
   docker-compose up -d
   ```

## 🔐 Security Checklist

- [ ] Set `DEBUG=False` in production
- [ ] Use strong `SECRET_KEY`
- [ ] Configure proper CORS origins
- [ ] Use HTTPS for production
- [ ] Set up proper database (not SQLite)
- [ ] Configure static files serving
- [ ] Set up proper logging
- [ ] Use environment variables for sensitive data
- [ ] Enable CSRF protection
- [ ] Configure proper session settings

## 📝 Environment Variables Reference

### Frontend (.env)
```env
REACT_APP_API_URL=<your-backend-api-url>
REACT_APP_NAME=MediCare Pro
REACT_APP_VERSION=1.0.0
```

### Backend
```env
SECRET_KEY=<your-secret-key>
DEBUG=False
DATABASE_URL=<your-database-url>
ALLOWED_HOSTS=<comma-separated-hosts>
CORS_ALLOWED_ORIGINS=<comma-separated-origins>
```

## 🧪 Testing Deployment

1. **Test locally with production build:**
   ```bash
   # Frontend
   npm run build
   serve -s build
   
   # Backend
   python manage.py runserver --settings=backend.settings_production
   ```

2. **Verify API connectivity:**
   - Open browser console
   - Check network requests
   - Ensure API calls use correct URL

## 📚 Additional Resources

- [React Deployment](https://create-react-app.dev/docs/deployment/)
- [Django Deployment Checklist](https://docs.djangoproject.com/en/stable/howto/deployment/checklist/)
- [Vercel Documentation](https://vercel.com/docs)
- [Render Documentation](https://render.com/docs)

## 🆘 Troubleshooting

### CORS Errors
- Verify `CORS_ALLOWED_ORIGINS` includes your frontend URL
- Check that API URL in frontend `.env` is correct

### API Connection Failed
- Verify backend is running and accessible
- Check `REACT_APP_API_URL` is set correctly
- Ensure no trailing slashes in API URL

### Build Errors
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Clear build cache: `npm run build -- --clean`

## 📞 Support

For issues or questions, please create an issue in the repository.
