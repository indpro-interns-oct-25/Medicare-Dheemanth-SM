"""
Django management command to create initial test users
Run with: python manage.py setup_initial_data
"""
from django.core.management.base import BaseCommand
from core.models import User


class Command(BaseCommand):
    help = 'Creates initial test users for the healthcare management system'

    def handle(self, *args, **options):
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
        
        self.stdout.write("Creating test users...")
        self.stdout.write("-" * 50)
        
        created_count = 0
        skipped_count = 0
        
        for user_data in users_data:
            email = user_data['email']
            
            # Check if user already exists
            if User.objects.filter(email=email).exists():
                self.stdout.write(
                    self.style.WARNING(f"User {email} already exists. Skipping...")
                )
                skipped_count += 1
                continue
            
            # Create user
            password = user_data.pop('password')
            user = User.objects.create_user(**user_data)
            user.set_password(password)
            user.save()
            
            self.stdout.write(
                self.style.SUCCESS(f"Created {user_data['role']}: {email}")
            )
            created_count += 1
        
        self.stdout.write("-" * 50)
        self.stdout.write(
            self.style.SUCCESS(
                f"Setup complete! Created {created_count} users, skipped {skipped_count} existing users."
            )
        )
        
        if created_count > 0:
            self.stdout.write("\nYou can now login with:")
            self.stdout.write("  Admin: admin@medicare.com / admin123")
            self.stdout.write("  Doctor: doctor@medicare.com / doctor123")
            self.stdout.write("  Receptionist: receptionist@medicare.com / receptionist123")
            self.stdout.write("  Patient: patient@medicare.com / patient123")
