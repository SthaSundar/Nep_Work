from django.urls import path
from .views import sync_user

urlpatterns = [
    path("sync/", sync_user, name="sync_user"),
]
