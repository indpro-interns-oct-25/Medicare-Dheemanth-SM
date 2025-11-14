# 🚀 Quick Start Guide - MediCare Pro

## ✅ Application is Now Deployment Ready!

All API URLs are now configured using environment variables from `.env` files.

---

## 📦 Local Development Setup

### 1. Frontend Setup
```bash
cd frontend

# Copy environment file
cp .env.example .env

# Install dependencies
npm install

# Start development server
npm start
```

The frontend will run on `http://localhost:3000`

### 2. Backend Setup
```bash
cd backend

# Activate virtual environment (if using one)
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Run migrations
python manage.py migrate

# Start development server
python manage.py runserver
```

The backend will run on `http://localhost:8000`

---

## 🌐 Production Deployment

### Frontend (.env configuration)
```env
# Update this line in frontend/.env
REACT_APP_API_URL=https://your-backend-domain.com/api
```

### Backend (Django settings)
```python
# Update in backend/settings.py
ALLOWED_HOSTS = ['your-backend-domain.com']
CORS_ALLOWED_ORIGINS = ['https://your-frontend-domain.com']
```

---

## 🔑 Key Files

| File | Purpose |
|------|---------|
| `frontend/.env` | Frontend environment variables (API URL) |
| `frontend/src/config/api.js` | Centralized API configuration |
| `backend/settings.py` | Django configuration |
| `DEPLOYMENT.md` | Detailed deployment guide |

---

## 🎯 What Changed?

### Before (Hardcoded):
```javascript
const API_URL = 'http://localhost:8000/api';  // ❌ Hardcoded
```

### After (Dynamic):
```javascript
import API_URL from '../config/api';  // ✅ From environment
```

---

## ✨ Benefits

✅ **Easy deployment** - Just update `.env` file  
✅ **Environment-specific** - Different URLs for dev/staging/prod  
✅ **Secure** - No hardcoded URLs in code  
✅ **Flexible** - Change API URL without code changes  

---

## 📝 Quick Commands

```bash
# Frontend
cd frontend
npm start          # Development
npm run build      # Production build
npm test           # Run tests

# Backend
cd backend
python manage.py runserver        # Development
python manage.py test             # Run tests
python manage.py migrate          # Run migrations
```

---

## 🆘 Need Help?

- **Detailed Guide**: See `DEPLOYMENT.md`
- **Environment Setup**: See `frontend/README_ENV.md`
- **Issues**: Check troubleshooting section in `DEPLOYMENT.md`

---

## 🎉 You're Ready to Deploy!

Your application is now configured to work in any environment. Just update the `.env` file with your production API URL and deploy!
