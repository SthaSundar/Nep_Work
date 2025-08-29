from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Count
from .models import User, UserRole
from django.conf import settings
from services.models import Service
from bookings.models import Booking
from django.db import models

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
            "completed_bookings": completed_bookings,
            "average_rating": round(avg_rating, 1),
        }
    elif getattr(user, "role", None) == UserRole.CUSTOMER:
        # Customer stats
        my_bookings = Booking.objects.filter(customer=user).count()
        pending_bookings = Booking.objects.filter(customer=user, status=Booking.Status.PENDING).count()
        completed_bookings = Booking.objects.filter(customer=user, status=Booking.Status.COMPLETED).count()
        active_bookings = Booking.objects.filter(customer=user, status=Booking.Status.CONFIRMED).count()
        
        data = {
            "total_bookings": my_bookings,
            "pending_bookings": pending_bookings,
            "completed_bookings": completed_bookings,
            "active_bookings": active_bookings,
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
