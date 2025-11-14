import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from core.models import User, Patient, Appointment

def fix_robert_anderson():
    """Fix Robert Anderson's patient profile and appointments"""
    
    print("=" * 60)
    print("FIXING ROBERT ANDERSON'S DASHBOARD")
    print("=" * 60)
    
    # Find Robert Anderson user
    try:
        robert_user = User.objects.get(email='robertanderson@email.com')
        print(f"\n✅ Found user: {robert_user.username} ({robert_user.email})")
        print(f"   Role: {robert_user.role}")
        print(f"   Verified: {robert_user.is_verified}")
        print(f"   Name: {robert_user.first_name} {robert_user.last_name}")
    except User.DoesNotExist:
        print("\n❌ User with email 'robertanderson@email.com' not found!")
        print("   Trying to find by name...")
        
        try:
            robert_user = User.objects.filter(
                first_name__icontains='Robert',
                last_name__icontains='Anderson'
            ).first()
            
            if robert_user:
                print(f"\n✅ Found user: {robert_user.username} ({robert_user.email})")
            else:
                print("\n❌ No user found with name 'Robert Anderson'")
                print("\nAll users in database:")
                for user in User.objects.all():
                    print(f"   - {user.username} | {user.first_name} {user.last_name} | {user.email} | Role: {user.role}")
                return
        except Exception as e:
            print(f"\n❌ Error: {e}")
            return
    
    # Check if patient profile exists
    print("\n" + "-" * 60)
    print("CHECKING PATIENT PROFILE")
    print("-" * 60)
    
    try:
        patient = Patient.objects.get(user=robert_user)
        print(f"\n✅ Patient profile found!")
        print(f"   Patient ID: {patient.id}")
        print(f"   Name: {patient.name}")
        print(f"   Email: {patient.email}")
        print(f"   Phone: {patient.phone}")
        print(f"   Assigned Doctor: {patient.assigned_doctor}")
    except Patient.DoesNotExist:
        print("\n⚠️  Patient profile NOT found for this user!")
        print("   Searching for patient by email...")
        
        patient = Patient.objects.filter(email=robert_user.email).first()
        
        if patient:
            print(f"\n✅ Found patient record with matching email!")
            print(f"   Patient ID: {patient.id}")
            print(f"   Name: {patient.name}")
            print(f"   Current User Link: {patient.user}")
            
            if not patient.user:
                print("\n🔧 Linking patient profile to user...")
                patient.user = robert_user
                patient.save()
                print("   ✅ Patient profile linked successfully!")
            else:
                print(f"\n⚠️  Patient already linked to different user: {patient.user.username}")
                print("   Creating a new link...")
                patient.user = robert_user
                patient.save()
                print("   ✅ Patient profile re-linked successfully!")
        else:
            print("\n⚠️  No patient record found with this email!")
            print("   Looking for any 'Robert Anderson' patient...")
            
            patient = Patient.objects.filter(name__icontains='Robert Anderson').first()
            
            if patient:
                print(f"\n✅ Found patient: {patient.name} ({patient.email})")
                print(f"   Current User Link: {patient.user}")
                print("\n🔧 Linking this patient to Robert Anderson user...")
                patient.user = robert_user
                patient.email = robert_user.email
                patient.save()
                print("   ✅ Patient profile linked and updated!")
            else:
                print("\n❌ No patient record found for Robert Anderson at all!")
                print("\nAll patients in database:")
                for p in Patient.objects.all():
                    print(f"   - {p.name} | {p.email} | User: {p.user}")
                return
    
    # Check appointments
    print("\n" + "-" * 60)
    print("CHECKING APPOINTMENTS")
    print("-" * 60)
    
    appointments = Appointment.objects.filter(patient=patient)
    print(f"\n✅ Found {appointments.count()} appointment(s) for this patient:")
    
    for apt in appointments:
        print(f"\n   Appointment #{apt.id}:")
        print(f"   - Doctor: {apt.doctor.get_full_name()}")
        print(f"   - Date: {apt.date}")
        print(f"   - Time: {apt.time}")
        print(f"   - Type: {apt.type}")
        print(f"   - Status: {apt.status}")
    
    if appointments.count() == 0:
        print("\n⚠️  No appointments found!")
        print("   Searching for appointments by patient name...")
        
        all_appointments = Appointment.objects.all()
        print(f"\nAll appointments in database ({all_appointments.count()}):")
        for apt in all_appointments:
            print(f"   - Patient: {apt.patient.name} | Doctor: {apt.doctor.get_full_name()} | Date: {apt.date}")
    
    # Final summary
    print("\n" + "=" * 60)
    print("SUMMARY")
    print("=" * 60)
    print(f"\nUser Account: ✅ {robert_user.username}")
    print(f"Patient Profile: {'✅' if patient else '❌'}")
    print(f"Profile Linked: {'✅' if patient and patient.user == robert_user else '❌'}")
    print(f"Appointments: {appointments.count()}")
    
    if patient and patient.user == robert_user and appointments.count() > 0:
        print("\n✅ ALL FIXED! Robert Anderson should now see his dashboard data!")
    else:
        print("\n⚠️  Some issues remain. Please check the details above.")
    
    print("\n" + "=" * 60)

if __name__ == '__main__':
    fix_robert_anderson()
