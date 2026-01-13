from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserViewSet, invite_user, accept_invitation, get_my_permissions, list_invitations

router = DefaultRouter()
router.register(r'users', UserViewSet)

urlpatterns = [
    path('', include(router.urls)),
    
    # User invitation
    path('invite/', invite_user, name='invite_user'),
    path('invitations/', list_invitations, name='list_invitations'),
    path('accept-invitation/<str:token>/', accept_invitation, name='accept_invitation'),
    
    # Permissions
    path('my-permissions/', get_my_permissions, name='my_permissions'),
]
