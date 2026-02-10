from rest_framework import serializers
from .models import (
    Lead, Contact, Account, Opportunity, Activity, Note,
    Campaign, CampaignMember
)


class LeadSerializer(serializers.ModelSerializer):
    assigned_to_name = serializers.CharField(source='assigned_to.get_full_name', read_only=True)
    
    class Meta:
        model = Lead
        fields = '__all__'
        read_only_fields = ('id', 'tenant', 'created_at', 'updated_at', 'created_by', 'updated_by')


class ContactSerializer(serializers.ModelSerializer):
    assigned_to_name = serializers.CharField(source='assigned_to.get_full_name', read_only=True)
    account_name = serializers.CharField(source='account.name', read_only=True)
    
    class Meta:
        model = Contact
        fields = '__all__'
        read_only_fields = ('id', 'tenant', 'created_at', 'updated_at', 'created_by', 'updated_by')


class AccountSerializer(serializers.ModelSerializer):
    assigned_to_name = serializers.CharField(source='assigned_to.get_full_name', read_only=True)
    parent_account_name = serializers.CharField(source='parent_account.name', read_only=True)
    
    class Meta:
        model = Account
        fields = '__all__'
        read_only_fields = ('id', 'tenant', 'created_at', 'updated_at', 'created_by', 'updated_by')


class OpportunitySerializer(serializers.ModelSerializer):
    assigned_to_name = serializers.CharField(source='assigned_to.get_full_name', read_only=True)
    account_name = serializers.CharField(source='account.name', read_only=True)
    contact_name = serializers.CharField(source='contact.__str__', read_only=True)
    
    class Meta:
        model = Opportunity
        fields = '__all__'
        read_only_fields = ('id', 'tenant', 'created_at', 'updated_at', 'created_by', 'updated_by')


class ActivitySerializer(serializers.ModelSerializer):
    assigned_to_name = serializers.CharField(source='assigned_to.get_full_name', read_only=True)
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    
    class Meta:
        model = Activity
        fields = '__all__'
        read_only_fields = ('id', 'tenant', 'created_at', 'updated_at')


class NoteSerializer(serializers.ModelSerializer):
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    
    class Meta:
        model = Note
        fields = '__all__'
        read_only_fields = ('id', 'tenant', 'created_at', 'updated_at', 'created_by')


class CampaignSerializer(serializers.ModelSerializer):
    assigned_to_name = serializers.CharField(source='assigned_to.get_full_name', read_only=True)
    
    class Meta:
        model = Campaign
        fields = '__all__'
        read_only_fields = ('id', 'tenant', 'created_at', 'updated_at', 'created_by', 'updated_by')


class CampaignMemberSerializer(serializers.ModelSerializer):
    campaign_name = serializers.CharField(source='campaign.name', read_only=True)
    lead_name = serializers.CharField(source='lead.__str__', read_only=True)
    contact_name = serializers.CharField(source='contact.__str__', read_only=True)
    
    class Meta:
        model = CampaignMember
        fields = '__all__'
        read_only_fields = ('id', 'tenant', 'created_at', 'updated_at', 'created_by', 'updated_by')