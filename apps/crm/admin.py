from django.contrib import admin
from .models import (
    Lead, Contact, Account, Opportunity, Activity, Note, 
    Campaign, CampaignMember
)


@admin.register(Lead)
class LeadAdmin(admin.ModelAdmin):
    list_display = ['first_name', 'last_name', 'email', 'company', 'status', 'source', 'assigned_to']
    list_filter = ['status', 'source', 'converted_to_contact', 'created_at']
    search_fields = ['first_name', 'last_name', 'email', 'company']
    date_hierarchy = 'created_at'


@admin.register(Contact)
class ContactAdmin(admin.ModelAdmin):
    list_display = ['first_name', 'last_name', 'email', 'account', 'position', 'assigned_to']
    list_filter = ['is_primary', 'is_decision_maker', 'department', 'created_at']
    search_fields = ['first_name', 'last_name', 'email', 'account__name']
    date_hierarchy = 'created_at'


@admin.register(Account)
class AccountAdmin(admin.ModelAdmin):
    list_display = ['name', 'industry', 'account_type', 'rating', 'assigned_to']
    list_filter = ['account_type', 'rating', 'industry', 'created_at']
    search_fields = ['name', 'website', 'description']
    date_hierarchy = 'created_at'


@admin.register(Opportunity)
class OpportunityAdmin(admin.ModelAdmin):
    list_display = ['name', 'account', 'stage', 'amount', 'probability', 'expected_close_date', 'assigned_to']
    list_filter = ['stage', 'lead_source', 'currency', 'created_at']
    search_fields = ['name', 'account__name', 'description']
    date_hierarchy = 'expected_close_date'


@admin.register(Activity)
class ActivityAdmin(admin.ModelAdmin):
    list_display = ['title', 'activity_type', 'status', 'start_date', 'assigned_to']
    list_filter = ['activity_type', 'status', 'all_day', 'created_at']
    search_fields = ['title', 'description', 'location']
    date_hierarchy = 'start_date'


@admin.register(Note)
class NoteAdmin(admin.ModelAdmin):
    list_display = ['title', 'created_by', 'is_private', 'created_at']
    list_filter = ['is_private', 'created_at']
    search_fields = ['title', 'content']
    date_hierarchy = 'created_at'


@admin.register(Campaign)
class CampaignAdmin(admin.ModelAdmin):
    list_display = ['name', 'status', 'start_date', 'end_date', 'budget', 'assigned_to']
    list_filter = ['status', 'created_at']
    search_fields = ['name', 'description']
    date_hierarchy = 'start_date'


@admin.register(CampaignMember)
class CampaignMemberAdmin(admin.ModelAdmin):
    list_display = ['campaign', 'lead', 'contact', 'status', 'response_date']
    list_filter = ['status', 'response_date', 'created_at']
    search_fields = ['campaign__name']
    date_hierarchy = 'response_date'