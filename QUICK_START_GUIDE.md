# 🚀 Quick Start Guide - Patient Registration System

## Start the Application

### Terminal 1 - Backend
```bash
cd backend
.\venv\Scripts\activate
python manage.py runserver
```
Backend will run on: `http://localhost:8000`

### Terminal 2 - Frontend
```bash
cd frontend
npm start
```
Frontend will run on: `http://localhost:3000`

---

## 🧪 Test the Complete Flow (5 Minutes)

### Test 1: Patient Registration ⏱️ 1 min
1. Open `http://localhost:3000`
2. Click **"Register as Patient"** button
3. Fill the form:
   ```
   First Name: John
   Last Name: Doe
   Email: john.doe@example.com
   Phone: +1234567890
   Password: test1234
   Confirm Password: test1234
   ```
4. Click **"✨ Create Account"**
5. ✅ Success message appears: "Your account is pending admin verification"

### Test 2: Verify Patient Cannot Login ⏱️ 30 sec
1. Go to `http://localhost:3000/login`
2. Try logging in with:
   ```
   Email: john.doe@example.com
   Password: test1234
   ```
3. ✅ Error shown: "Your account is pending verification by an administrator"

### Test 3: Admin Receives Notification ⏱️ 1 min
1. Login as admin:
   ```
   Email: admin@medicare.com
   Password: admin123
   ```
2. Look at top-right corner - see **🔔** with red badge showing "1"
3. Click the notification bell
4. ✅ See: "New Patient Registration - John Doe (john.doe@example.com) has registered and is awaiting verification"

### Test 4: Admin Approves Patient ⏱️ 30 sec
1. In the notification dropdown, click **"✓ Approve"**
2. ✅ Alert shows: "Patient John Doe has been verified and can now login"
3. Notification badge disappears

### Test 5: Patient Logs In Successfully ⏱️ 1 min
1. Logout from admin account
2. Login with patient credentials:
   ```
   Email: john.doe@example.com
   Password: test1234
   ```
3. ✅ Automatically redirected to `/patient/dashboard`
4. ✅ See patient dashboard with:
   - Welcome message with patient name
   - Patient information card
   - Appointments section (empty for new patient)
   - Medical records section (empty for new patient)

### Test 6: Test Rejection Flow ⏱️ 1 min
1. Register another patient (use different email)
2. Login as admin
3. Click notification bell
4. Click **"✕ Reject"** on the new registration
5. ✅ Patient account deleted
6. Try logging in with rejected credentials
7. ✅ Error: "Invalid credentials"

---

## 📋 All Login Credentials

### Staff Accounts (Pre-existing)
```
┌─────────────┬────────────────────────────┬─────────────┬──────────────────────┐
│ Role        │ Email                      │ Password    │ Dashboard            │
├─────────────┼────────────────────────────┼─────────────┼──────────────────────┤
│ Admin       │ admin@medicare.com         │ admin123    │ /dashboard           │
│ Doctor      │ doctor@medicare.com        │ doctor123   │ /doctor/dashboard    │
│ Receptionist│ receptionist@medicare.com  │ receptionist123 │ /receptionist/*  │
└─────────────┴────────────────────────────┴─────────────┴──────────────────────┘
```

### Patient Accounts (Register New)
- Register at `/register`
- Wait for admin approval
- Login at `/login`
- Access dashboard at `/patient/dashboard`

---

## 🎯 Key URLs

| Page | URL | Access |
|------|-----|--------|
| Homepage | `http://localhost:3000/` | Public |
| Patient Registration | `http://localhost:3000/register` | Public |
| Login | `http://localhost:3000/login` | Public |
| Admin Dashboard | `http://localhost:3000/dashboard` | Admin only |
| Patient Dashboard | `http://localhost:3000/patient/dashboard` | Verified Patients |
| Doctor Dashboard | `http://localhost:3000/doctor/dashboard` | Doctors only |

---

## 🔍 What to Look For

### Patient Registration Page ✨
- Beautiful gradient background
- Form validation
- Password strength indicator
- Success/error messages
- "Register here" link from login page

### Admin Notification Bell 🔔
- Red badge with count
- Smooth dropdown animation
- Patient details in notification
- Green "Approve" and Red "Reject" buttons
- "No new notifications" empty state

### Patient Dashboard 💙
- Personalized welcome message
- Patient info card with all details
- Appointment cards with doctor names, dates, times
- Medical records with doctor and report details
- Professional sidebar navigation
- Clean, modern design

---

## ✅ Verification Checklist

After testing, you should have verified:

- [x] Patient can register from homepage
- [x] Registration form validates all fields
- [x] Duplicate emails are prevented
- [x] Unverified patients cannot login
- [x] Admin sees notification bell badge
- [x] Admin can view registration details
- [x] Admin can approve patients
- [x] Admin can reject patients
- [x] Approved patients can login
- [x] Patients see their dashboard
- [x] Dashboard shows appointments (if any)
- [x] Dashboard shows medical records (if any)
- [x] UI is responsive and beautiful
- [x] Navigation works correctly
- [x] Logout works for all roles

---

## 🎨 UI Preview

### Patient Registration
```
┌─────────────────────────────────────────────┐
│  💙 MediCare Pro                            │
│  Patient Registration                       │
│                                             │
│  Create Your Account                        │
│  Fill in your details to get started       │
│                                             │
│  [First Name]  [Last Name]                 │
│  [Email Address]                           │
│  [Phone Number]                            │
│  [Password] 👁️                             │
│  [Confirm Password] 👁️                     │
│                                             │
│  [✨ Create Account]                        │
│                                             │
│  Already have account? Login here          │
└─────────────────────────────────────────────┘
```

### Admin Notification Bell
```
┌─────────────────────────────────────┐
│  Notifications                  ✕   │
├─────────────────────────────────────┤
│  📋 New Patient Registration        │
│  John Doe (john.doe@example.com)    │
│  has registered and is awaiting     │
│  verification.                      │
│  Nov 11, 2025                       │
│  [✓ Approve]  [✕ Reject]           │
└─────────────────────────────────────┘
```

### Patient Dashboard
```
┌──────────┬─────────────────────────────────────┐
│          │  Welcome back, John Doe!            │
│  💙      │  Here's your health overview        │
│  MediCare│                                      │
│          │  👤 Patient Information              │
│  📊      │  Email: john.doe@example.com        │
│  📅      │  Phone: +1234567890                 │
│  📋      │  Doctor: Dr. Sarah Wilson           │
│  👨‍⚕️      │                                      │
│  ⚙️      │  📅 My Appointments                  │
│          │  [No appointments scheduled yet]    │
│  🚪      │                                      │
│          │  📋 Medical Records & Reports       │
│          │  [No medical records available yet] │
└──────────┴─────────────────────────────────────┘
```

---

## 🎊 Congratulations!

You now have a fully functional patient registration system with:
- ✅ Public patient registration
- ✅ Admin verification workflow
- ✅ Notification system
- ✅ Patient dashboard
- ✅ Role-based authentication
- ✅ Beautiful, modern UI/UX

**Happy Testing! 🚀**
