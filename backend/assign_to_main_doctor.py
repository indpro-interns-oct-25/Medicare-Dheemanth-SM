"""
Script to ensure the main doctor has patients and appointments assigned
"""
import os
import django
from datetime import datetime, timedelta
from random import choice

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from core.models import User, Patient, Appointment, MedicalRecord

def assign_to_main_doctor():
    # Get the main doctor account
    main_doctor = User.objects.filter(email='doctor@medicare.com').first()
    
    if not main_doctor:
        print("❌ Main doctor account (doctor@medicare.com) not found!")
        return
    
    print(f"✅ Found main doctor: {main_doctor.first_name} {main_doctor.last_name}")
    print("-" * 60)
    
    # Check current assignments
    assigned_patients = Patient.objects.filter(assigned_doctor=main_doctor)
    print(f"\n📊 Current Status:")
    print(f"   - Patients assigned: {assigned_patients.count()}")
    print(f"   - Appointments: {Appointment.objects.filter(doctor=main_doctor).count()}")
    print(f"   - Medical Records: {MedicalRecord.objects.filter(doctor=main_doctor).count()}")
    
    # If fewer than 3 patients, assign more
    if assigned_patients.count() < 3:
        print("\n🔄 Assigning more patients to main doctor...")
        
        # Get patients not assigned to main doctor
        unassigned = Patient.objects.exclude(assigned_doctor=main_doctor)[:3]
        
        for patient in unassigned:
            old_doctor = patient.assigned_doctor
            patient.assigned_doctor = main_doctor
            patient.save()
            
            print(f"   ✅ Assigned {patient.name} to Dr. {main_doctor.last_name}")
            
            # Update their appointments
            appointments = Appointment.objects.filter(patient=patient)
            for apt in appointments:
                apt.doctor = main_doctor
                apt.save()
            
            # Update their medical records
            records = MedicalRecord.objects.filter(patient=patient)
            for record in records:
                record.doctor = main_doctor
                record.save()
    
    # Create additional appointments if needed
    current_appointments = Appointment.objects.filter(doctor=main_doctor).count()
    if current_appointments < 5:
        print(f"\n📅 Creating additional appointments...")
        
        patients_list = list(Patient.objects.filter(assigned_doctor=main_doctor))
        if not patients_list:
            print("   ⚠️ No patients assigned to create appointments")
        else:
            appointment_types = ['Consultation', 'Follow-up', 'Check-up']
            statuses = ['Scheduled', 'Confirmed', 'Pending']
            
            for i in range(5 - current_appointments):
                patient = choice(patients_list)
                days_ahead = i
                apt_date = datetime.now().date() + timedelta(days=days_ahead)
                apt_time = f"{9 + i}:00:00"
                
                appointment = Appointment.objects.create(
                    patient=patient,
                    doctor=main_doctor,
                    date=apt_date,
                    time=apt_time,
                    type=choice(appointment_types),
                    status=choice(statuses),
                    notes=f'Regular appointment with {patient.name}'
                )
                
                print(f"   ✅ Created appointment: {patient.name} on {apt_date} at {apt_time}")
    
    # Final status
    print("\n" + "=" * 60)
    print("✅ ASSIGNMENT COMPLETE!")
    print("=" * 60)
    
    assigned_patients = Patient.objects.filter(assigned_doctor=main_doctor)
    print(f"\n📊 Final Status for Dr. {main_doctor.first_name} {main_doctor.last_name}:")
    print(f"   - Patients: {assigned_patients.count()}")
    print(f"   - Appointments: {Appointment.objects.filter(doctor=main_doctor).count()}")
    print(f"   - Medical Records: {MedicalRecord.objects.filter(doctor=main_doctor).count()}")
    
    print("\n📋 Assigned Patients:")
    for patient in assigned_patients:
        print(f"   • {patient.name} ({patient.age}y, {patient.gender}) - {patient.condition}")
    
    print("\n📅 Upcoming Appointments:")
    upcoming = Appointment.objects.filter(doctor=main_doctor).order_by('date', 'time')[:5]
    for apt in upcoming:
        print(f"   • {apt.date} at {apt.time} - {apt.patient.name} ({apt.type}, {apt.status})")

if __name__ == '__main__':
    assign_to_main_doctor()
