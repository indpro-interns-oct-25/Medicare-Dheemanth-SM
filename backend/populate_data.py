"""
Script to populate the database with sample doctors, patients, appointments, and medical records
Run this with: python populate_data.py
"""
import os
import django
from datetime import datetime, timedelta
from random import choice, randint

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from core.models import User, Patient, Appointment, MedicalRecord

def create_doctors():
    """Create sample doctors"""
    # Include the main doctor account if it exists
    all_doctors = []
    main_doctor = User.objects.filter(email='doctor@medicare.com').first()
    if main_doctor:
        all_doctors.append(main_doctor)
        print(f"ℹ️  Including existing main doctor: {main_doctor.email}")
    
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
    
    print("Creating doctors...")
    print("-" * 50)
    
    created_doctors = all_doctors.copy()
    for doctor_data in doctors_data:
        email = doctor_data['email']
        
        # Check if doctor already exists
        if User.objects.filter(email=email).exists():
            doctor = User.objects.get(email=email)
            print(f"ℹ️  Doctor {email} already exists.")
            created_doctors.append(doctor)
            continue
        
        # Create doctor
        password = doctor_data.pop('password')
        doctor = User.objects.create_user(**doctor_data)
        doctor.set_password(password)
        doctor.save()
        created_doctors.append(doctor)
        
        print(f"✅ Created Doctor: Dr. {doctor.first_name} {doctor.last_name} ({doctor.department})")
    
    return created_doctors

def create_patients(doctors):
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
    
    print("\nCreating patients...")
    print("-" * 50)
    
    created_patients = []
    for patient_data in patients_data:
        email = patient_data['email']
        
        # Check if patient already exists
        if Patient.objects.filter(email=email).exists():
            patient = Patient.objects.get(email=email)
            print(f"ℹ️  Patient {email} already exists.")
            created_patients.append(patient)
            continue
        
        # Assign a random doctor
        patient_data['assigned_doctor'] = choice(doctors)
        
        # Create patient
        patient = Patient.objects.create(**patient_data)
        created_patients.append(patient)
        
        print(f"✅ Created Patient: {patient.name} (Age: {patient.age}, Condition: {patient.condition})")
        print(f"   Assigned to: Dr. {patient.assigned_doctor.first_name} {patient.assigned_doctor.last_name}")
    
    return created_patients

def create_appointments(patients, doctors):
    """Create sample appointments"""
    print("\nCreating appointments...")
    print("-" * 50)
    
    appointment_types = ['Consultation', 'Follow-up', 'Check-up', 'Emergency']
    statuses = ['Scheduled', 'Confirmed', 'Completed', 'Pending']
    
    created_appointments = []
    
    # Create appointments for the next 7 days
    for i in range(12):
        patient = choice(patients)
        doctor = patient.assigned_doctor if patient.assigned_doctor else choice(doctors)
        
        # Random date within next 7 days
        days_ahead = randint(0, 7)
        appointment_date = datetime.now().date() + timedelta(days=days_ahead)
        
        # Random time between 9 AM and 5 PM
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
        
        print(f"✅ Appointment: {patient.name} with Dr. {doctor.last_name} on {appointment_date} at {appointment_time}")
    
    return created_appointments

def create_medical_records(patients, doctors):
    """Create sample medical records"""
    print("\nCreating medical records...")
    print("-" * 50)
    
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
        
        print(f"✅ Medical Record: {record_type} for {patient.name} by Dr. {doctor.last_name}")
    
    return created_records

def main():
    """Main function to populate all data"""
    print("=" * 50)
    print("POPULATING DATABASE WITH SAMPLE DATA")
    print("=" * 50)
    
    # Create doctors
    doctors = create_doctors()
    
    # Create patients
    patients = create_patients(doctors)
    
    # Create appointments
    appointments = create_appointments(patients, doctors)
    
    # Create medical records
    medical_records = create_medical_records(patients, doctors)
    
    print("\n" + "=" * 50)
    print("✅ DATABASE POPULATION COMPLETE!")
    print("=" * 50)
    print(f"\nSummary:")
    print(f"  - Doctors: {len(doctors)}")
    print(f"  - Patients: {len(patients)}")
    print(f"  - Appointments: {len(appointments)}")
    print(f"  - Medical Records: {len(medical_records)}")
    print("\nYou can now view this data in your application!")

if __name__ == '__main__':
    main()
