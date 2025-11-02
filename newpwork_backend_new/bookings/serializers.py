from rest_framework import serializers
from .models import Booking


class BookingSerializer(serializers.ModelSerializer):
    service_title = serializers.CharField(source="service.title", read_only=True)
    service_description = serializers.CharField(source="service.description", read_only=True)
    provider_id = serializers.IntegerField(source="service.provider_id", read_only=True)
    provider_email = serializers.EmailField(source="service.provider.email", read_only=True)
    provider_name = serializers.CharField(source="service.provider.display_name", read_only=True)
    customer_email = serializers.EmailField(source="customer.email", read_only=True)
    customer_name = serializers.CharField(source="customer.display_name", read_only=True)
    base_price = serializers.DecimalField(source="service.base_price", max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = Booking
        fields = [
            "id",
            "service",
            "service_title",
            "service_description",
            "provider_id",
            "provider_email",
            "provider_name",
            "customer",
            "customer_email",
            "customer_name",
            "status",
            "scheduled_for",
            "notes",
            "rating",
            "review",
            "base_price",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["customer", "created_at", "updated_at"]

