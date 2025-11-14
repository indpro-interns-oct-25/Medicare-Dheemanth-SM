"""
Script to fix doctor names to have proper formatting
Run this with: python fix_doctor_names.py
"""
import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from core.models import User

def fix_doctor_names():
    """Update doctor names to have Dr. prefix"""
    doctors = User.objects.filter(role='doctor')
    
    print("Fixing doctor names...")
    print("-" * 50)
    
    for doctor in doctors:
        # Remove any existing "Dr." prefix to avoid duplication
        first_name = doctor.first_name.replace('Dr. ', '').replace('Dr.', '').strip()
        
        # Add "Dr." prefix
        doctor.first_name = f"Dr. {first_name}"
        doctor.save()
        
        print(f"✅ Updated: {doctor.get_full_name()} ({doctor.department})")
    
    print("-" * 50)
    print(f"✅ Fixed {doctors.count()} doctors")

if __name__ == '__main__':
    fix_doctor_names()
