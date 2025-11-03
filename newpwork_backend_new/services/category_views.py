from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from .category_models import ServiceCategory
from .category_serializers import ServiceCategorySerializer


@api_view(["GET"])
@permission_classes([AllowAny])
def list_categories(request):
    """Return all service categories."""
    categories = ServiceCategory.objects.all()
    serializer = ServiceCategorySerializer(categories, many=True)
    return Response(serializer.data)


