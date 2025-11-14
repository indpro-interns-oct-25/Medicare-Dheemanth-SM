from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import User, Patient, Appointment, MedicalRecord
from datetime import date

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'role', 'phone', 'department']

class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        email = data.get('email')
        password = data.get('password')
        
        try:
            user = User.objects.get(email=email)
            user = authenticate(username=user.username, password=password)
            if user is None:
                raise serializers.ValidationError("Invalid credentials")
        except User.DoesNotExist:
            raise serializers.ValidationError("Invalid credentials")
        
        data['user'] = user
        return data

class PatientSerializer(serializers.ModelSerializer):
    assigned_doctor_name = serializers.SerializerMethodField()
    
    class Meta:
        model = Patient
        fields = ['id', 'name', 'email', 'phone', 'age', 'gender', 'condition', 'assigned_doctor', 'assigned_doctor_name', 'status', 'created_at']
    
    def get_assigned_doctor_name(self, obj):
        if obj.assigned_doctor:
            return f"Dr. {obj.assigned_doctor.first_name} {obj.assigned_doctor.last_name}"
        return None

class AppointmentSerializer(serializers.ModelSerializer):
    patient_name = serializers.CharField(source='patient.name', read_only=True)
    patient_email = serializers.CharField(source='patient.email', read_only=True)
    doctor_name = serializers.SerializerMethodField()
    
    class Meta:
        model = Appointment
        fields = ['id', 'patient', 'patient_name', 'patient_email', 'doctor', 'doctor_name', 'date', 'time', 'type', 'status', 'notes', 'created_at']
    
    def get_doctor_name(self, obj):
        return f"Dr. {obj.doctor.first_name} {obj.doctor.last_name}"

class MedicalRecordSerializer(serializers.ModelSerializer):
    patient_name = serializers.CharField(source='patient.name', read_only=True)
    doctor_name = serializers.SerializerMethodField()
    
    class Meta:
        model = MedicalRecord
        fields = ['id', 'patient', 'patient_name', 'doctor', 'doctor_name', 'record_type', 'description', 'status', 'created_at']
    
    def get_doctor_name(self, obj):
        return f"Dr. {obj.doctor.first_name} {obj.doctor.last_name}"

class DashboardStatsSerializer(serializers.Serializer):
    total_patients = serializers.IntegerField()
    total_doctors = serializers.IntegerField()
    todays_appointments = serializers.IntegerField()
    pending_records = serializers.IntegerField()
    total_appointments = serializers.IntegerField()
    patients_growth = serializers.CharField()
