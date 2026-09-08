from rest_framework import permissions
from accounts.permissions import IsOwnerAdmin

class IsAdminOrReadOnly(permissions.BasePermission):
    """
    Custom permission to allow read-only access to anyone,
    but only allow the admin to create, update, or delete.
    """
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True

        # For any write operation, check if the user is the admin
        return IsOwnerAdmin().has_permission(request, view)
