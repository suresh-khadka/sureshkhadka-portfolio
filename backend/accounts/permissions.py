from rest_framework import permissions

class IsOwnerAdmin(permissions.BasePermission):
    """
    Permission class to ensure that only the single admin user can perform write operations.
    """
    def has_permission(self, request, view):
        # Check if user is authenticated and is a superuser
        return bool(request.user and request.user.is_authenticated and request.user.is_superuser)
