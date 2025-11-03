from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Count
from .models import User, UserRole, KYCVerification
from django.conf import settings
from services.models import Service
from bookings.models import Booking
from django.db import models
from django.contrib.auth import authenticate
from django.utils import timezone
from .serializers import KYCVerificationSerializer, UserSerializer
import jwt
from datetime import datetime, timedelta

@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    """Login with email/password and return JWT token"""
    email = request.data.get("email")
    password = request.data.get("password")

    if not email or not password:
        return Response({"error": "Email and password required"}, status=status.HTTP_400_BAD_REQUEST)

    # Use Django's authenticate with email (need to authenticate using username field)
    try:
        user = User.objects.get(email=email)
        # Check password manually since authenticate requires username
        if not user.check_password(password):
            return Response({"error": "Invalid email or password"}, status=status.HTTP_401_UNAUTHORIZED)
    except User.DoesNotExist:
        return Response({"error": "Invalid email or password"}, status=status.HTTP_401_UNAUTHORIZED)

    # Generate JWT token
    secret = getattr(settings, "NEXTAUTH_SECRET", settings.SECRET_KEY)
    payload = {
        "email": user.email,
        "exp": datetime.utcnow() + timedelta(days=7),
        "iat": datetime.utcnow()
    }
    token = jwt.encode(payload, secret, algorithm="HS256")

    return Response({
        "token": token,
        "user": {
            "email": user.email,
            "name": user.display_name or user.username,
            "role": user.role,
            "image": user.avatar_url
        }
    })


def validate_password(password):
    """Validate password strength: 8+ chars, uppercase, lowercase, number, special char"""
    if len(password) < 8:
        return False, "Password must be at least 8 characters long"
    
    has_upper = any(c.isupper() for c in password)
    has_lower = any(c.islower() for c in password)
    has_digit = any(c.isdigit() for c in password)
    has_special = any(c in "!@#$%^&*()_+-=[]{}|;:,.<>?" for c in password)
    
    if not has_upper:
        return False, "Password must contain at least one uppercase letter"
    if not has_lower:
        return False, "Password must contain at least one lowercase letter"
    if not has_digit:
        return False, "Password must contain at least one number"
    if not has_special:
        return False, "Password must contain at least one special character"
    
    return True, None


def validate_email(email):
    """Validate email format"""
    import re
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    if not re.match(pattern, email):
        return False, "Please enter a valid email address"
    return True, None


@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    """Register a new user"""
    email = request.data.get("email", "").strip()
    password = request.data.get("password", "")
    username = request.data.get("username", "").strip() or email.split("@")[0] if email else ""
    role = request.data.get("role", UserRole.CUSTOMER)

    if not email or not password:
        return Response({"error": "Email and password are required"}, status=status.HTTP_400_BAD_REQUEST)

    # Validate email
    is_valid_email, email_error = validate_email(email)
    if not is_valid_email:
        return Response({"error": email_error}, status=status.HTTP_400_BAD_REQUEST)

    # Validate password
    is_valid_password, password_error = validate_password(password)
    if not is_valid_password:
        return Response({"error": password_error}, status=status.HTTP_400_BAD_REQUEST)

    if User.objects.filter(email=email).exists():
        return Response({"error": "An account with this email already exists"}, status=status.HTTP_400_BAD_REQUEST)

    user = User.objects.create_user(
        username=username,
        email=email,
        password=password,
        role=role
    )

    # Generate JWT token
    secret = getattr(settings, "NEXTAUTH_SECRET", settings.SECRET_KEY)
    payload = {
        "email": user.email,
        "exp": datetime.utcnow() + timedelta(days=7),
        "iat": datetime.utcnow()
    }
    token = jwt.encode(payload, secret, algorithm="HS256")

    return Response({
        "token": token,
        "user": {
            "email": user.email,
            "name": user.display_name or user.username,
            "role": user.role,
            "image": user.avatar_url
        },
        "message": "Account created successfully!"
    }, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([AllowAny])
def sync_user(request):

    email = request.data.get("email")
    username = request.data.get("username")
    role = request.data.get("role")

    if not email:
        return Response({"error": "Email required"}, status=status.HTTP_400_BAD_REQUEST)

    user, created = User.objects.get_or_create(
        email=email, defaults={"username": username}
    )

    if not created and username and user.username != username:
        user.username = username
        user.save()

    # Elevate to admin if matches ADMIN_EMAIL
    admin_email = getattr(settings, "ADMIN_EMAIL", None)
    if admin_email and user.email == admin_email and user.role != UserRole.ADMIN:
        user.role = UserRole.ADMIN
        user.save()

    # Optionally update role if provided and valid (but never downgrade admin)
    if role in dict(UserRole.choices).keys():
        if user.role != role and user.role != UserRole.ADMIN:
            user.role = role
            user.save()

    return Response({"message": "User synced", "created": created})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def stats(request):
    """Return basic admin statistics."""
    total_users = User.objects.count()
    total_customers = User.objects.filter(role=UserRole.CUSTOMER).count()
    total_providers = User.objects.filter(role=UserRole.PROVIDER).count()
    total_services = Service.objects.filter(is_active=True).count()
    total_bookings = Booking.objects.count()
    active_bookings = Booking.objects.filter(status=Booking.Status.CONFIRMED).count()
    
    data = {
        "total_users": total_users,
        "customers": total_customers,
        "providers": total_providers,
        "services": total_services,
        "bookings": total_bookings,
        "active_bookings": active_bookings,
    }
    return Response(data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_stats(request):
    """Return user-specific dashboard statistics."""
    user = request.user
    
    if getattr(user, "role", None) == UserRole.PROVIDER:
        # Provider stats
        my_services = Service.objects.filter(provider=user).count()
        my_bookings = Booking.objects.filter(service__provider=user).count()
        pending_bookings = Booking.objects.filter(service__provider=user, status=Booking.Status.PENDING).count()
        confirmed_bookings = Booking.objects.filter(service__provider=user, status=Booking.Status.CONFIRMED).count()
        completed_bookings = Booking.objects.filter(service__provider=user, status=Booking.Status.COMPLETED).count()
        
        # Calculate average rating
        completed_with_ratings = Booking.objects.filter(
            service__provider=user, 
            status=Booking.Status.COMPLETED,
            rating__isnull=False
        )
        avg_rating = completed_with_ratings.aggregate(avg=models.Avg('rating'))['avg'] or 0
        
        data = {
            "total_services": my_services,
            "total_bookings": my_bookings,
            "pending_bookings": pending_bookings,
            "confirmed_bookings": confirmed_bookings,
            "completed_bookings": completed_bookings,
            "average_rating": round(avg_rating, 1),
        }
    elif getattr(user, "role", None) == UserRole.CUSTOMER:
        # Customer stats
        my_bookings = Booking.objects.filter(customer=user).count()
        pending_bookings = Booking.objects.filter(customer=user, status=Booking.Status.PENDING).count()
        confirmed_bookings = Booking.objects.filter(customer=user, status=Booking.Status.CONFIRMED).count()
        completed_bookings = Booking.objects.filter(customer=user, status=Booking.Status.COMPLETED).count()
        
        data = {
            "total_bookings": my_bookings,
            "pending_bookings": pending_bookings,
            "confirmed_bookings": confirmed_bookings,
            "completed_bookings": completed_bookings,
            "active_bookings": confirmed_bookings,
        }
    else:
        # Admin stats (same as public stats)
        data = {
            "total_users": User.objects.count(),
            "customers": User.objects.filter(role=UserRole.CUSTOMER).count(),
            "providers": User.objects.filter(role=UserRole.PROVIDER).count(),
            "services": Service.objects.filter(is_active=True).count(),
            "bookings": Booking.objects.count(),
            "active_bookings": Booking.objects.filter(status=Booking.Status.CONFIRMED).count(),
        }
    
    return Response(data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def submit_kyc(request):
    """Submit KYC verification documents."""
    user = request.user
    
    # Check if KYC already exists
    if hasattr(user, 'kyc_verification'):
        return Response(
            {"detail": "KYC verification already submitted. Please check status."},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    serializer = KYCVerificationSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(user=user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_kyc_status(request):
    """Get current user's KYC status."""
    user = request.user
    
    if not hasattr(user, 'kyc_verification'):
        return Response({
            "status": "not_submitted",
            "is_verified": False
        })
    
    serializer = KYCVerificationSerializer(user.kyc_verification)
    return Response({
        "status": user.kyc_verification.status,
        "is_verified": user.kyc_verification.is_verified,
        "data": serializer.data
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_pending_kyc(request):
    """List pending KYC verifications (admin only)."""
    user = request.user
    
    if getattr(user, "role", None) != UserRole.ADMIN:
        return Response(
            {"detail": "Only admins can view pending KYC verifications."},
            status=status.HTTP_403_FORBIDDEN
        )
    
    pending_kyc = KYCVerification.objects.filter(status=KYCVerification.Status.PENDING)
    serializer = KYCVerificationSerializer(pending_kyc, many=True)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def verify_kyc(request, kyc_id: int):
    """Verify or reject KYC (admin only)."""
    user = request.user
    
    if getattr(user, "role", None) != UserRole.ADMIN:
        return Response(
            {"detail": "Only admins can verify KYC."},
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        kyc = KYCVerification.objects.get(id=kyc_id)
    except KYCVerification.DoesNotExist:
        return Response(
            {"detail": "KYC verification not found."},
            status=status.HTTP_404_NOT_FOUND
        )
    
    action = request.data.get("action")  # "approve" or "reject"
    notes = request.data.get("admin_notes", "")
    
    if action == "approve":
        kyc.status = KYCVerification.Status.APPROVED
        kyc.verified_at = timezone.now()
        kyc.verified_by = user
        kyc.admin_notes = notes
        kyc.save()
    elif action == "reject":
        kyc.status = KYCVerification.Status.REJECTED
        kyc.verified_at = timezone.now()
        kyc.verified_by = user
        kyc.admin_notes = notes
        kyc.save()
    else:
        return Response(
            {"detail": "Invalid action. Use 'approve' or 'reject'."},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    serializer = KYCVerificationSerializer(kyc)
    return Response(serializer.data)