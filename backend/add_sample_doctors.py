import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from core.models import User

# Sample doctors data
sample_doctors = [
    {
        'username': 'dr.wilson',
        'email': 'sarah.wilson@hospital.com',
        'first_name': 'Sarah',
        'last_name': 'Wilson',
        'phone': '+1 (555) 123-4567',
        'department': 'Cardiology',
        'password': 'doctor123'
    },
    {
        'username': 'dr.anderson',
        'email': 'michael.anderson@hospital.com',
        'first_name': 'Michael',
        'last_name': 'Anderson',
        'phone': '+1 (555) 234-5678',
        'department': 'Pediatrics',
        'password': 'doctor123'
    },
    {
        'username': 'dr.martinez',
        'email': 'emily.martinez@hospital.com',
        'first_name': 'Emily',
        'last_name': 'Martinez',
        'phone': '+1 (555) 345-6789',
        'department': 'Neurology',
        'password': 'doctor123'
    },
    {
        'username': 'dr.johnson',
        'email': 'david.johnson@hospital.com',
        'first_name': 'David',
        'last_name': 'Johnson',
        'phone': '+1 (555) 456-7890',
        'department': 'Orthopedics',
        'password': 'doctor123'
    },
]

def create_sample_doctors():
    created_count = 0
    for doctor_data in sample_doctors:
        # Check if doctor already exists
        if not User.objects.filter(email=doctor_data['email']).exists():
            User.objects.create_user(
                username=doctor_data['username'],
                email=doctor_data['email'],
                first_name=doctor_data['first_name'],
                last_name=doctor_data['last_name'],
                phone=doctor_data['phone'],
                department=doctor_data['department'],
                role='doctor',
                password=doctor_data['password']
            )
            created_count += 1
            print(f"✓ Created doctor: Dr. {doctor_data['first_name']} {doctor_data['last_name']} ({doctor_data['department']})")
        else:
            print(f"- Doctor already exists: Dr. {doctor_data['first_name']} {doctor_data['last_name']}")
    
    print(f"\n{'='*50}")
    print(f"Summary: {created_count} new doctors created")
    print(f"Total doctors in system: {User.objects.filter(role='doctor').count()}")
    print(f"{'='*50}")

if __name__ == '__main__':
    print("Adding sample doctors to the database...\n")
    create_sample_doctors()
