from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils.translation import gettext_lazy as _
from django.conf import settings

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


class KYCVerification(models.Model):
    class Status(models.TextChoices):
        PENDING = "pending", _("Pending")
        APPROVED = "approved", _("Approved")
        REJECTED = "rejected", _("Rejected")

    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="kyc_verification")
    
    # Mandatory fields
    photo = models.ImageField(upload_to="kyc/photos/", help_text="Profile photo")
    full_name = models.CharField(max_length=150)
    address = models.TextField()
    phone_number = models.CharField(max_length=20)
    email = models.EmailField()
    citizenship = models.FileField(upload_to="kyc/citizenship/", help_text="Citizenship document")
    
    # Optional fields
    driving_license = models.FileField(upload_to="kyc/driving_license/", blank=True, null=True)
    passport = models.FileField(upload_to="kyc/passport/", blank=True, null=True)
    
    # Verification status
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    admin_notes = models.TextField(blank=True, help_text="Admin notes for approval/rejection")
    verified_at = models.DateTimeField(null=True, blank=True)
    verified_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name="verified_kyc"
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "KYC Verification"
        verbose_name_plural = "KYC Verifications"

    def __str__(self) -> str:
        return f"KYC for {self.user.email} - {self.status}"

    @property
    def is_verified(self) -> bool:
        return self.status == self.Status.APPROVED
