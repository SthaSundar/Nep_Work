from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.utils.text import slugify
from .models import ServiceCategory, Service
from .serializers import ServiceCategorySerializer, ServiceSerializer
from accounts.models import UserRole


@api_view(["GET"])
@permission_classes([AllowAny])
def list_categories(request):
    """Return all service categories."""
    categories = ServiceCategory.objects.all()
    serializer = ServiceCategorySerializer(categories, many=True)
    return Response(serializer.data)


@api_view(["GET"]) 
@permission_classes([AllowAny])
def list_services(request):
    """Public list of active services, optionally filtered by category or search."""
    queryset = Service.objects.filter(is_active=True)
    category = request.query_params.get("category")
    search = request.query_params.get("q")
    if category:
        queryset = queryset.filter(category__slug=category)
    if search:
        queryset = queryset.filter(title__icontains=search)
    serializer = ServiceSerializer(queryset, many=True)
    return Response(serializer.data)


@api_view(["POST"]) 
@permission_classes([IsAuthenticated])
def create_service(request):
    """Provider-only create service. Provider is set from request.user."""
    user = request.user
    if getattr(user, "role", None) != UserRole.PROVIDER:
        return Response({"detail": "Only providers can create services."}, status=status.HTTP_403_FORBIDDEN)
    data = request.data.copy()
    if not data.get("slug") and data.get("title"):
        data["slug"] = slugify(data["title"])[:175]
    serializer = ServiceSerializer(data=data)
    if serializer.is_valid():
        serializer.save(provider=user, is_active=True)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["GET"]) 
@permission_classes([IsAuthenticated])
def my_services(request):
    """List services for the logged-in provider."""
    user = request.user
    if getattr(user, "role", None) != UserRole.PROVIDER:
        return Response({"detail": "Only providers can view their services."}, status=status.HTTP_403_FORBIDDEN)
    queryset = Service.objects.filter(provider=user)
    serializer = ServiceSerializer(queryset, many=True)
    return Response(serializer.data)


@api_view(["PATCH", "PUT"]) 
@permission_classes([IsAuthenticated])
def update_service(request, service_id: int):
    """Provider-only update for own service."""
    user = request.user
    try:
        service = Service.objects.get(id=service_id)
    except Service.DoesNotExist:
        return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)
    if getattr(user, "role", None) != UserRole.PROVIDER or service.provider_id != user.id:
        return Response({"detail": "You cannot modify this service."}, status=status.HTTP_403_FORBIDDEN)
    partial = request.method == "PATCH"
    serializer = ServiceSerializer(service, data=request.data, partial=partial)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["DELETE"]) 
@permission_classes([IsAuthenticated])
def delete_service(request, service_id: int):
    """Provider-only delete for own service."""
    user = request.user
    try:
        service = Service.objects.get(id=service_id)
    except Service.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
    if getattr(user, "role", None) != UserRole.PROVIDER or service.provider_id != user.id:
        return Response({"detail": "You cannot delete this service."}, status=status.HTTP_403_FORBIDDEN)
    service.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)
