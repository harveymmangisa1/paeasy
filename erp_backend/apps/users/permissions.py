from functools import wraps
from rest_framework.response import Response
from rest_framework import status

def require_permission(module, action):
    """
    Decorator to check if user has permission for a specific action
    Usage: @require_permission('inventory', 'create')
    """
    def decorator(view_func):
        @wraps(view_func)
        def wrapper(request, *args, **kwargs):
            user = request.user
            
            if not user.is_authenticated:
                return Response({
                    'error': 'Authentication required'
                }, status=status.HTTP_401_UNAUTHORIZED)
            
            if not user.has_permission(module, action):
                return Response({
                    'error': f'Permission denied: You do not have {action} access to {module}',
                    'required_permission': f'{module}.{action}',
                    'your_role': user.role
                }, status=status.HTTP_403_FORBIDDEN)
            
            return view_func(request, *args, **kwargs)
        return wrapper
    return decorator

def require_role(*allowed_roles):
    """
    Decorator to check if user has one of the allowed roles
    Usage: @require_role('tenant_admin', 'branch_manager')
    """
    def decorator(view_func):
        @wraps(view_func)
        def wrapper(request, *args, **kwargs):
            user = request.user
            
            if not user.is_authenticated:
                return Response({
                    'error': 'Authentication required'
                }, status=status.HTTP_401_UNAUTHORIZED)
            
            if user.role not in allowed_roles:
                return Response({
                    'error': f'Access denied: This action requires one of these roles: {", ".join(allowed_roles)}',
                    'your_role': user.role
                }, status=status.HTTP_403_FORBIDDEN)
            
            return view_func(request, *args, **kwargs)
        return wrapper
    return decorator

class PermissionMixin:
    """
    Mixin for ViewSets to add permission checking
    """
    required_permission = None  # e.g., 'inventory'
    
    def check_permission(self, action_type):
        """Check if user has permission for action"""
        if not self.required_permission:
            return True
        
        user = self.request.user
        return user.has_permission(self.required_permission, action_type)
    
    def list(self, request, *args, **kwargs):
        if not self.check_permission('view'):
            return Response({
                'error': 'Permission denied'
            }, status=status.HTTP_403_FORBIDDEN)
        return super().list(request, *args, **kwargs)
    
    def create(self, request, *args, **kwargs):
        if not self.check_permission('create'):
            return Response({
                'error': 'Permission denied'
            }, status=status.HTTP_403_FORBIDDEN)
        return super().create(request, *args, **kwargs)
    
    def update(self, request, *args, **kwargs):
        if not self.check_permission('edit'):
            return Response({
                'error': 'Permission denied'
            }, status=status.HTTP_403_FORBIDDEN)
        return super().update(request, *args, **kwargs)
    
    def destroy(self, request, *args, **kwargs):
        if not self.check_permission('delete'):
            return Response({
                'error': 'Permission denied'
            }, status=status.HTTP_403_FORBIDDEN)
        return super().destroy(request, *args, **kwargs)

def get_user_permissions_matrix(user):
    """Get complete permissions matrix for a user"""
    modules = ['inventory', 'sales', 'hr', 'accounting', 'crm', 'pos']
    actions = ['view', 'create', 'edit', 'delete']
    
    matrix = {}
    for module in modules:
        matrix[module] = {}
        for action in actions:
            matrix[module][action] = user.has_permission(module, action)
    
    return matrix
