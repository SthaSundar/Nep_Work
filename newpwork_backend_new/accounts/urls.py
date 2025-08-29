from django.urls import path
from . import views
from django.http import JsonResponse
from .views import sync_user, stats, user_stats

def accounts_home(request):
    """Default view for /api/accounts/"""
    return JsonResponse({
        "message": "Accounts API",
        "endpoints": {
            "sync": "/api/accounts/sync/",
            "stats": "/api/accounts/stats/",
            "user_stats": "/api/accounts/user-stats/"
        }
    })

urlpatterns = [
    path("", accounts_home, name="accounts_home"),
    path("sync/", sync_user, name="sync_user"),
    path("stats/", stats, name="stats"),
    path("user-stats/", user_stats, name="user_stats"),
]
