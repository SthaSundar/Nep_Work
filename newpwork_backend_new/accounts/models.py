from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils.translation import gettext_lazy as _

class UserRole(models.TextChoices):
    CUSTOMER = "customer", _("Customer")
    PROVIDER = "provider", _("Provider")
    ADMIN = "admin", _("Admin")

class User(AbstractUser):
    """
    Custom user model for marketplace authentication and profiles.
    Extends Django's AbstractUser to keep username behavior but adds marketplace fields.
    """

    email = models.EmailField(unique=True)
    phone_number = models.CharField(max_length=20, blank=True)
    role = models.CharField(max_length=20, choices=UserRole.choices, default=UserRole.CUSTOMER)
    is_email_verified = models.BooleanField(default=False)

    # Optional profile fields
    display_name = models.CharField(max_length=150, blank=True)
    avatar_url = models.URLField(blank=True)
    bio = models.TextField(blank=True)

    # OAuth fields (for Google login)
    google_id = models.CharField(max_length=255, blank=True, null=True, unique=True)
    access_token = models.CharField(max_length=512, blank=True, null=True)

    REQUIRED_FIELDS = ["email"]

    def __str__(self) -> str:
        if self.display_name:
            return self.display_name
        return self.get_username()

    @property
    def is_customer(self) -> bool:
        return self.role == UserRole.CUSTOMER

    @property
    def is_provider(self) -> bool:
        return self.role == UserRole.PROVIDER
