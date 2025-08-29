from django.urls import path
from django.http import JsonResponse
from .views import (
    list_categories,
    list_services,
    create_service,
    my_services,
    update_service,
    delete_service,
)

def services_home(request):
    return JsonResponse({
        "message": "Services API",
        "endpoints": {
            "categories": "/api/services/categories/",
            "services": "/api/services/services/",
            "my_services": "/api/services/services/my/",
            "create_service": "/api/services/services/create/"
        }
    })

urlpatterns = [
    path("", services_home, name="services_home"),
    path("categories/", list_categories, name="list_categories"),
    path("services/", list_services, name="list_services"),
    path("services/my/", my_services, name="my_services"),
    path("services/create/", create_service, name="create_service"),
    path("services/<int:service_id>/", update_service, name="update_service"),
    path("services/<int:service_id>/delete/", delete_service, name="delete_service"),
]


