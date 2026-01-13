from rest_framework import viewsets, status
from rest_framework.decorators import api_view, action
from rest_framework.response import Response
from django.utils import timezone
from datetime import timedelta
import secrets
from .models import User, UserInvitation
from .permissions import require_role, get_user_permissions_matrix
from rest_framework import serializers

class UserSerializer(serializers.ModelSerializer):
    accessible_modules = serializers.SerializerMethodField()
    branch_names = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'role', 
                  'tenant', 'branches', 'branch_names', 'custom_permissions', 
                  'is_active', 'phone', 'can_access_all_branches', 'accessible_modules',
                  'last_login', 'date_joined']
        read_only_fields = ['id', 'last_login', 'date_joined']
    
    def get_accessible_modules(self, obj):
        return obj.get_accessible_modules()
    
    def get_branch_names(self, obj):
        return [b.name for b in obj.branches.all()]

class UserInvitationSerializer(serializers.ModelSerializer):
    invited_by_name = serializers.ReadOnlyField(source='invited_by.get_full_name')
    
    class Meta:
        model = UserInvitation
        fields = '__all__'

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    
    def get_queryset(self):
        """Filter users by tenant"""
        user = self.request.user
        if user.role == 'super_admin':
            return User.objects.all()
        return User.objects.filter(tenant=user.tenant)
    
    @action(detail=True, methods=['get'])
    def permissions(self, request, pk=None):
        """Get user's permission matrix"""
        user = self.get_object()
        matrix = get_user_permissions_matrix(user)
        return Response({
            'user_id': str(user.id),
            'username': user.username,
            'role': user.role,
            'permissions': matrix
        })
    
    @action(detail=True, methods=['post'])
    def update_permissions(self, request, pk=None):
        """Update user's custom permissions (admin only)"""
        if request.user.role not in ['super_admin', 'tenant_admin']:
            return Response({'error': 'Admin access required'}, status=403)
        
        user = self.get_object()
        new_permissions = request.data.get('permissions', {})
        user.custom_permissions = new_permissions
        user.save()
        
        return Response({
            'success': True,
            'permissions': user.custom_permissions
        })
    
    @action(detail=True, methods=['post'])
    def deactivate(self, request, pk=None):
        """Deactivate a user"""
        if request.user.role not in ['super_admin', 'tenant_admin']:
            return Response({'error': 'Admin access required'}, status=403)
        
        user = self.get_object()
        user.is_active = False
        user.save()
        
        return Response({'success': True, 'message': 'User deactivated'})

@api_view(['POST'])
@require_role('super_admin', 'tenant_admin')
def invite_user(request):
    """
    Invite a new user to the system
    
    Payload:
    {
        "email": "user@example.com",
        "role": "cashier",
        "branches": ["branch_id_1", "branch_id_2"],
        "custom_permissions": {...}
    }
    """
    tenant = request.user.tenant
    email = request.data.get('email')
    role = request.data.get('role', 'cashier')
    
    # Check if user already exists
    if User.objects.filter(email=email, tenant=tenant).exists():
        return Response({
            'error': 'User with this email already exists in your organization'
        }, status=400)
    
    # Generate invitation token
    token = secrets.token_urlsafe(32)
    
    # Create invitation
    invitation = UserInvitation.objects.create(
        tenant=tenant,
        email=email,
        role=role,
        invited_by=request.user,
        token=token,
        expires_at=timezone.now() + timedelta(days=7),
        custom_permissions=request.data.get('custom_permissions', {})
    )
    
    # Add branches
    branch_ids = request.data.get('branches', [])
    if branch_ids:
        invitation.branches.set(branch_ids)
    
    # In production, send email here
    invitation_link = f"https://yourapp.com/accept-invitation/{token}"
    
    return Response({
        'success': True,
        'invitation_id': str(invitation.id),
        'invitation_link': invitation_link,
        'expires_at': invitation.expires_at,
        'message': 'Invitation created successfully'
    }, status=status.HTTP_201_CREATED)

@api_view(['POST'])
def accept_invitation(request, token):
    """
    Accept an invitation and create user account
    
    Payload:
    {
        "password": "secure_password",
        "first_name": "John",
        "last_name": "Doe"
    }
    """
    try:
        invitation = UserInvitation.objects.get(token=token)
        
        if not invitation.is_valid():
            return Response({
                'error': 'Invitation is invalid or has expired'
            }, status=400)
        
        # Create user
        user = User.objects.create_user(
            username=invitation.email,
            email=invitation.email,
            password=request.data.get('password'),
            first_name=request.data.get('first_name', ''),
            last_name=request.data.get('last_name', ''),
            tenant=invitation.tenant,
            role=invitation.role,
            custom_permissions=invitation.custom_permissions
        )
        
        # Add branches
        user.branches.set(invitation.branches.all())
        
        # Mark invitation as accepted
        invitation.status = 'accepted'
        invitation.accepted_at = timezone.now()
        invitation.save()
        
        return Response({
            'success': True,
            'user_id': str(user.id),
            'message': 'Account created successfully'
        }, status=status.HTTP_201_CREATED)
        
    except UserInvitation.DoesNotExist:
        return Response({
            'error': 'Invalid invitation token'
        }, status=404)

@api_view(['GET'])
def get_my_permissions(request):
    """Get current user's permissions"""
    user = request.user
    
    if not user.is_authenticated:
        return Response({'error': 'Not authenticated'}, status=401)
    
    matrix = get_user_permissions_matrix(user)
    
    return Response({
        'user_id': str(user.id),
        'username': user.username,
        'role': user.role,
        'tenant_id': str(user.tenant.id) if user.tenant else None,
        'accessible_modules': user.get_accessible_modules(),
        'permissions': matrix,
        'can_access_all_branches': user.can_access_all_branches,
        'branches': [{'id': str(b.id), 'name': b.name} for b in user.branches.all()]
    })

@api_view(['GET'])
@require_role('super_admin', 'tenant_admin')
def list_invitations(request):
    """List all pending invitations"""
    tenant = request.user.tenant
    invitations = UserInvitation.objects.filter(
        tenant=tenant,
        status='pending'
    ).select_related('invited_by')
    
    serializer = UserInvitationSerializer(invitations, many=True)
    return Response(serializer.data)
