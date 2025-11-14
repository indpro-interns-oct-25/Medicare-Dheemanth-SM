# MediCare Pro

A full‑stack healthcare management platform built with **React** (frontend) and **Django REST Framework** (backend). It provides dashboards for admins, doctors, receptionists, and patients to manage appointments, patients, doctors, and medical records.

---

## 🚀 Features

- **Role-based dashboards**
  - Admin: manage doctors, patients, appointments, reports, and medical records
  - Doctor: view assigned patients, appointments, and medical records
  - Receptionist: manage patient registrations and appointments
  - Patient: view their dashboard, records, and appointments
- **Authentication & JWT-based authorization**
- **Medical records management** with filtering and PDF export
- **Responsive UI** with improved, standardized font sizes for readability
- **Environment-driven configuration** for both frontend and backend

---

## 🧱 Tech Stack

- **Frontend**: React, React Router, CSS modules
- **Backend**: Django, Django REST Framework, Simple JWT
- **Database**: SQLite for development, PostgreSQL/MySQL for production
- **Other**: python-decouple, django-cors-headers

---

## 🔧 Local Development Setup

### 1. Clone the repository

```bash
git clone https://github.com/indpro-interns-oct-25/Medicare-Dheemanth-SM.git
cd Medicare-Dheemanth-SM
```

### 2. Backend Setup (Django)

```bash
cd backend

# Create and activate virtualenv (recommended)
python -m venv venv
# Windows
venv\Scripts\activate
# macOS/Linux
# source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file from example
cp .env.example .env   # or manually create .env

# Run migrations
python manage.py migrate

# (Optional) create superuser
python manage.py createsuperuser

# Start backend server
python manage.py runserver
```

The backend will run at: `http://127.0.0.1:8000/`

### 3. Frontend Setup (React)

```bash
cd ../frontend

# Install dependencies
npm install

# Create .env file from example
cp .env.example .env   # or manually create .env
```

Ensure `.env` contains:

```env
REACT_APP_API_URL=http://localhost:8000/api
```

Then start the frontend dev server:

```bash
npm start
```

The frontend will run at: `http://localhost:3000/`

---

## 🌐 Environment Variables

### Frontend (`frontend/.env`)

```env
REACT_APP_API_URL=http://localhost:8000/api
REACT_APP_NAME=MediCare Pro
REACT_APP_VERSION=1.0.0
```

For production, point `REACT_APP_API_URL` to your deployed backend:

```env
REACT_APP_API_URL=https://your-backend-domain.com/api
```

### Backend (`backend/.env`)

Use `backend/.env.example` as a template. Typical development values:

```env
SECRET_KEY=dev-secret-key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

DB_ENGINE=django.db.backends.sqlite3
DB_NAME=db.sqlite3

CORS_ALLOWED_ORIGINS=http://localhost:3000

JWT_ACCESS_TOKEN_LIFETIME_HOURS=5
JWT_REFRESH_TOKEN_LIFETIME_DAYS=1
```

For production, set:

```env
DEBUG=False
SECRET_KEY=your-strong-random-key
ALLOWED_HOSTS=your-backend-domain.com
DB_ENGINE=django.db.backends.postgresql
# and related DB_* settings
CORS_ALLOWED_ORIGINS=https://your-frontend-domain.com
```

---

## 🚀 Deployment Overview

This project is prepared for cloud deployment:

- **Frontend**
  - Uses `REACT_APP_API_URL` for backend URL
  - Build with `npm run build`
  - Suitable for Vercel, Netlify, or any static host

- **Backend**
  - Uses `python-decouple` for all secrets and config
  - `Procfile` and `runtime.txt` included for platforms like Heroku/Railway
  - Static and media settings configured (`STATIC_ROOT`, `MEDIA_ROOT`)

### Example: Deploy Backend to Heroku (summary)

1. Create Heroku app and PostgreSQL addon
2. Set environment variables from `backend/.env.example`
3. Push code:

```bash
cd backend
heroku create your-backend-app
heroku addons:create heroku-postgresql:mini
heroku config:set SECRET_KEY=your-key DEBUG=False ALLOWED_HOSTS=your-backend-app.herokuapp.com
heroku config:set CORS_ALLOWED_ORIGINS=https://your-frontend-domain.com
git push heroku main
heroku run python manage.py migrate
```

### Example: Deploy Frontend to Vercel (summary)

```bash
cd frontend
# Set REACT_APP_API_URL in Vercel project settings
npm run build
vercel --prod
```

See these docs for full details:

- `DEPLOYMENT.md` – full deployment guide for entire project
- `frontend/README_ENV.md` – frontend env/config details
- `backend/README_DEPLOYMENT.md` – backend deployment details

---

## 🧪 Testing

- Backend tests:

```bash
cd backend
python manage.py test
```

- Frontend tests (if configured):

```bash
cd frontend
npm test
```

---

## 📂 Key Directories

- `frontend/` – React SPA for all roles (admin, doctor, receptionist, patient)
- `backend/` – Django REST API, authentication, business logic
- `backend/core/` – models, serializers, views, URLs

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m "Add your feature"`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a Pull Request

---

## 📜 License

This project is for educational/internship purposes. Add a proper license here if you plan to open source or distribute it.
