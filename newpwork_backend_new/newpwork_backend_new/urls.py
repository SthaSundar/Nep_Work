from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/bookings/', include('bookings.urls')),
    path('api/services/', include('services.urls')),
    path("api/accounts/", include("accounts.urls")),
]