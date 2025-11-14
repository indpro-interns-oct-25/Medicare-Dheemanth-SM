from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone

class User(AbstractUser):
    ROLE_CHOICES = [
        ('admin', 'Admin'),
        ('doctor', 'Doctor'),
        ('receptionist', 'Receptionist'),
        ('patient', 'Patient'),
    ]
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='patient')
    phone = models.CharField(max_length=20, blank=True, null=True)
    department = models.CharField(max_length=100, blank=True, null=True)
    is_verified = models.BooleanField(default=True)  # For patient verification by admin
    
    def __str__(self):
        return f"{self.username} ({self.role})"

class Patient(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, null=True, blank=True, related_name='patient_profile')
    name = models.CharField(max_length=120)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=20)
    age = models.IntegerField(null=True, blank=True)
    gender = models.CharField(max_length=10, choices=[('Male', 'Male'), ('Female', 'Female'), ('Other', 'Other')], default='Male')
    condition = models.CharField(max_length=200, blank=True, null=True)
    assigned_doctor = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='patients', limit_choices_to={'role': 'doctor'})
    status = models.CharField(max_length=20, choices=[('Active', 'Active'), ('Inactive', 'Inactive')], default='Active')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class Appointment(models.Model):
    STATUS_CHOICES = [
        ('Scheduled', 'Scheduled'),
        ('Confirmed', 'Confirmed'),
        ('Completed', 'Completed'),
        ('Cancelled', 'Cancelled'),
        ('Pending', 'Pending'),
    ]
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='appointments')
    doctor = models.ForeignKey(User, on_delete=models.CASCADE, related_name='doctor_appointments', limit_choices_to={'role': 'doctor'})
    date = models.DateField()
    time = models.TimeField()
    type = models.CharField(max_length=50, default='Consultation')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Scheduled')
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-date', '-time']

    def __str__(self):
        return f"{self.patient.name} with {self.doctor.get_full_name()} on {self.date} at {self.time}"

class MedicalRecord(models.Model):
    RECORD_TYPE_CHOICES = [
        ('Diagnosis', 'Diagnosis'),
        ('Lab Report', 'Lab Report'),
        ('Prescription', 'Prescription'),
        ('Imaging', 'Imaging'),
    ]
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='medical_records')
    doctor = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_records')
    record_type = models.CharField(max_length=50, choices=RECORD_TYPE_CHOICES)
    description = models.TextField()
    status = models.CharField(max_length=20, choices=[('Pending', 'Pending'), ('Completed', 'Completed')], default='Pending')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.record_type} for {self.patient.name}"

class Notification(models.Model):
    NOTIFICATION_TYPES = [
        ('patient_registration', 'Patient Registration'),
        ('appointment', 'Appointment'),
        ('general', 'General'),
    ]
    notification_type = models.CharField(max_length=50, choices=NOTIFICATION_TYPES)
    title = models.CharField(max_length=200)
    message = models.TextField()
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True, related_name='notifications_about')
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.notification_type} - {self.title}"
