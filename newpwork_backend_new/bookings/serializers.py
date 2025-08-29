from rest_framework import serializers
from .models import Booking


class BookingSerializer(serializers.ModelSerializer):
    service_title = serializers.CharField(source="service.title", read_only=True)
    provider_id = serializers.IntegerField(source="service.provider_id", read_only=True)
    customer_email = serializers.EmailField(source="customer.email", read_only=True)

    class Meta:
        model = Booking
        fields = [
            "id",
            "service",
            "service_title",
            "provider_id",
            "customer",
            "customer_email",
            "status",
            "scheduled_for",
            "notes",
            "rating",
            "review",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["customer", "status", "created_at", "updated_at"]

