"""
Script to create Patient profiles for verified users who don't have one yet
Run this with: python fix_patient_profiles.py
"""
import os
import django

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'medicare_backend.settings')
django.setup()

from core.models import User, Patient

def fix_patient_profiles():
    """Create Patient profiles for verified patient users who don't have one"""
    
    # Find all verified patient users
    patient_users = User.objects.filter(role='patient', is_verified=True)
    
    fixed_count = 0
    for user in patient_users:
        # Check if patient profile exists
        if not Patient.objects.filter(user=user).exists():
            # Create the patient profile
            Patient.objects.create(
                user=user,
                name=user.get_full_name(),
                email=user.email,
                phone=user.phone or '',
                age=0,  # Admin can update this later
                gender='Not Specified',
                condition='New Patient',
                assigned_doctor=None
            )
            print(f"✅ Created Patient profile for: {user.get_full_name()} ({user.email})")
            fixed_count += 1
        else:
            print(f"✓ Patient profile already exists for: {user.get_full_name()}")
    
    print(f"\n{'='*60}")
    print(f"Fixed {fixed_count} patient profile(s)")
    print(f"{'='*60}")

if __name__ == '__main__':
    print("Fixing patient profiles...\n")
    fix_patient_profiles()
    print("\nDone! Patient profiles are now up to date.")
