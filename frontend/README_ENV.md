# Environment Configuration Guide

## ✅ What Was Changed

The application has been updated to use environment variables for the API URL instead of hardcoded values.

### Files Updated (22 files total):

#### Core Configuration:
1. **`src/config/api.js`** (NEW) - Centralized API configuration
2. **`src/context/AuthContext.jsx`** - Authentication context

#### Main Components:
3. `src/components/AdminDashboard.jsx`
4. `src/components/Appointments.jsx`
5. `src/components/DoctorAppointments.jsx`
6. `src/components/DoctorDashboard.jsx`
7. `src/components/DoctorPatients.jsx`
8. `src/components/Doctors.jsx`
9. `src/components/MedicalRecords.jsx`
10. `src/components/Patients.jsx`
11. `src/components/PatientDashboard.jsx`
12. `src/components/PatientRegister.jsx`
13. `src/components/ReceptionistAppointments.jsx`
14. `src/components/ReceptionistPatients.jsx`
15. `src/components/Reports.jsx`

#### Modal Components:
16. `src/components/NewAppointmentModal.jsx`
17. `src/components/NewDoctorModal.jsx`
18. `src/components/NewMedicalRecordModal.jsx`
19. `src/components/NewPatientModal.jsx`
20. `src/components/EditPatientModal.jsx`
21. `src/components/PatientReportModal.jsx`

## 🔧 How It Works

### Before:
```javascript
const API_URL = 'http://localhost:8000/api';
```

### After:
```javascript
import API_URL from '../config/api';
```

### Config File (`src/config/api.js`):
```javascript
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';
export default API_URL;
```

## 📝 Usage

### Local Development:
1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. The default `.env` file contains:
   ```env
   REACT_APP_API_URL=http://localhost:8000/api
   ```

3. Start the development server:
   ```bash
   npm start
   ```

### Production Deployment:
1. Update `.env` or set environment variable in your hosting platform:
   ```env
   REACT_APP_API_URL=https://your-backend-api.com/api
   ```

2. Build the application:
   ```bash
   npm run build
   ```

## 🌐 Deployment Platforms

### Vercel:
- Go to Project Settings → Environment Variables
- Add: `REACT_APP_API_URL` = `https://your-backend-api.com/api`

### Netlify:
- Go to Site Settings → Build & Deploy → Environment
- Add: `REACT_APP_API_URL` = `https://your-backend-api.com/api`

### Docker:
```dockerfile
ENV REACT_APP_API_URL=https://your-backend-api.com/api
```

## ⚠️ Important Notes

1. **Environment variables must start with `REACT_APP_`** in Create React App
2. **Restart the development server** after changing `.env` file
3. **Don't commit `.env`** file to version control (it's in `.gitignore`)
4. **Use `.env.example`** as a template for other developers

## 🔍 Verification

To verify the API URL is being used correctly:

1. Open browser console
2. Check network requests
3. Verify requests are going to the correct API URL

Or add a console log temporarily:
```javascript
console.log('API URL:', API_URL);
```

## 🆘 Troubleshooting

### Issue: Changes not reflecting
**Solution:** Restart the development server (`npm start`)

### Issue: API calls failing
**Solution:** 
- Check `.env` file exists
- Verify `REACT_APP_API_URL` is set correctly
- Ensure no trailing slash in URL
- Check backend CORS configuration

### Issue: Build fails
**Solution:**
- Ensure `.env` file is present during build
- Or set environment variable in build command:
  ```bash
  REACT_APP_API_URL=https://api.example.com npm run build
  ```

## 📚 Learn More

- [Create React App - Environment Variables](https://create-react-app.dev/docs/adding-custom-environment-variables/)
- [Deployment Guide](../DEPLOYMENT.md)
