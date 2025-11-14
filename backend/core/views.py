from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.conf import settings
from .models import User, Patient, Appointment, MedicalRecord, Notification

@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    """Login with email or username"""
    username = request.data.get('username') or request.data.get('email')
    password = request.data.get('password')
    
    if not username or not password:
        return Response({
            'success': False,
            'message': 'Username and password required'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Try with email if it contains @
    if '@' in str(username):
        try:
            user_obj = User.objects.get(email=username)
            user = authenticate(username=user_obj.username, password=password)
        except User.DoesNotExist:
            user = None
    else:
        user = authenticate(username=username, password=password)
    
    if not user:
        return Response({
            'success': False,
            'message': 'Invalid credentials'
        }, status=status.HTTP_401_UNAUTHORIZED)
    
    # Check if patient is verified
    if user.role == 'patient' and not user.is_verified:
        return Response({
            'success': False,
            'message': 'Your account is pending verification by an administrator. Please wait for approval.'
        }, status=status.HTTP_403_FORBIDDEN)
    
    # Generate JWT tokens
    refresh = RefreshToken.for_user(user)
    
    return Response({
        'success': True,
        'data': {
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'role': user.role,
                'is_verified': user.is_verified
            }
        }
    })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    try:
        refresh_token = request.data.get('refresh')
        if refresh_token:
            token = RefreshToken(refresh_token)
            token.blacklist()
        return Response({'success': True, 'message': 'Logged out'})
    except Exception as e:
        return Response({'success': False, 'message': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def profile_view(request):
    """Get current user profile"""
    user = request.user
    return Response({
        'success': True,
        'data': {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'role': user.role,
            'phone': user.phone,
            'department': user.department
        }
    })

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def patient_list(request):
    if request.method == 'GET':
        patients = Patient.objects.all()
        data = [{
            'id': p.id,
            'patient_id': f"P{p.id:03d}",
            'name': p.name,
            'email': p.email,
            'phone': p.phone,
            'contact': p.phone,  # Add contact field for frontend compatibility
            'age': p.age,
            'gender': p.gender,
            'condition': p.condition,
            'assigned_doctor': p.assigned_doctor.get_full_name() if p.assigned_doctor else 'N/A',
            'status': p.status,
            'created_at': p.created_at
        } for p in patients]
        return Response({'success': True, 'data': data})
    
    if request.method == 'POST':
        try:
            patient = Patient.objects.create(
                name=request.data.get('name'),
                email=request.data.get('email'),
                phone=request.data.get('phone'),
                age=request.data.get('age'),
                gender=request.data.get('gender', 'Male'),
                condition=request.data.get('condition'),
                status='Active'
            )
            return Response({'success': True, 'message': 'Patient created'})
        except Exception as e:
            return Response({'success': False, 'message': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def patient_detail(request, pk):
    try:
        patient = Patient.objects.get(id=pk)
    except Patient.DoesNotExist:
        return Response({'success': False, 'message': 'Not found'}, status=status.HTTP_404_NOT_FOUND)
    
    if request.method == 'GET':
        return Response({
            'success': True,
            'data': {
                'id': patient.id,
                'patient_id': f"P{patient.id:03d}",
                'name': patient.name,
                'email': patient.email,
                'phone': patient.phone,
                'contact': patient.phone,  # Add contact field for frontend compatibility
                'age': patient.age,
                'gender': patient.gender,
                'condition': patient.condition,
                'assigned_doctor': patient.assigned_doctor.get_full_name() if patient.assigned_doctor else 'N/A',
                'status': patient.status
            }
        })
    
    if request.method == 'PUT':
        patient.name = request.data.get('name', patient.name)
        patient.email = request.data.get('email', patient.email)
        patient.phone = request.data.get('phone', patient.phone)
        patient.age = request.data.get('age', patient.age)
        patient.gender = request.data.get('gender', patient.gender)
        patient.condition = request.data.get('condition', patient.condition)
        patient.status = request.data.get('status', patient.status)
        patient.save()
        return Response({'success': True, 'message': 'Updated'})
    
    if request.method == 'DELETE':
        patient.delete()
        return Response({'success': True, 'message': 'Deleted'})

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def doctor_list(request):
    if request.method == 'GET':
        doctors = User.objects.filter(role='doctor')
        data = [{
            'id': d.id,
            'first_name': d.first_name or d.username.split()[0] if d.username else 'Doctor',
            'last_name': d.last_name or (d.username.split()[1] if len(d.username.split()) > 1 else ''),
            'email': d.email,
            'phone': d.phone or 'N/A',
            'department': d.department or 'General',
            'is_active': d.is_active
        } for d in doctors]
        return Response({'success': True, 'data': data})
    
    if request.method == 'POST':
        try:
            # Create a new doctor (user with role='doctor')
            doctor = User.objects.create_user(
                username=request.data.get('email').split('@')[0],
                email=request.data.get('email'),
                first_name=request.data.get('first_name'),
                last_name=request.data.get('last_name'),
                phone=request.data.get('phone'),
                department=request.data.get('department'),
                role='doctor',
                password='doctor123'  # Default password
            )
            return Response({'success': True, 'message': 'Doctor created'})
        except Exception as e:
            return Response({'success': False, 'message': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def appointment_list(request):
    if request.method == 'GET':
        appointments = Appointment.objects.all()
        data = [{
            'id': a.id,
            'patient_name': a.patient.name,
            'doctor_name': a.doctor.get_full_name() or a.doctor.username,
            'date': a.date,
            'time': a.time,
            'type': a.type,
            'status': a.status
        } for a in appointments]
        return Response({'success': True, 'data': data})
    
    if request.method == 'POST':
        try:
            appointment = Appointment.objects.create(
                patient_id=request.data.get('patient_id'),
                doctor_id=request.data.get('doctor_id'),
                date=request.data.get('date'),
                time=request.data.get('time'),
                type=request.data.get('type', 'Consultation'),
                status='Scheduled'
            )
            return Response({'success': True, 'message': 'Appointment created'})
        except Exception as e:
            return Response({'success': False, 'message': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def appointment_detail(request, pk):
    try:
        appointment = Appointment.objects.get(id=pk)
    except Appointment.DoesNotExist:
        return Response({'success': False, 'message': 'Not found'}, status=status.HTTP_404_NOT_FOUND)
    
    if request.method == 'GET':
        return Response({
            'success': True,
            'data': {
                'id': appointment.id,
                'patient_name': appointment.patient.name,
                'doctor_name': appointment.doctor.get_full_name() or appointment.doctor.username,
                'date': appointment.date,
                'time': appointment.time,
                'type': appointment.type,
                'status': appointment.status
            }
        })
    
    if request.method == 'PUT':
        appointment.status = request.data.get('status', appointment.status)
        appointment.save()
        return Response({'success': True, 'message': 'Updated'})
    
    if request.method == 'DELETE':
        appointment.delete()
        return Response({'success': True, 'message': 'Deleted'})

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def medical_record_list(request):
    if request.method == 'GET':
        records = MedicalRecord.objects.select_related('patient', 'doctor').distinct()
        data = [{
            'id': r.id,
            'patient_id': r.patient.id,
            'patient_name': r.patient.name,
            'doctor_name': r.doctor.get_full_name() or r.doctor.username,
            'record_type': r.record_type,
            'description': r.description,
            'status': r.status,
            'created_at': r.created_at.isoformat()
        } for r in records]
        return Response({'success': True, 'data': data})
    
    if request.method == 'POST':
        try:
            record = MedicalRecord.objects.create(
                patient_id=request.data.get('patient_id'),
                doctor=request.user,
                record_type=request.data.get('record_type'),
                description=request.data.get('description'),
                status='Pending'
            )
            return Response({'success': True, 'message': 'Record created'})
        except Exception as e:
            return Response({'success': False, 'message': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def medical_record_detail(request, pk):
    try:
        record = MedicalRecord.objects.get(id=pk)
    except MedicalRecord.DoesNotExist:
        return Response({'success': False, 'message': 'Not found'}, status=status.HTTP_404_NOT_FOUND)
    
    if request.method == 'GET':
        return Response({
            'success': True,
            'data': {
                'id': record.id,
                'patient_name': record.patient.name,
                'doctor_name': record.doctor.get_full_name() or record.doctor.username,
                'record_type': record.record_type,
                'description': record.description,
                'status': record.status
            }
        })
    
    if request.method == 'PUT':
        record.status = request.data.get('status', record.status)
        record.description = request.data.get('description', record.description)
        record.save()
        return Response({'success': True, 'message': 'Updated'})
    
    if request.method == 'DELETE':
        record.delete()
        return Response({'success': True, 'message': 'Deleted'})

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def doctor_patients(request):
    """Get all patients assigned to the logged-in doctor"""
    if request.user.role != 'doctor':
        return Response({'success': False, 'message': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)
    
    patients = Patient.objects.filter(assigned_doctor=request.user)
    data = [{
        'id': p.id,
        'patient_id': f"P{p.id:03d}",
        'name': p.name,
        'email': p.email,
        'phone': p.phone,
        'contact': p.phone,
        'age': p.age,
        'gender': p.gender,
        'condition': p.condition,
        'status': p.status,
        'created_at': p.created_at
    } for p in patients]
    return Response({'success': True, 'data': data})

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def doctor_appointments(request):
    """Get all appointments for the logged-in doctor"""
    if request.user.role != 'doctor':
        return Response({'success': False, 'message': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)
    
    appointments = Appointment.objects.filter(doctor=request.user)
    data = [{
        'id': a.id,
        'patient_name': a.patient.name,
        'patient_id': a.patient.id,
        'date': a.date,
        'time': a.time,
        'type': a.type,
        'status': a.status,
        'notes': a.notes
    } for a in appointments]
    return Response({'success': True, 'data': data})

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def doctor_stats(request):
    """Get statistics for the logged-in doctor"""
    if request.user.role != 'doctor':
        return Response({'success': False, 'message': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)
    
    from datetime import date
    today = date.today()
    
    total_patients = Patient.objects.filter(assigned_doctor=request.user).count()
    total_appointments = Appointment.objects.filter(doctor=request.user).count()
    todays_appointments = Appointment.objects.filter(doctor=request.user, date=today).count()
    pending_appointments = Appointment.objects.filter(doctor=request.user, status='Pending').count()
    
    return Response({
        'success': True,
        'data': {
            'totalPatients': total_patients,
            'totalAppointments': total_appointments,
            'todaysAppointments': todays_appointments,
            'pendingAppointments': pending_appointments
        }
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def doctor_patient_detail(request, pk):
    """Get detailed patient information including medical records for doctors"""
    if request.user.role != 'doctor':
        return Response({'success': False, 'message': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        # Only allow doctor to view their assigned patients
        patient = Patient.objects.get(id=pk, assigned_doctor=request.user)
    except Patient.DoesNotExist:
        return Response({'success': False, 'message': 'Patient not found or not assigned to you'}, status=status.HTTP_404_NOT_FOUND)
    
    # Get patient's medical records
    medical_records = MedicalRecord.objects.filter(patient=patient)
    records_data = [{
        'id': r.id,
        'record_type': r.record_type,
        'description': r.description,
        'status': r.status,
        'doctor_name': r.doctor.get_full_name() or r.doctor.username,
        'created_at': r.created_at
    } for r in medical_records]
    
    # Get patient's appointments
    appointments = Appointment.objects.filter(patient=patient)
    appointments_data = [{
        'id': a.id,
        'date': a.date,
        'time': a.time,
        'type': a.type,
        'status': a.status,
        'notes': a.notes,
        'doctor_name': a.doctor.get_full_name() or a.doctor.username
    } for a in appointments]
    
    return Response({
        'success': True,
        'data': {
            'id': patient.id,
            'patient_id': f"P{patient.id:03d}",
            'name': patient.name,
            'email': patient.email,
            'phone': patient.phone,
            'age': patient.age,
            'gender': patient.gender,
            'condition': patient.condition,
            'status': patient.status,
            'created_at': patient.created_at,
            'medical_records': records_data,
            'appointments': appointments_data
        }
    })

@api_view(['POST'])
@permission_classes([AllowAny])
def patient_register(request):
    """Register a new patient account - requires admin verification"""
    try:
        email = request.data.get('email')
        password = request.data.get('password')
        first_name = request.data.get('first_name')
        last_name = request.data.get('last_name')
        phone = request.data.get('phone', '')
        
        # Validate required fields
        if not email or not password or not first_name or not last_name:
            return Response({
                'success': False,
                'message': 'Email, password, first name, and last name are required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Check if user already exists
        if User.objects.filter(email=email).exists():
            return Response({
                'success': False,
                'message': 'An account with this email already exists'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Create unverified patient user
        username = email.split('@')[0] + '_' + str(User.objects.count() + 1)
        user = User.objects.create_user(
            username=username,
            email=email,
            first_name=first_name,
            last_name=last_name,
            phone=phone,
            role='patient',
            is_verified=False  # Requires admin verification
        )
        user.set_password(password)
        user.save()
        
        # Create notification for admin
        Notification.objects.create(
            notification_type='patient_registration',
            title='New Patient Registration',
            message=f'{first_name} {last_name} ({email}) has registered and is awaiting verification.',
            user=user
        )
        
        return Response({
            'success': True,
            'message': 'Registration successful! Your account is pending admin verification. You will be able to login once approved.'
        })
        
    except Exception as e:
        return Response({
            'success': False,
            'message': str(e)
        }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def notifications_list(request):
    """Get all notifications (for admin)"""
    if request.user.role != 'admin':
        return Response({
            'success': False,
            'message': 'Not authorized'
        }, status=status.HTTP_403_FORBIDDEN)
    
    notifications = Notification.objects.all()
    data = [{
        'id': n.id,
        'notification_type': n.notification_type,
        'title': n.title,
        'message': n.message,
        'user_id': n.user.id if n.user else None,
        'user_name': n.user.get_full_name() if n.user else None,
        'user_email': n.user.email if n.user else None,
        'is_read': n.is_read,
        'created_at': n.created_at
    } for n in notifications]
    
    return Response({'success': True, 'data': data})

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def verify_patient(request, pk):
    """Admin verifies a patient registration"""
    if request.user.role != 'admin':
        return Response({
            'success': False,
            'message': 'Not authorized'
        }, status=status.HTTP_403_FORBIDDEN)
    
    try:
        user = User.objects.get(id=pk, role='patient')
        action = request.data.get('action')  # 'approve' or 'reject'
        
        if action == 'approve':
            user.is_verified = True
            user.save()
            
            # Create Patient profile if it doesn't exist
            if not Patient.objects.filter(user=user).exists():
                Patient.objects.create(
                    user=user,
                    name=user.get_full_name(),
                    email=user.email,
                    phone=user.phone or '',
                    age=0,  # Admin can update this later
                    gender='Not Specified',
                    condition='New Patient',
                    assigned_doctor=None
                )
            
            # Mark related notification as read
            Notification.objects.filter(user=user, notification_type='patient_registration').update(is_read=True)
            
            # Send approval email to patient
            try:
                login_url = f"{settings.FRONTEND_URL}/login"
                context = {
                    'patient_name': user.get_full_name() or user.username,
                    'patient_email': user.email,
                    'username': user.username,
                    'login_url': login_url,
                }
                
                html_message = render_to_string('emails/patient_approval.html', context)
                plain_message = strip_tags(html_message)
                
                send_mail(
                    subject='Your Medicare Hospital Account Has Been Approved!',
                    message=plain_message,
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[user.email],
                    html_message=html_message,
                    fail_silently=False,
                )
            except Exception as e:
                # Log the error but don't fail the approval process
                print(f"Error sending approval email: {str(e)}")
            
            return Response({
                'success': True,
                'message': f'Patient {user.get_full_name()} has been verified and can now login. Approval email sent.'
            })
        
        elif action == 'reject':
            # Mark notification as read and optionally delete user
            Notification.objects.filter(user=user, notification_type='patient_registration').update(is_read=True)
            user.delete()
            
            return Response({
                'success': True,
                'message': 'Patient registration has been rejected'
            })
        
        else:
            return Response({
                'success': False,
                'message': 'Invalid action. Use "approve" or "reject"'
            }, status=status.HTTP_400_BAD_REQUEST)
            
    except User.DoesNotExist:
        return Response({
            'success': False,
            'message': 'Patient not found'
        }, status=status.HTTP_404_NOT_FOUND)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def patient_dashboard(request):
    """Get patient dashboard data including appointments and medical records"""
    if request.user.role != 'patient':
        return Response({
            'success': False,
            'message': 'Not authorized'
        }, status=status.HTTP_403_FORBIDDEN)
    
    try:
        # Get patient profile
        patient = Patient.objects.get(user=request.user)
        
        # Get appointments
        appointments = Appointment.objects.filter(patient=patient)
        appointments_data = [{
            'id': a.id,
            'doctor_name': a.doctor.get_full_name() or a.doctor.username,
            'date': a.date,
            'time': a.time,
            'type': a.type,
            'status': a.status,
            'notes': a.notes
        } for a in appointments]
        
        # Get medical records
        medical_records = MedicalRecord.objects.filter(patient=patient)
        records_data = [{
            'id': r.id,
            'doctor_name': r.doctor.get_full_name() or r.doctor.username,
            'record_type': r.record_type,
            'description': r.description,
            'status': r.status,
            'created_at': r.created_at
        } for r in medical_records]
        
        return Response({
            'success': True,
            'data': {
                'patient': {
                    'id': patient.id,
                    'patient_id': f"P{patient.id:03d}",
                    'name': patient.name,
                    'email': patient.email,
                    'phone': patient.phone,
                    'age': patient.age,
                    'gender': patient.gender,
                    'condition': patient.condition,
                    'assigned_doctor': patient.assigned_doctor.get_full_name() if patient.assigned_doctor else 'Not Assigned'
                },
                'appointments': appointments_data,
                'medical_records': records_data
            }
        })
        
    except Patient.DoesNotExist:
        # Patient user exists but no patient profile yet
        return Response({
            'success': True,
            'data': {
                'patient': {
                    'name': request.user.get_full_name(),
                    'email': request.user.email,
                    'phone': request.user.phone or ''
                },
                'appointments': [],
                'medical_records': [],
                'message': 'Your profile is being set up by the administrator.'
            }
        })
