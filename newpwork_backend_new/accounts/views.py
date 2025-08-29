from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from .models import User

@api_view(['POST'])
@permission_classes([AllowAny])
def sync_user(request):
    """
    Create or update a user from Google auth data sent by frontend.
    """
    email = request.data.get("email")
    username = request.data.get("username")

    if not email:
        return Response({"error": "Email required"}, status=400)

    user, created = User.objects.get_or_create(
        email=email, defaults={"username": username}
    )

    if not created and username and user.username != username:
        user.username = username
        user.save()

    return Response({"message": "User synced", "created": created})
