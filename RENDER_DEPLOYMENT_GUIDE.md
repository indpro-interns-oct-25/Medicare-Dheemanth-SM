# Complete Render Deployment Guide - MediCare Pro

## ✅ Code Changes Already Applied

The following changes have been made to prepare your code for Render deployment:

1. ✅ **Backend Dependencies** - Uncommented `gunicorn` and `whitenoise` in `requirements.txt`
2. ✅ **WhiteNoise Middleware** - Added to `settings.py` for static file serving
3. ✅ **Build Script** - Created `backend/build.sh` for automated deployment
4. ✅ **Environment Variables** - Already configured with `python-decouple`

---

## 📋 Deployment Order

Deploy in this exact order:
1. **PostgreSQL Database** (first)
2. **Backend (Django)** (second - needs database)
3. **Frontend (React)** (last - needs backend URL)

---

## 🗄️ STEP 1: Deploy PostgreSQL Database

### 1.1 Create PostgreSQL Instance

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **"New +"** → Select **"PostgreSQL"**
3. Configure:
   - **Name**: `medicare-database` (or your choice)
   - **Database**: `medicare_db`
   - **User**: `medicare_user` (auto-generated)
   - **Region**: Choose closest to you
   - **PostgreSQL Version**: **15** (you have PostgreSQL 15.14 locally)
   - **Plan**: Free or Starter
4. Click **"Create Database"**

### 1.2 Save Database Credentials

After creation, Render provides:
- **Internal Database URL**: Use this for backend connection
- **External Database URL**: For external tools
- Individual credentials:
  - `PGHOST`
  - `PGPORT` (usually 5432)
  - `PGDATABASE`
  - `PGUSER`
  - `PGPASSWORD`

⚠️ **IMPORTANT**: Copy these credentials - you'll need them for backend setup!

---

## 🔧 STEP 2: Deploy Backend (Django)

### 2.1 Create Web Service

1. Click **"New +"** → Select **"Web Service"**
2. Connect your repository (GitHub/GitLab)
3. Configure:
   - **Name**: `medicare-backend`
   - **Region**: Same as database
   - **Branch**: `main` (or your default branch)
   - **Root Directory**: `backend`
   - **Runtime**: `Python 3`
   - **Build Command**: `./build.sh`
   - **Start Command**: `gunicorn backend.wsgi:application`
   - **Plan**: Free or Starter

### 2.2 Environment Variables

Click **"Advanced"** → **"Add Environment Variable"** and add these:

#### Django Core Settings
```
SECRET_KEY=your-super-secret-key-min-50-chars-use-django-secret-generator
DEBUG=False
ALLOWED_HOSTS=medicare-backend.onrender.com
```

**Generate SECRET_KEY**:
```python
# Run locally to generate a secure key:
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

#### Database Settings (from Step 1.2)
```
DB_ENGINE=django.db.backends.postgresql
DB_NAME=medicare_db
DB_USER=medicare_user
DB_PASSWORD=<your-password-from-render>
DB_HOST=<your-host-from-render>
DB_PORT=5432
```

#### CORS Settings (temporarily allow all for testing)
```
CORS_ALLOWED_ORIGINS=http://localhost:3000
```
*(You'll update this after frontend deployment)*

#### JWT Settings
```
JWT_ACCESS_TOKEN_LIFETIME_HOURS=5
JWT_REFRESH_TOKEN_LIFETIME_DAYS=1
```

#### Production Security
```
SECURE_SSL_REDIRECT=True
LOG_LEVEL=INFO
```

### 2.3 Make build.sh Executable (Important!)

Before deploying, ensure `build.sh` has execute permissions:

**Option A - Git (Recommended):**
```bash
cd backend
git update-index --chmod=+x build.sh
git commit -m "Make build.sh executable"
git push
```

**Option B - If Git doesn't work:**
Update Build Command in Render to:
```bash
chmod +x build.sh && ./build.sh
```

### 2.4 Deploy

1. Click **"Create Web Service"**
2. Watch the logs - deployment takes 5-10 minutes
3. Look for: `Successfully installed` and `Booting worker`

### 2.5 Verify Backend

1. Wait for deployment to complete (green "Live" badge)
2. Copy your backend URL: `https://medicare-backend.onrender.com`
3. Test endpoints:
   - Visit: `https://medicare-backend.onrender.com/admin/` (should see Django admin)
   - Test API: `https://medicare-backend.onrender.com/api/` (check if accessible)

### 2.6 Create Superuser (Optional)

1. Go to your backend service
2. Click **"Shell"** tab
3. Run:
```bash
python manage.py createsuperuser
```
4. Follow prompts to create admin user

---

## 🎨 STEP 3: Deploy Frontend (React)

### 3.1 Create Static Site

1. Click **"New +"** → Select **"Static Site"**
2. Connect same repository
3. Configure:
   - **Name**: `medicare-frontend`
   - **Branch**: `main`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `build`

### 3.2 Environment Variables

Add only one variable:

```
REACT_APP_API_URL=https://medicare-backend.onrender.com/api
```

⚠️ **Replace** `medicare-backend` with YOUR actual backend service name!

⚠️ **No trailing slash** on `/api`!

### 3.3 Deploy

1. Click **"Create Static Site"**
2. Wait for build (3-5 minutes)
3. Frontend URL will be: `https://medicare-frontend.onrender.com`

---

## 🔗 STEP 4: Connect Frontend & Backend

### 4.1 Update Backend CORS Settings

1. Go to your **backend service** on Render
2. Click **"Environment"**
3. Update `CORS_ALLOWED_ORIGINS`:
```
https://medicare-frontend.onrender.com
```

4. Update `ALLOWED_HOSTS`:
```
medicare-backend.onrender.com,medicare-frontend.onrender.com
```

5. Click **"Save Changes"** - backend will auto-redeploy

### 4.2 Test the Connection

1. Open frontend URL: `https://medicare-frontend.onrender.com`
2. Try to login:
   - Should see login page
   - Open browser DevTools (F12) → Network tab
   - Attempt login
   - Check requests go to: `https://medicare-backend.onrender.com/api/...`
3. If CORS errors appear, double-check CORS_ALLOWED_ORIGINS

---

## ✅ STEP 5: Final Verification Checklist

### Backend Checks
- [ ] Backend URL loads (no 502/503 errors)
- [ ] `/admin/` page accessible
- [ ] Database migrations completed successfully
- [ ] Logs show no errors

### Frontend Checks
- [ ] Frontend URL loads application
- [ ] Login form appears
- [ ] Network requests go to correct backend URL
- [ ] No CORS errors in browser console
- [ ] Can login successfully (if you created superuser)

### Database Checks
- [ ] Database connection working (check backend logs)
- [ ] Migrations applied (backend logs show "Applying migrations...")

---

## 🔧 Troubleshooting Common Issues

### Issue 1: Build Failed - "Permission denied: ./build.sh"

**Solution:**
```bash
git update-index --chmod=+x backend/build.sh
git commit -m "Make build.sh executable"
git push
```

Or change Render Build Command to:
```bash
chmod +x build.sh && ./build.sh
```

### Issue 2: "DisallowedHost" Error

**Solution:** Update backend `ALLOWED_HOSTS`:
```
ALLOWED_HOSTS=medicare-backend.onrender.com,.onrender.com
```

### Issue 3: CORS Errors on Frontend

**Solution:** Check backend `CORS_ALLOWED_ORIGINS`:
```
CORS_ALLOWED_ORIGINS=https://medicare-frontend.onrender.com
```
- Must use `https://` (not `http://`)
- Must match EXACT frontend URL
- No trailing slash
- After changing, backend auto-redeploys

### Issue 4: Static Files Not Loading (CSS/JS missing)

**Solution:** Check that:
1. `whitenoise` is in `requirements.txt` ✓ (already done)
2. `WhiteNoiseMiddleware` is in `MIDDLEWARE` ✓ (already done)
3. `build.sh` runs `collectstatic` ✓ (already done)

### Issue 5: Database Connection Failed

**Solution:**
1. Verify all DB_* variables match Render database credentials
2. Check database is in "Available" status
3. Use **Internal Database URL** (not External)
4. Ensure backend and database are in same region

### Issue 6: Frontend Shows Old Backend URL

**Solution:**
1. Update `REACT_APP_API_URL` in frontend environment
2. **Manual Deploy** → Trigger new frontend build
3. Clear browser cache (Ctrl+Shift+R)

---

## 📝 Important Notes

### Free Tier Limitations

**Render Free Tier:**
- ⏸️ **Backend spins down after 15 mins of inactivity**
  - First request takes 30-60 seconds to wake up
  - Solution: Consider paid plan ($7/month) or use cron job to ping every 10 mins
- 💾 **Database**: 90-day expiry on free PostgreSQL
- 🔄 **Monthly limits**: 750 hours for web services

### Custom Domains (Optional)

To use your own domain:

**Backend:**
1. Go to backend service → Settings → Custom Domain
2. Add: `api.yourdomain.com`
3. Update DNS records as shown
4. Update `ALLOWED_HOSTS` and `CORS_ALLOWED_ORIGINS`

**Frontend:**
1. Go to frontend service → Settings → Custom Domain
2. Add: `www.yourdomain.com`
3. Update DNS records
4. Update backend `CORS_ALLOWED_ORIGINS`

### Monitoring & Logs

- **View Logs**: Service → Logs tab
- **Important logs to watch**:
  - Backend: `gunicorn` startup, database connections
  - Frontend: Build output, any errors

### Database Backups

For production data:
1. Upgrade to paid PostgreSQL plan
2. Enable automatic backups
3. Or manually backup:
```bash
# In backend Shell:
python manage.py dumpdata > backup.json
```

---

## 🚀 Deployment Commands Summary

### One-Time Setup
```bash
# Make build script executable
cd backend
git update-index --chmod=+x build.sh
git add build.sh
git commit -m "Make build.sh executable for Render"
git push
```

### Re-deploy After Code Changes
```bash
git add .
git commit -m "Your changes"
git push
```
Render auto-deploys both services on push!

### Manual Deploy
- Go to service → Manual Deploy → "Deploy latest commit"

---

## 📚 Environment Variables Quick Reference

### Backend Environment Variables
| Variable | Example Value | Required |
|----------|---------------|----------|
| SECRET_KEY | django-insecure-xxx | ✅ Yes |
| DEBUG | False | ✅ Yes |
| ALLOWED_HOSTS | medicare-backend.onrender.com | ✅ Yes |
| DB_ENGINE | django.db.backends.postgresql | ✅ Yes |
| DB_NAME | medicare_db | ✅ Yes |
| DB_USER | medicare_user | ✅ Yes |
| DB_PASSWORD | xxx | ✅ Yes |
| DB_HOST | xxx.oregon-postgres.render.com | ✅ Yes |
| DB_PORT | 5432 | ✅ Yes |
| CORS_ALLOWED_ORIGINS | https://medicare-frontend.onrender.com | ✅ Yes |
| JWT_ACCESS_TOKEN_LIFETIME_HOURS | 5 | ⚠️ Optional |
| JWT_REFRESH_TOKEN_LIFETIME_DAYS | 1 | ⚠️ Optional |
| SECURE_SSL_REDIRECT | True | ⚠️ Optional |
| LOG_LEVEL | INFO | ⚠️ Optional |

### Frontend Environment Variables
| Variable | Example Value | Required |
|----------|---------------|----------|
| REACT_APP_API_URL | https://medicare-backend.onrender.com/api | ✅ Yes |

---

## 🆘 Need Help?

1. **Check Render Logs**: Most issues show up in logs
2. **Backend Shell**: Use Shell tab to run Django management commands
3. **Test Locally First**: Use `.env.production` to test production settings locally

---

## ✨ You're Done!

Your MediCare Pro application should now be fully deployed on Render:
- 🗄️ PostgreSQL Database: Running
- 🔧 Django Backend: `https://medicare-backend.onrender.com`
- 🎨 React Frontend: `https://medicare-frontend.onrender.com`

**Next Steps:**
1. Test all features on production
2. Create initial data (doctors, patients, etc.) via admin panel
3. Share the frontend URL with users
4. Monitor logs for any issues

🎉 Congratulations on deploying to production!
