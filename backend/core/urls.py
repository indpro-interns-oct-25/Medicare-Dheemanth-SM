from django.urls import path
from . import views

urlpatterns = [
    path('auth/login/', views.login_view, name='login'),
    path('auth/logout/', views.logout_view, name='logout'),
    path('auth/profile/', views.profile_view, name='profile'),
    path('auth/register/', views.patient_register, name='patient-register'),
    path('patients/', views.patient_list, name='patient-list'),
    path('patients/<int:pk>/', views.patient_detail, name='patient-detail'),
    path('appointments/', views.appointment_list, name='appointment-list'),
    path('appointments/<int:pk>/', views.appointment_detail, name='appointment-detail'),
    path('doctors/', views.doctor_list, name='doctor-list'),
    path('medical-records/', views.medical_record_list, name='medical-record-list'),
    path('medical-records/<int:pk>/', views.medical_record_detail, name='medical-record-detail'),
    # Doctor-specific endpoints
    path('doctor/patients/', views.doctor_patients, name='doctor-patients'),
    path('doctor/patients/<int:pk>/', views.doctor_patient_detail, name='doctor-patient-detail'),
    path('doctor/appointments/', views.doctor_appointments, name='doctor-appointments'),
    path('doctor/stats/', views.doctor_stats, name='doctor-stats'),
    # Patient-specific endpoints
    path('patient/dashboard/', views.patient_dashboard, name='patient-dashboard'),
    # Admin notification endpoints
    path('notifications/', views.notifications_list, name='notifications-list'),
    path('verify-patient/<int:pk>/', views.verify_patient, name='verify-patient'),
]
