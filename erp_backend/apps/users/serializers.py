from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from .models import User, UserInvitation
from apps.tenants.models import Tenant, Branch
import secrets
from django.utils import timezone
from datetime import timedelta


class UserSerializer(serializers.ModelSerializer):
    accessible_modules = serializers.SerializerMethodField()
    branch_names = serializers.SerializerMethodField()
    tenant_name = serializers.CharField(source='tenant.name', read_only=True)
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'role', 
                  'tenant', 'tenant_name', 'branches', 'branch_names', 'custom_permissions', 
                  'is_active', 'phone', 'can_access_all_branches', 'accessible_modules',
                  'last_login', 'date_joined', 'avatar']
        read_only_fields = ['id', 'last_login', 'date_joined']
    
    def get_accessible_modules(self, obj):
        return obj.get_accessible_modules()
    
    def get_branch_names(self, obj):
        return [b.name for b in obj.branches.all()]


class RegisterSerializer(serializers.Serializer):
    """Serializer for user registration"""
    email = serializers.EmailField(required=True)
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True, required=True)
    first_name = serializers.CharField(required=True, max_length=150)
    last_name = serializers.CharField(required=True, max_length=150)
    phone = serializers.CharField(required=False, allow_blank=True, max_length=20)
    
    # Optional: For invitation-based registration
    invitation_token = serializers.CharField(required=False, allow_blank=True)
    
    # Optional: For creating new tenant (first user)
    tenant_name = serializers.CharField(required=False, allow_blank=True)
    tenant_subdomain = serializers.SlugField(required=False, allow_blank=True)
    industry = serializers.ChoiceField(
        choices=Tenant._meta.get_field('industry').choices,
        required=False,
        default='retail'
    )
    
    def validate(self, attrs):
        # Check password match
        if attrs.get('password') != attrs.get('password_confirm'):
            raise serializers.ValidationError({"password": "Passwords do not match"})
        
        # Check if email already exists
        if User.objects.filter(email=attrs['email']).exists():
            raise serializers.ValidationError({"email": "User with this email already exists"})
        
        # Validate invitation token if provided
        invitation_token = attrs.get('invitation_token')
        if invitation_token:
            try:
                invitation = UserInvitation.objects.get(token=invitation_token)
                if not invitation.is_valid():
                    raise serializers.ValidationError({"invitation_token": "Invitation is invalid or has expired"})
                attrs['_invitation'] = invitation
            except UserInvitation.DoesNotExist:
                raise serializers.ValidationError({"invitation_token": "Invalid invitation token"})
        else:
            # If no invitation, tenant info is required
            if not attrs.get('tenant_name') or not attrs.get('tenant_subdomain'):
                raise serializers.ValidationError({
                    "tenant_name": "Tenant name and subdomain are required for new registration"
                })
            
            # Check if subdomain is available
            if Tenant.objects.filter(subdomain=attrs['tenant_subdomain']).exists():
                raise serializers.ValidationError({
                    "tenant_subdomain": "This subdomain is already taken"
                })
        
        return attrs
    
    def create(self, validated_data):
        # Remove confirmation password
        validated_data.pop('password_confirm')
        
        # Handle invitation-based registration
        invitation = validated_data.pop('_invitation', None)
        
        if invitation:
            # Use invitation details
            tenant = invitation.tenant
            role = invitation.role
            custom_permissions = invitation.custom_permissions
            branches = list(invitation.branches.all())
            
            # Create user
            user = User.objects.create_user(
                username=validated_data['email'],
                email=validated_data['email'],
                password=validated_data['password'],
                first_name=validated_data['first_name'],
                last_name=validated_data['last_name'],
                phone=validated_data.get('phone', ''),
                tenant=tenant,
                role=role,
                custom_permissions=custom_permissions
            )
            
            # Add branches
            if branches:
                user.branches.set(branches)
            
            # Mark invitation as accepted
            invitation.status = 'accepted'
            invitation.accepted_at = timezone.now()
            invitation.save()
        else:
            # Create new tenant
            tenant = Tenant.objects.create(
                name=validated_data.pop('tenant_name'),
                subdomain=validated_data.pop('tenant_subdomain'),
                industry=validated_data.pop('industry', 'retail'),
                active_modules={
                    'inventory': True,
                    'sales': True,
                    'pos': True,
                    'accounting': True,
                    'hr': True,
                    'crm': True
                }
            )
            
            # Create HQ branch
            hq_branch = Branch.objects.create(
                tenant=tenant,
                name='Head Office',
                code='HQ',
                is_hq=True,
                address='',
                phone=validated_data.get('phone', '')
            )
            
            # Create user as tenant admin
            user = User.objects.create_user(
                username=validated_data['email'],
                email=validated_data['email'],
                password=validated_data['password'],
                first_name=validated_data['first_name'],
                last_name=validated_data['last_name'],
                phone=validated_data.get('phone', ''),
                tenant=tenant,
                role='tenant_admin',
                can_access_all_branches=True
            )
            
            # Add to HQ branch
            user.branches.add(hq_branch)
        
        return user


class PasswordResetRequestSerializer(serializers.Serializer):
    """Serializer for requesting password reset"""
    email = serializers.EmailField(required=True)
    
    def validate_email(self, value):
        if not User.objects.filter(email=value).exists():
            # Don't reveal if email exists or not for security
            pass
        return value


class PasswordResetConfirmSerializer(serializers.Serializer):
    """Serializer for confirming password reset"""
    token = serializers.CharField(required=True)
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True, required=True)
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({"password": "Passwords do not match"})
        return attrs


class ChangePasswordSerializer(serializers.Serializer):
    """Serializer for changing password (authenticated users)"""
    old_password = serializers.CharField(write_only=True, required=True)
    new_password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    new_password_confirm = serializers.CharField(write_only=True, required=True)
    
    def validate(self, attrs):
        if attrs['new_password'] != attrs['new_password_confirm']:
            raise serializers.ValidationError({"new_password": "Passwords do not match"})
        return attrs
    
    def validate_old_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Old password is incorrect")
        return value


class UserProfileSerializer(serializers.ModelSerializer):
    """Extended serializer for user profile management"""
    tenant_info = serializers.SerializerMethodField()
    branches_info = serializers.SerializerMethodField()
    permissions_matrix = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'role',
                  'phone', 'avatar', 'tenant_info', 'branches_info', 
                  'can_access_all_branches', 'accessible_modules', 'permissions_matrix',
                  'last_login', 'date_joined']
        read_only_fields = ['id', 'username', 'email', 'role', 'last_login', 'date_joined']
    
    def get_tenant_info(self, obj):
        if obj.tenant:
            return {
                'id': str(obj.tenant.id),
                'name': obj.tenant.name,
                'subdomain': obj.tenant.subdomain,
                'industry': obj.tenant.industry
            }
        return None
    
    def get_branches_info(self, obj):
        return [
            {
                'id': str(b.id),
                'name': b.name,
                'code': b.code,
                'is_hq': b.is_hq
            }
            for b in obj.branches.all()
        ]
    
    def get_permissions_matrix(self, obj):
        from .permissions import get_user_permissions_matrix
        return get_user_permissions_matrix(obj)


class UserInvitationSerializer(serializers.ModelSerializer):
    invited_by_name = serializers.ReadOnlyField(source='invited_by.get_full_name')
    
    class Meta:
        model = UserInvitation
        fields = '__all__'
