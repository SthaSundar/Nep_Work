from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from accounts.models import UserRole
from .models import Booking
from .serializers import BookingSerializer


@api_view(["POST"]) 
@permission_classes([IsAuthenticated])
def create_booking(request):
    """Customer-only: create a booking for a service."""
    user = request.user
    if getattr(user, "role", None) != UserRole.CUSTOMER:
        return Response({"detail": "Only customers can create bookings."}, status=status.HTTP_403_FORBIDDEN)
    serializer = BookingSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(customer=user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["GET"]) 
@permission_classes([IsAuthenticated])
def my_bookings(request):
    """Customer: list own bookings. Provider: list bookings on their services."""
    user = request.user
    if getattr(user, "role", None) == UserRole.CUSTOMER:
        qs = Booking.objects.filter(customer=user)
    elif getattr(user, "role", None) == UserRole.PROVIDER:
        qs = Booking.objects.filter(service__provider=user)
    else:  # admin
        qs = Booking.objects.all()
    serializer = BookingSerializer(qs, many=True)
    return Response(serializer.data)


@api_view(["PATCH"]) 
@permission_classes([IsAuthenticated])
def update_booking_status(request, booking_id: int):
    """Provider can update status for bookings on their services. Customer can cancel own pending."""
    user = request.user
    try:
        booking = Booking.objects.get(id=booking_id)
    except Booking.DoesNotExist:
        return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)

    new_status = request.data.get("status")
    if getattr(user, "role", None) == UserRole.PROVIDER:
        if booking.service.provider_id != user.id:
            return Response({"detail": "Forbidden"}, status=status.HTTP_403_FORBIDDEN)
        if new_status not in dict(Booking.Status.choices).keys():
            return Response({"detail": "Invalid status"}, status=status.HTTP_400_BAD_REQUEST)
        booking.status = new_status
        booking.save()
        return Response(BookingSerializer(booking).data)
    elif getattr(user, "role", None) == UserRole.CUSTOMER:
        if booking.customer_id != user.id:
            return Response({"detail": "Forbidden"}, status=status.HTTP_403_FORBIDDEN)
        if new_status != Booking.Status.CANCELLED:
            return Response({"detail": "Customers can only cancel their bookings."}, status=status.HTTP_400_BAD_REQUEST)
        booking.status = Booking.Status.CANCELLED
        booking.save()
        return Response(BookingSerializer(booking).data)
    else:
        # admin can set any
        if new_status not in dict(Booking.Status.choices).keys():
            return Response({"detail": "Invalid status"}, status=status.HTTP_400_BAD_REQUEST)
        booking.status = new_status
        booking.save()
        return Response(BookingSerializer(booking).data)


@api_view(["PATCH"]) 
@permission_classes([IsAuthenticated])
def rate_booking(request, booking_id: int):
    """Customer can rate their completed booking (1-5) and leave a review."""
    user = request.user
    try:
        booking = Booking.objects.get(id=booking_id)
    except Booking.DoesNotExist:
        return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)
    if booking.customer_id != user.id:
        return Response({"detail": "Forbidden"}, status=status.HTTP_403_FORBIDDEN)
    if booking.status != Booking.Status.COMPLETED:
        return Response({"detail": "Only completed bookings can be rated."}, status=status.HTTP_400_BAD_REQUEST)
    rating = request.data.get("rating")
    review = request.data.get("review", "")
    try:
        rating_val = int(rating)
    except (TypeError, ValueError):
        return Response({"detail": "Rating must be an integer"}, status=status.HTTP_400_BAD_REQUEST)
    if rating_val < 1 or rating_val > 5:
        return Response({"detail": "Rating must be between 1 and 5"}, status=status.HTTP_400_BAD_REQUEST)
    booking.rating = rating_val
    booking.review = review
    booking.save()
    return Response(BookingSerializer(booking).data)
