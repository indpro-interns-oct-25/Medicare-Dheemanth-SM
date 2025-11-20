"""
Django management command to populate database with doctors, patients, appointments, and medical records
Run with: python manage.py populate_all_data
"""
from django.core.management.base import BaseCommand
from core.models import User, Patient, Appointment, MedicalRecord
from datetime import datetime, timedelta
from random import choice, randint


class Command(BaseCommand):
    help = 'Populates the database with sample doctors, patients, appointments, and medical records'

    def handle(self, *args, **options):
        self.stdout.write("=" * 50)
        self.stdout.write(self.style.SUCCESS("POPULATING DATABASE WITH SAMPLE DATA"))
        self.stdout.write("=" * 50)
        
        # Create doctors
        doctors = self.create_doctors()
        
        # Create patients
        patients = self.create_patients(doctors)
        
        # Create appointments
        appointments = self.create_appointments(patients, doctors)
        
        # Create medical records
        medical_records = self.create_medical_records(patients, doctors)
        
        self.stdout.write("\n" + "=" * 50)
        self.stdout.write(self.style.SUCCESS("✅ DATABASE POPULATION COMPLETE!"))
        self.stdout.write("=" * 50)
        self.stdout.write(f"\nSummary:")
        self.stdout.write(f"  - Doctors: {len(doctors)}")
        self.stdout.write(f"  - Patients: {len(patients)}")
        self.stdout.write(f"  - Appointments: {len(appointments)}")
        self.stdout.write(f"  - Medical Records: {len(medical_records)}")
        self.stdout.write("\nYou can now view this data in your application!")

    def create_doctors(self):
        """Create sample doctors"""
        all_doctors = []
        main_doctor = User.objects.filter(email='doctor@medicare.com').first()
        if main_doctor:
            all_doctors.append(main_doctor)
            self.stdout.write(f"ℹ️  Including existing main doctor: {main_doctor.email}")
        
        doctors_data = [
            {
                'username': 'dr_sarah_wilson',
                'email': 'sarah.wilson@medicare.com',
                'password': 'doctor123',
                'first_name': 'Sarah',
                'last_name': 'Wilson',
                'role': 'doctor',
                'department': 'Cardiology',
                'phone': '555-1001'
            },
            {
                'username': 'dr_james_chen',
                'email': 'james.chen@medicare.com',
                'password': 'doctor123',
                'first_name': 'James',
                'last_name': 'Chen',
                'role': 'doctor',
                'department': 'Neurology',
                'phone': '555-1002'
            },
            {
                'username': 'dr_emily_patel',
                'email': 'emily.patel@medicare.com',
                'password': 'doctor123',
                'first_name': 'Emily',
                'last_name': 'Patel',
                'role': 'doctor',
                'department': 'Pediatrics',
                'phone': '555-1003'
            },
            {
                'username': 'dr_michael_brown',
                'email': 'michael.brown@medicare.com',
                'password': 'doctor123',
                'first_name': 'Michael',
                'last_name': 'Brown',
                'role': 'doctor',
                'department': 'Orthopedics',
                'phone': '555-1004'
            }
        ]
        
        self.stdout.write("\nCreating doctors...")
        self.stdout.write("-" * 50)
        
        created_doctors = all_doctors.copy()
        for doctor_data in doctors_data:
            email = doctor_data['email']
            
            if User.objects.filter(email=email).exists():
                doctor = User.objects.get(email=email)
                self.stdout.write(self.style.WARNING(f"ℹ️  Doctor {email} already exists."))
                created_doctors.append(doctor)
                continue
            
            password = doctor_data.pop('password')
            doctor = User.objects.create_user(**doctor_data)
            doctor.set_password(password)
            doctor.save()
            created_doctors.append(doctor)
            
            self.stdout.write(self.style.SUCCESS(
                f"✅ Created Doctor: Dr. {doctor.first_name} {doctor.last_name} ({doctor.department})"
            ))
        
        return created_doctors

    def create_patients(self, doctors):
        """Create sample patients"""
        patients_data = [
            {
                'name': 'Robert Anderson',
                'email': 'robert.anderson@email.com',
                'phone': '555-2001',
                'age': 45,
                'gender': 'Male',
                'condition': 'Hypertension',
                'status': 'Active'
            },
            {
                'name': 'Jennifer Martinez',
                'email': 'jennifer.martinez@email.com',
                'phone': '555-2002',
                'age': 32,
                'gender': 'Female',
                'condition': 'Diabetes Type 2',
                'status': 'Active'
            },
            {
                'name': 'David Thompson',
                'email': 'david.thompson@email.com',
                'phone': '555-2003',
                'age': 58,
                'gender': 'Male',
                'condition': 'Arthritis',
                'status': 'Active'
            },
            {
                'name': 'Lisa Garcia',
                'email': 'lisa.garcia@email.com',
                'phone': '555-2004',
                'age': 28,
                'gender': 'Female',
                'condition': 'Migraine',
                'status': 'Active'
            },
            {
                'name': 'William Davis',
                'email': 'william.davis@email.com',
                'phone': '555-2005',
                'age': 67,
                'gender': 'Male',
                'condition': 'Heart Disease',
                'status': 'Active'
            },
            {
                'name': 'Emma Rodriguez',
                'email': 'emma.rodriguez@email.com',
                'phone': '555-2006',
                'age': 8,
                'gender': 'Female',
                'condition': 'Asthma',
                'status': 'Active'
            }
        ]
        
        self.stdout.write("\nCreating patients...")
        self.stdout.write("-" * 50)
        
        created_patients = []
        for patient_data in patients_data:
            email = patient_data['email']
            
            if Patient.objects.filter(email=email).exists():
                patient = Patient.objects.get(email=email)
                self.stdout.write(self.style.WARNING(f"ℹ️  Patient {email} already exists."))
                created_patients.append(patient)
                continue
            
            patient_data['assigned_doctor'] = choice(doctors)
            patient = Patient.objects.create(**patient_data)
            created_patients.append(patient)
            
            self.stdout.write(self.style.SUCCESS(
                f"✅ Created Patient: {patient.name} (Age: {patient.age}, Condition: {patient.condition})"
            ))
            self.stdout.write(f"   Assigned to: Dr. {patient.assigned_doctor.first_name} {patient.assigned_doctor.last_name}")
        
        return created_patients

    def create_appointments(self, patients, doctors):
        """Create sample appointments"""
        self.stdout.write("\nCreating appointments...")
        self.stdout.write("-" * 50)
        
        appointment_types = ['Consultation', 'Follow-up', 'Check-up', 'Emergency']
        statuses = ['Scheduled', 'Confirmed', 'Completed', 'Pending']
        
        created_appointments = []
        
        for i in range(12):
            patient = choice(patients)
            doctor = patient.assigned_doctor if patient.assigned_doctor else choice(doctors)
            
            days_ahead = randint(0, 7)
            appointment_date = datetime.now().date() + timedelta(days=days_ahead)
            
            hour = randint(9, 16)
            minute = choice([0, 15, 30, 45])
            appointment_time = f"{hour:02d}:{minute:02d}:00"
            
            appointment_data = {
                'patient': patient,
                'doctor': doctor,
                'date': appointment_date,
                'time': appointment_time,
                'type': choice(appointment_types),
                'status': choice(statuses),
                'notes': f'Regular {choice(appointment_types).lower()} appointment'
            }
            
            appointment = Appointment.objects.create(**appointment_data)
            created_appointments.append(appointment)
            
            self.stdout.write(self.style.SUCCESS(
                f"✅ Appointment: {patient.name} with Dr. {doctor.last_name} on {appointment_date} at {appointment_time}"
            ))
        
        return created_appointments

    def create_medical_records(self, patients, doctors):
        """Create sample medical records"""
        self.stdout.write("\nCreating medical records...")
        self.stdout.write("-" * 50)
        
        record_types = ['Diagnosis', 'Lab Report', 'Prescription', 'Imaging']
        
        descriptions = {
            'Diagnosis': [
                'Patient diagnosed with mild hypertension. Recommended lifestyle changes and medication.',
                'Acute bronchitis diagnosed. Prescribed antibiotics and rest.',
                'Type 2 Diabetes confirmed through blood tests. Starting insulin therapy.',
                'Seasonal allergies identified. Antihistamines prescribed.'
            ],
            'Lab Report': [
                'Blood test results: Cholesterol levels slightly elevated. HDL: 45, LDL: 140',
                'Complete Blood Count: All values within normal range.',
                'Glucose tolerance test: Fasting glucose 126 mg/dL, indicating prediabetes.',
                'Thyroid function test: TSH levels normal at 2.5 mIU/L'
            ],
            'Prescription': [
                'Lisinopril 10mg once daily for blood pressure management.',
                'Metformin 500mg twice daily with meals for diabetes control.',
                'Ibuprofen 400mg as needed for pain relief, maximum 3 times daily.',
                'Albuterol inhaler, 2 puffs every 4-6 hours as needed for asthma.'
            ],
            'Imaging': [
                'Chest X-ray: No abnormalities detected. Lungs clear.',
                'MRI Brain: No signs of structural abnormalities or lesions.',
                'Knee X-ray: Mild osteoarthritis in right knee joint.',
                'Echocardiogram: Normal heart function, ejection fraction 60%.'
            ]
        }
        
        created_records = []
        
        for i in range(15):
            patient = choice(patients)
            doctor = patient.assigned_doctor if patient.assigned_doctor else choice(doctors)
            record_type = choice(record_types)
            
            record_data = {
                'patient': patient,
                'doctor': doctor,
                'record_type': record_type,
                'description': choice(descriptions[record_type]),
                'status': choice(['Pending', 'Completed'])
            }
            
            record = MedicalRecord.objects.create(**record_data)
            created_records.append(record)
            
            self.stdout.write(self.style.SUCCESS(
                f"✅ Medical Record: {record_type} for {patient.name} by Dr. {doctor.last_name}"
            ))
        
        return created_records
