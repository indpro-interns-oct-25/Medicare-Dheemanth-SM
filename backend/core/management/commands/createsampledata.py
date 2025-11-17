"""
Django management command to create sample doctors and users.
This is SAFE to commit to GitHub - no hardcoded passwords!
"""
from django.core.management.base import BaseCommand
from django.contrib.auth.hashers import make_password
from core.models import User
import secrets
import string


def generate_secure_password(length=16):
    """Generate a cryptographically secure random password"""
    alphabet = string.ascii_letters + string.digits + string.punctuation
    password = ''.join(secrets.choice(alphabet) for _ in range(length))
    return password


class Command(BaseCommand):
    help = 'Creates sample doctors and users with secure random passwords'

    def add_arguments(self, parser):
        parser.add_argument(
            '--show-passwords',
            action='store_true',
            help='Display generated passwords (use only for development/testing)',
        )

    def handle(self, *args, **options):
        show_passwords = options['show_passwords']
        
        # Sample doctors data (NO PASSWORDS HERE!)
        sample_doctors = [
            {
                'username': 'dr.wilson',
                'email': 'sarah.wilson@hospital.com',
                'first_name': 'Sarah',
                'last_name': 'Wilson',
                'phone': '+1 (555) 123-4567',
                'department': 'Cardiology',
            },
            {
                'username': 'dr.anderson',
                'email': 'michael.anderson@hospital.com',
                'first_name': 'Michael',
                'last_name': 'Anderson',
                'phone': '+1 (555) 234-5678',
                'department': 'Pediatrics',
            },
            {
                'username': 'dr.martinez',
                'email': 'emily.martinez@hospital.com',
                'first_name': 'Emily',
                'last_name': 'Martinez',
                'phone': '+1 (555) 345-6789',
                'department': 'Neurology',
            },
            {
                'username': 'dr.johnson',
                'email': 'david.johnson@hospital.com',
                'first_name': 'David',
                'last_name': 'Johnson',
                'phone': '+1 (555) 456-7890',
                'department': 'Orthopedics',
            },
        ]

        self.stdout.write(self.style.SUCCESS('='*60))
        self.stdout.write(self.style.SUCCESS('Creating Sample Doctors'))
        self.stdout.write(self.style.SUCCESS('='*60))
        self.stdout.write('')

        created_count = 0
        credentials = []

        for doctor_data in sample_doctors:
            # Check if doctor already exists
            if User.objects.filter(email=doctor_data['email']).exists():
                self.stdout.write(
                    self.style.WARNING(
                        f"⚠ Doctor already exists: Dr. {doctor_data['first_name']} {doctor_data['last_name']}"
                    )
                )
                continue

            # Generate secure random password
            password = generate_secure_password()
            
            # Create the doctor
            user = User.objects.create_user(
                username=doctor_data['username'],
                email=doctor_data['email'],
                first_name=doctor_data['first_name'],
                last_name=doctor_data['last_name'],
                phone=doctor_data['phone'],
                department=doctor_data['department'],
                role='doctor',
                password=password
            )
            
            created_count += 1
            self.stdout.write(
                self.style.SUCCESS(
                    f"✓ Created doctor: Dr. {doctor_data['first_name']} {doctor_data['last_name']} ({doctor_data['department']})"
                )
            )

            # Store credentials if requested
            if show_passwords:
                credentials.append({
                    'name': f"Dr. {doctor_data['first_name']} {doctor_data['last_name']}",
                    'username': doctor_data['username'],
                    'email': doctor_data['email'],
                    'password': password
                })

        self.stdout.write('')
        self.stdout.write(self.style.SUCCESS('='*60))
        self.stdout.write(self.style.SUCCESS(f'Summary: {created_count} new doctors created'))
        self.stdout.write(self.style.SUCCESS(f'Total doctors in system: {User.objects.filter(role="doctor").count()}'))
        self.stdout.write(self.style.SUCCESS('='*60))

        # Display credentials if requested
        if show_passwords and credentials:
            self.stdout.write('')
            self.stdout.write(self.style.WARNING('='*60))
            self.stdout.write(self.style.WARNING('GENERATED CREDENTIALS (SAVE THESE!)'))
            self.stdout.write(self.style.WARNING('='*60))
            self.stdout.write('')
            
            for cred in credentials:
                self.stdout.write(self.style.WARNING(f"Name: {cred['name']}"))
                self.stdout.write(f"  Username: {cred['username']}")
                self.stdout.write(f"  Email: {cred['email']}")
                self.stdout.write(self.style.WARNING(f"  Password: {cred['password']}"))
                self.stdout.write('')
            
            self.stdout.write(self.style.WARNING('⚠ IMPORTANT: Save these credentials securely!'))
            self.stdout.write(self.style.WARNING('⚠ Passwords are randomly generated and cannot be recovered.'))
            self.stdout.write(self.style.WARNING('='*60))
        elif created_count > 0:
            self.stdout.write('')
            self.stdout.write(self.style.WARNING('ℹ Passwords have been generated but not displayed.'))
            self.stdout.write(self.style.WARNING('ℹ Run with --show-passwords flag to see credentials:'))
            self.stdout.write('  python manage.py createsampledata --show-passwords')
