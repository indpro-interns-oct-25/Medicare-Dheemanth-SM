"""
Script to create initial test users for the healthcare management system
Run this with: python setup_users.py
"""
import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from core.models import User

def create_users():
    """Create initial test users"""
    
    users_data = [
        {
            'username': 'admin',
            'email': 'admin@medicare.com',
            'password': 'admin123',
            'first_name': 'Admin',
            'last_name': 'User',
            'role': 'admin',
            'is_staff': True,
            'is_superuser': True
        },
        {
            'username': 'doctor1',
            'email': 'doctor@medicare.com',
            'password': 'doctor123',
            'first_name': 'Dr. John',
            'last_name': 'Smith',
            'role': 'doctor',
            'department': 'Cardiology',
            'phone': '555-0101'
        },
        {
            'username': 'receptionist1',
            'email': 'receptionist@medicare.com',
            'password': 'receptionist123',
            'first_name': 'Jane',
            'last_name': 'Doe',
            'role': 'receptionist',
            'department': 'Front Desk',
            'phone': '555-0102'
        },
        {
            'username': 'patient1',
            'email': 'patient@medicare.com',
            'password': 'patient123',
            'first_name': 'Michael',
            'last_name': 'Johnson',
            'role': 'patient',
            'phone': '555-0103'
        }
    ]
    
    print("Creating test users...")
    print("-" * 50)
    
    for user_data in users_data:
        email = user_data['email']
        
        # Check if user already exists
        if User.objects.filter(email=email).exists():
            print(f"❌ User {email} already exists. Skipping...")
            continue
        
        # Create user
        password = user_data.pop('password')
        user = User.objects.create_user(**user_data)
        user.set_password(password)
        user.save()
        
        print(f"✅ Created {user_data['role']}: {email}")
        print(f"   Username: {user_data['username']}")
        print(f"   Password: {password}")
        print()
    
    print("-" * 50)
    print("✅ Setup complete!")
    print("\nYou can now login with:")
    print("  Admin: admin@medicare.com / admin123")
    print("  Doctor: doctor@medicare.com / doctor123")
    print("  Receptionist: receptionist@medicare.com / receptionist123")
    print("  Patient: patient@medicare.com / patient123")

if __name__ == '__main__':
    create_users()
