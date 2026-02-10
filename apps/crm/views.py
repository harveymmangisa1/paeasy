from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q, Sum, Count
from django.utils import timezone
from .models import (
    Lead, Contact, Account, Opportunity, Activity, Note,
    Campaign, CampaignMember
)
from .serializers import (
    LeadSerializer, ContactSerializer, AccountSerializer, OpportunitySerializer,
    ActivitySerializer, NoteSerializer, CampaignSerializer, CampaignMemberSerializer
)


class LeadViewSet(viewsets.ModelViewSet):
    serializer_class = LeadSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'source', 'assigned_to', 'converted_to_contact']
    search_fields = ['first_name', 'last_name', 'email', 'company', 'description']
    ordering_fields = ['created_at', 'expected_close_date', 'last_name']
    ordering = ['-created_at']

    def get_queryset(self):
        return Lead.objects.filter(tenant=self.request.tenant).select_related('assigned_to')

    def perform_create(self, serializer):
        serializer.save(
            tenant=self.request.tenant,
            created_by=self.request.user,
            updated_by=self.request.user
        )

    def perform_update(self, serializer):
        serializer.save(updated_by=self.request.user)

    @action(detail=True, methods=['post'])
    def convert_to_contact(self, request, pk=None):
        lead = self.get_object()
        if lead.converted_to_contact:
            return Response({'error': 'Lead already converted'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Create contact from lead
        contact = Contact.objects.create(
            tenant=lead.tenant,
            first_name=lead.first_name,
            last_name=lead.last_name,
            email=lead.email,
            phone=lead.phone,
            company=lead.company,
            position=lead.position,
            assigned_to=lead.assigned_to,
            created_by=request.user,
            updated_by=request.user
        )
        
        # Create account if company exists
        if lead.company:
            account, created = Account.objects.get_or_create(
                tenant=lead.tenant,
                name=lead.company,
                defaults={
                    'assigned_to': lead.assigned_to,
                    'created_by': request.user,
                    'updated_by': request.user,
                }
            )
            contact.account = account
            contact.save()
        
        # Mark lead as converted
        lead.converted_to_contact = True
        lead.converted_date = timezone.now()
        lead.save()
        
        return Response({'contact_id': contact.id, 'message': 'Lead converted successfully'})


class ContactViewSet(viewsets.ModelViewSet):
    serializer_class = ContactSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['account', 'department', 'is_primary', 'is_decision_maker', 'assigned_to']
    search_fields = ['first_name', 'last_name', 'email', 'position', 'notes']
    ordering_fields = ['last_name', 'first_name', 'created_at']
    ordering = ['last_name', 'first_name']

    def get_queryset(self):
        return Contact.objects.filter(tenant=self.request.tenant).select_related('account', 'assigned_to')

    def perform_create(self, serializer):
        serializer.save(
            tenant=self.request.tenant,
            created_by=self.request.user,
            updated_by=self.request.user
        )

    def perform_update(self, serializer):
        serializer.save(updated_by=self.request.user)


class AccountViewSet(viewsets.ModelViewSet):
    serializer_class = AccountSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['account_type', 'industry', 'rating', 'assigned_to', 'parent_account']
    search_fields = ['name', 'website', 'description', 'email']
    ordering_fields = ['name', 'created_at', 'annual_revenue']
    ordering = ['name']

    def get_queryset(self):
        return Account.objects.filter(tenant=self.request.tenant).select_related('assigned_to', 'parent_account')

    def perform_create(self, serializer):
        serializer.save(
            tenant=self.request.tenant,
            created_by=self.request.user,
            updated_by=self.request.user
        )

    def perform_update(self, serializer):
        serializer.save(updated_by=self.request.user)

    @action(detail=True)
    def contacts(self, request, pk=None):
        account = self.get_object()
        contacts = account.contacts.all()
        serializer = ContactSerializer(contacts, many=True)
        return Response(serializer.data)

    @action(detail=True)
    def opportunities(self, request, pk=None):
        account = self.get_object()
        opportunities = account.opportunities.all()
        serializer = OpportunitySerializer(opportunities, many=True)
        return Response(serializer.data)


class OpportunityViewSet(viewsets.ModelViewSet):
    serializer_class = OpportunitySerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['stage', 'account', 'contact', 'lead_source', 'assigned_to']
    search_fields = ['name', 'description', 'competitor', 'next_step']
    ordering_fields = ['expected_close_date', 'amount', 'created_at', 'name']
    ordering = ['-expected_close_date']

    def get_queryset(self):
        return Opportunity.objects.filter(tenant=self.request.tenant).select_related(
            'account', 'contact', 'assigned_to'
        )

    def perform_create(self, serializer):
        serializer.save(
            tenant=self.request.tenant,
            created_by=self.request.user,
            updated_by=self.request.user
        )

    def perform_update(self, serializer):
        serializer.save(updated_by=self.request.user)


class ActivityViewSet(viewsets.ModelViewSet):
    serializer_class = ActivitySerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['activity_type', 'status', 'assigned_to', 'lead', 'contact', 'account', 'opportunity']
    search_fields = ['title', 'description', 'location']
    ordering_fields = ['start_date', 'created_at']
    ordering = ['-start_date']

    def get_queryset(self):
        return Activity.objects.filter(tenant=self.request.tenant).select_related(
            'assigned_to', 'created_by', 'lead', 'contact', 'account', 'opportunity'
        )

    def perform_create(self, serializer):
        serializer.save(
            tenant=self.request.tenant,
            created_by=self.request.user
        )


class NoteViewSet(viewsets.ModelViewSet):
    serializer_class = NoteSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['is_private', 'lead', 'contact', 'account', 'opportunity']
    search_fields = ['title', 'content']
    ordering_fields = ['created_at']
    ordering = ['-created_at']

    def get_queryset(self):
        queryset = Note.objects.filter(tenant=self.request.tenant).select_related('created_by')
        if not self.request.user.is_superuser:
            # Users can only see their private notes
            queryset = queryset.filter(
                Q(is_private=False) | Q(created_by=self.request.user)
            )
        return queryset

    def perform_create(self, serializer):
        serializer.save(
            tenant=self.request.tenant,
            created_by=self.request.user
        )


class CampaignViewSet(viewsets.ModelViewSet):
    serializer_class = CampaignSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'assigned_to']
    search_fields = ['name', 'description']
    ordering_fields = ['start_date', 'end_date', 'created_at']
    ordering = ['-created_at']

    def get_queryset(self):
        return Campaign.objects.filter(tenant=self.request.tenant).select_related('assigned_to')

    def perform_create(self, serializer):
        serializer.save(
            tenant=self.request.tenant,
            created_by=self.request.user,
            updated_by=self.request.user
        )

    def perform_update(self, serializer):
        serializer.save(updated_by=self.request.user)

    @action(detail=True)
    def members(self, request, pk=None):
        campaign = self.get_object()
        members = campaign.members.all().select_related('lead', 'contact')
        serializer = CampaignMemberSerializer(members, many=True)
        return Response(serializer.data)

    @action(detail=True)
    def stats(self, request, pk=None):
        campaign = self.get_object()
        members = campaign.members.all()
        
        stats = {
            'total_members': members.count(),
            'sent': members.filter(status='sent').count(),
            'responded': members.filter(status='responded').count(),
            'converted': members.filter(status='converted').count(),
            'bounced': members.filter(status='bounced').count(),
            'conversion_rate': 0
        }
        
        if stats['sent'] > 0:
            stats['conversion_rate'] = round((stats['converted'] / stats['sent']) * 100, 2)
        
        return Response(stats)


class CampaignMemberViewSet(viewsets.ModelViewSet):
    serializer_class = CampaignMemberSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['campaign', 'status']
    search_fields = ['campaign__name']
    ordering_fields = ['response_date', 'created_at']
    ordering = ['-created_at']

    def get_queryset(self):
        return CampaignMember.objects.filter(tenant=self.request.tenant).select_related(
            'campaign', 'lead', 'contact'
        )

    def perform_create(self, serializer):
        serializer.save(
            tenant=self.request.tenant,
            created_by=self.request.user,
            updated_by=self.request.user
        )

    def perform_update(self, serializer):
        serializer.save(updated_by=self.request.user)