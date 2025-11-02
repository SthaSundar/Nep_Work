from django.db import models
from django.conf import settings


class ServiceCategory(models.Model):
    name = models.CharField(max_length=120, unique=True)
    slug = models.SlugField(max_length=140, unique=True)
    description = models.TextField(blank=True)

    class Meta:
        verbose_name = "Service Category"
        verbose_name_plural = "Service Categories"
        ordering = ["name"]

    def __str__(self) -> str:
        return self.name


class Service(models.Model):
    class PricingType(models.TextChoices):
        FIXED = "fixed", "Fixed"
        HOURLY = "hourly", "Hourly"

    provider = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="services")
    category = models.ForeignKey(ServiceCategory, on_delete=models.PROTECT, related_name="services")
    title = models.CharField(max_length=160)
    slug = models.SlugField(max_length=180, unique=True)
    description = models.TextField()
    base_price = models.DecimalField(max_digits=10, decimal_places=2)
    pricing_type = models.CharField(max_length=20, choices=PricingType.choices, default=PricingType.FIXED)
    location = models.CharField(max_length=200, blank=True)
    certificates = models.TextField(blank=True, help_text="List of certificates and degrees (comma-separated or JSON)")
    degrees = models.TextField(blank=True, help_text="Educational degrees and qualifications")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=["slug"]),
            models.Index(fields=["is_active", "category"]),
        ]
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return self.title
