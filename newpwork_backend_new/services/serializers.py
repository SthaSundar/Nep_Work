from rest_framework import serializers
from .models import Service, ServiceCategory


class ServiceCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ServiceCategory
        fields = ["id", "name", "slug", "description"]


class ServiceSerializer(serializers.ModelSerializer):
    provider_email = serializers.EmailField(source="provider.email", read_only=True)
    category_name = serializers.CharField(source="category.name", read_only=True)

    class Meta:
        model = Service
        fields = [
            "id",
            "provider",
            "provider_email",
            "category",
            "category_name",
            "title",
            "slug",
            "description",
            "base_price",
            "pricing_type",
            "location",
            "is_active",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["provider", "created_at", "updated_at", "is_active"]



