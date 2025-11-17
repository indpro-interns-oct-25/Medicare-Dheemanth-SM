# Secure Sample Data Management

## ⚠️ SECURITY NOTICE

**DO NOT commit files with hardcoded passwords to GitHub!**

This project uses a secure Django management command to create sample data with randomly generated passwords.

---

## ✅ Secure Method (Use This!)

### Create Sample Doctors with Random Passwords

**Development (show passwords):**
```bash
python manage.py createsampledata --show-passwords
```

This will:
- Create 4 sample doctors with secure random passwords
- Display the credentials (save them!)
- Safe to use in development

**Production (hide passwords):**
```bash
python manage.py createsampledata
```

This will:
- Create sample doctors with secure passwords
- NOT display passwords (use superuser to reset if needed)
- Suitable for production environments

---

## 📋 What Gets Created

The command creates these sample doctors:

1. **Dr. Sarah Wilson** - Cardiology
   - Username: `dr.wilson`
   - Email: `sarah.wilson@hospital.com`

2. **Dr. Michael Anderson** - Pediatrics
   - Username: `dr.anderson`
   - Email: `michael.anderson@hospital.com`

3. **Dr. Emily Martinez** - Neurology
   - Username: `dr.martinez`
   - Email: `emily.martinez@hospital.com`

4. **Dr. David Johnson** - Orthopedics
   - Username: `dr.johnson`
   - Email: `david.johnson@hospital.com`

Each doctor gets a cryptographically secure random password (16 characters).

---

## 🚀 Usage Examples

### Local Development

```bash
# Activate virtual environment
.\venv\Scripts\Activate.ps1  # Windows
source venv/bin/activate      # macOS/Linux

# Create sample data and see passwords
python manage.py createsampledata --show-passwords

# Example output:
# ✓ Created doctor: Dr. Sarah Wilson (Cardiology)
# 
# GENERATED CREDENTIALS (SAVE THESE!)
# Name: Dr. Sarah Wilson
#   Username: dr.wilson
#   Email: sarah.wilson@hospital.com
#   Password: aB3!xY7@zQ2#mP9$
```

### Production (Render)

After deploying to Render:

1. Go to your backend service
2. Click **"Shell"** tab
3. Run:
```bash
python manage.py createsampledata
```

4. To reset a password later:
```bash
python manage.py shell
>>> from core.models import User
>>> user = User.objects.get(username='dr.wilson')
>>> user.set_password('new_password_here')
>>> user.save()
>>> exit()
```

---

## 🔒 Security Best Practices

### ✅ DO:
- Use the `createsampledata` management command
- Generate random passwords for each environment
- Store credentials in a password manager (1Password, LastPass, etc.)
- Use different passwords in production vs development
- Reset default passwords immediately after first login

### ❌ DON'T:
- Hardcode passwords in Python files
- Commit files like `add_sample_doctors.py` with passwords
- Use the same passwords across environments
- Share credentials via email or chat
- Leave default passwords unchanged

---

## 🛡️ What's Protected by .gitignore

The following files are automatically ignored:
```
add_sample_*.py
*_sample_data.py
seed_data.py
```

If you created any of these files before, they won't be committed to GitHub.

---

## 🔄 Migrating from Old Method

If you previously used `add_sample_doctors.py`:

1. **Delete the old file** (it's already gitignored):
```bash
rm add_sample_doctors.py
```

2. **Use the new command**:
```bash
python manage.py createsampledata --show-passwords
```

3. **Update your notes** with new credentials

---

## 📚 Creating Custom Sample Data

If you need to add more sample users (receptionists, admins, etc.), extend the management command:

1. Open: `core/management/commands/createsampledata.py`
2. Add your sample data (WITHOUT passwords!)
3. Use `generate_secure_password()` for password generation
4. Test locally first

Example:
```python
# In createsampledata.py, add this to the handle() method:

sample_receptionists = [
    {
        'username': 'reception1',
        'email': 'reception@hospital.com',
        'first_name': 'Lisa',
        'last_name': 'Brown',
        'phone': '+1 (555) 999-0000',
        'role': 'receptionist',
    }
]

for receptionist_data in sample_receptionists:
    if not User.objects.filter(email=receptionist_data['email']).exists():
        password = generate_secure_password()
        User.objects.create_user(
            **receptionist_data,
            password=password
        )
        if show_passwords:
            credentials.append({...})
```

---

## 🆘 Troubleshooting

### Issue: "Command not found"

**Solution:** Make sure you're in the backend directory:
```bash
cd backend
python manage.py createsampledata
```

### Issue: "Doctor already exists"

**Solution:** The command safely skips existing users. To recreate:
```bash
# Delete existing doctors first
python manage.py shell
>>> from core.models import User
>>> User.objects.filter(role='doctor').delete()
>>> exit()

# Then recreate
python manage.py createsampledata --show-passwords
```

### Issue: "No module named core.management"

**Solution:** Make sure `__init__.py` files exist:
```bash
ls core/management/__init__.py
ls core/management/commands/__init__.py
```

---

## ✅ Checklist Before Deployment

- [ ] Deleted or gitignored old `add_sample_doctors.py`
- [ ] Tested `createsampledata` command locally
- [ ] Saved generated credentials securely
- [ ] Verified `.gitignore` includes sample data patterns
- [ ] Checked that no hardcoded passwords exist in code
- [ ] Committed the management command to git
- [ ] Documented the process for team members

---

## 🎓 Learn More

- [Django Management Commands](https://docs.djangoproject.com/en/stable/howto/custom-management-commands/)
- [Python secrets module](https://docs.python.org/3/library/secrets.html)
- [Password Best Practices](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)

---

**Remember: Security is not optional. Always protect user credentials!** 🔒
