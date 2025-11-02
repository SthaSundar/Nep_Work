from django.urls import path
from . import views
from django.http import JsonResponse
from .views import sync_user, stats, user_stats, login, register, submit_kyc, get_kyc_status, list_pending_kyc, verify_kyc

def accounts_home(request):
    """Default view for /api/accounts/"""
    return JsonResponse({
        "message": "Accounts API",
        "endpoints": {
            "login": "/api/accounts/login/",
            "register": "/api/accounts/register/",
            "sync": "/api/accounts/sync/",
            "stats": "/api/accounts/stats/",
            "user_stats": "/api/accounts/user-stats/",
            "kyc_submit": "/api/accounts/kyc/submit/",
            "kyc_status": "/api/accounts/kyc/status/",
            "kyc_pending": "/api/accounts/kyc/pending/",
            "kyc_verify": "/api/accounts/kyc/<id>/verify/",
        }
    })

urlpatterns = [
    path("", accounts_home, name="accounts_home"),
    path("login/", login, name="login"),
    path("register/", register, name="register"),
    path("sync/", sync_user, name="sync_user"),
    path("stats/", stats, name="stats"),
    path("user-stats/", user_stats, name="user_stats"),
    path("kyc/submit/", submit_kyc, name="submit_kyc"),
    path("kyc/status/", get_kyc_status, name="get_kyc_status"),
    path("kyc/pending/", list_pending_kyc, name="list_pending_kyc"),
    path("kyc/<int:kyc_id>/verify/", verify_kyc, name="verify_kyc"),
]
