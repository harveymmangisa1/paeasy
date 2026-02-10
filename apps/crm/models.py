from django.db import models
from django.core.validators import EmailValidator, RegexValidator
from apps.core.models import TenantAwareModel
import uuid


class LeadStatus(models.TextChoices):
    NEW = 'new', 'New'
    CONTACTED = 'contacted', 'Contacted'
    QUALIFIED = 'qualified', 'Qualified'
    CONVERTED = 'converted', 'Converted'
    LOST = 'lost', 'Lost'


class LeadSource(models.TextChoices):
    WEBSITE = 'website', 'Website'
    REFERRAL = 'referral', 'Referral'
    SOCIAL_MEDIA = 'social_media', 'Social Media'
    EMAIL = 'email', 'Email'
    PHONE = 'phone', 'Phone'
    WALK_IN = 'walk_in', 'Walk In'
    OTHER = 'other', 'Other'


class OpportunityStage(models.TextChoices):
    PROSPECTING = 'prospecting', 'Prospecting'
    QUALIFICATION = 'qualification', 'Qualification'
    NEEDS_ANALYSIS = 'needs_analysis', 'Needs Analysis'
    VALUE_PROPOSITION = 'value_proposition', 'Value Proposition'
    PROPOSAL = 'proposal', 'Proposal'
    NEGOTIATION = 'negotiation', 'Negotiation'
    CLOSED_WON = 'closed_won', 'Closed Won'
    CLOSED_LOST = 'closed_lost', 'Closed Lost'


class ActivityType(models.TextChoices):
    CALL = 'call', 'Call'
    EMAIL = 'email', 'Email'
    MEETING = 'meeting', 'Meeting'
    TASK = 'task', 'Task'
    NOTE = 'note', 'Note'
    DEMO = 'demo', 'Demo'
    FOLLOWUP = 'followup', 'Follow Up'


class Lead(TenantAwareModel):
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.EmailField(validators=[EmailValidator()])
    phone = models.CharField(
        max_length=20,
        validators=[RegexValidator(r'^\+?1?\d{9,15}$', 'Phone number must be valid')]
    )
    company = models.CharField(max_length=200, blank=True)
    position = models.CharField(max_length=100, blank=True)
    status = models.CharField(max_length=20, choices=LeadStatus.choices, default=LeadStatus.NEW)
    source = models.CharField(max_length=20, choices=LeadSource.choices, default=LeadSource.OTHER)
    description = models.TextField(blank=True)
    budget = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    expected_close_date = models.DateField(null=True, blank=True)
    assigned_to = models.ForeignKey(
        'users.User', 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='assigned_leads'
    )
    converted_to_contact = models.BooleanField(default=False)
    converted_date = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'crm_leads'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.first_name} {self.last_name}"


class Contact(TenantAwareModel):
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.EmailField(validators=[EmailValidator()])
    phone = models.CharField(
        max_length=20,
        validators=[RegexValidator(r'^\+?1?\d{9,15}$', 'Phone number must be valid')],
        blank=True
    )
    mobile = models.CharField(
        max_length=20,
        validators=[RegexValidator(r'^\+?1?\d{9,15}$', 'Phone number must be valid')],
        blank=True
    )
    position = models.CharField(max_length=100, blank=True)
    department = models.CharField(max_length=100, blank=True)
    account = models.ForeignKey('Account', on_delete=models.CASCADE, null=True, blank=True)
    is_primary = models.BooleanField(default=False)
    is_decision_maker = models.BooleanField(default=False)
    notes = models.TextField(blank=True)
    date_of_birth = models.DateField(null=True, blank=True)
    anniversary = models.DateField(null=True, blank=True)
    assigned_to = models.ForeignKey(
        'users.User', 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='assigned_contacts'
    )

    class Meta:
        db_table = 'crm_contacts'
        ordering = ['last_name', 'first_name']

    def __str__(self):
        return f"{self.first_name} {self.last_name}"


class Account(TenantAwareModel):
    name = models.CharField(max_length=200)
    website = models.URLField(blank=True)
    industry = models.CharField(max_length=100, blank=True)
    annual_revenue = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True)
    number_of_employees = models.PositiveIntegerField(null=True, blank=True)
    description = models.TextField(blank=True)
    billing_address = models.TextField(blank=True)
    shipping_address = models.TextField(blank=True)
    phone = models.CharField(max_length=20, blank=True)
    fax = models.CharField(max_length=20, blank=True)
    email = models.EmailField(blank=True)
    account_type = models.CharField(
        max_length=20,
        choices=[
            ('prospect', 'Prospect'),
            ('customer', 'Customer'),
            ('partner', 'Partner'),
            ('vendor', 'Vendor'),
            ('other', 'Other'),
        ],
        default='prospect'
    )
    rating = models.CharField(
        max_length=10,
        choices=[
            ('hot', 'Hot'),
            ('warm', 'Warm'),
            ('cold', 'Cold'),
        ],
        default='cold'
    )
    assigned_to = models.ForeignKey(
        'users.User', 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='assigned_accounts'
    )
    parent_account = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True)

    class Meta:
        db_table = 'crm_accounts'
        ordering = ['name']

    def __str__(self):
        return self.name


class Opportunity(TenantAwareModel):
    name = models.CharField(max_length=200)
    account = models.ForeignKey(Account, on_delete=models.CASCADE, null=True, blank=True)
    contact = models.ForeignKey(Contact, on_delete=models.SET_NULL, null=True, blank=True)
    stage = models.CharField(max_length=20, choices=OpportunityStage.choices, default=OpportunityStage.PROSPECTING)
    amount = models.DecimalField(max_digits=15, decimal_places=2)
    currency = models.CharField(max_length=3, default='USD')
    probability = models.IntegerField(default=0, help_text="Probability of closing (0-100)")
    expected_close_date = models.DateField()
    actual_close_date = models.DateField(null=True, blank=True)
    description = models.TextField(blank=True)
    lead_source = models.CharField(max_length=20, choices=LeadSource.choices, default=LeadSource.OTHER)
    assigned_to = models.ForeignKey(
        'users.User', 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='assigned_opportunities'
    )
    competitor = models.CharField(max_length=200, blank=True)
    next_step = models.CharField(max_length=200, blank=True)

    class Meta:
        db_table = 'crm_opportunities'
        ordering = ['-expected_close_date']

    def __str__(self):
        return self.name


class Activity(TenantAwareModel):
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    activity_type = models.CharField(max_length=20, choices=ActivityType.choices)
    status = models.CharField(
        max_length=20,
        choices=[
            ('planned', 'Planned'),
            ('completed', 'Completed'),
            ('cancelled', 'Cancelled'),
        ],
        default='planned'
    )
    start_date = models.DateTimeField()
    end_date = models.DateTimeField(null=True, blank=True)
    all_day = models.BooleanField(default=False)
    location = models.CharField(max_length=200, blank=True)
    
    # Relations
    lead = models.ForeignKey(Lead, on_delete=models.CASCADE, null=True, blank=True, related_name='activities')
    contact = models.ForeignKey(Contact, on_delete=models.CASCADE, null=True, blank=True, related_name='activities')
    account = models.ForeignKey(Account, on_delete=models.CASCADE, null=True, blank=True, related_name='activities')
    opportunity = models.ForeignKey(Opportunity, on_delete=models.CASCADE, null=True, blank=True, related_name='activities')
    
    assigned_to = models.ForeignKey(
        'users.User', 
        on_delete=models.CASCADE,
        related_name='assigned_activities'
    )
    created_by = models.ForeignKey(
        'users.User', 
        on_delete=models.CASCADE,
        related_name='created_activities'
    )

    class Meta:
        db_table = 'crm_activities'
        ordering = ['-start_date']

    def __str__(self):
        return f"{self.title} - {self.get_activity_type_display()}"


class Note(TenantAwareModel):
    title = models.CharField(max_length=200)
    content = models.TextField()
    
    # Relations
    lead = models.ForeignKey(Lead, on_delete=models.CASCADE, null=True, blank=True, related_name='notes')
    contact = models.ForeignKey(Contact, on_delete=models.CASCADE, null=True, blank=True, related_name='notes')
    account = models.ForeignKey(Account, on_delete=models.CASCADE, null=True, blank=True, related_name='notes')
    opportunity = models.ForeignKey(Opportunity, on_delete=models.CASCADE, null=True, blank=True, related_name='notes')
    
    created_by = models.ForeignKey(
        'users.User', 
        on_delete=models.CASCADE,
        related_name='created_notes'
    )
    is_private = models.BooleanField(default=False)

    class Meta:
        db_table = 'crm_notes'
        ordering = ['-created_at']

    def __str__(self):
        return self.title


class Campaign(TenantAwareModel):
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    status = models.CharField(
        max_length=20,
        choices=[
            ('planning', 'Planning'),
            ('active', 'Active'),
            ('completed', 'Completed'),
            ('cancelled', 'Cancelled'),
        ],
        default='planning'
    )
    start_date = models.DateField()
    end_date = models.DateField()
    budget = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    actual_cost = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    expected_revenue = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True)
    assigned_to = models.ForeignKey(
        'users.User', 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='assigned_campaigns'
    )
    
    class Meta:
        db_table = 'crm_campaigns'
        ordering = ['-created_at']

    def __str__(self):
        return self.name


class CampaignMember(TenantAwareModel):
    campaign = models.ForeignKey(Campaign, on_delete=models.CASCADE, related_name='members')
    lead = models.ForeignKey(Lead, on_delete=models.CASCADE, null=True, blank=True)
    contact = models.ForeignKey(Contact, on_delete=models.CASCADE, null=True, blank=True)
    status = models.CharField(
        max_length=20,
        choices=[
            ('sent', 'Sent'),
            ('responded', 'Responded'),
            ('converted', 'Converted'),
            ('bounced', 'Bounced'),
            ('unsubscribed', 'Unsubscribed'),
        ],
        default='sent'
    )
    response_date = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'crm_campaign_members'
        unique_together = ['campaign', 'lead', 'contact']

    def __str__(self):
        member = self.lead or self.contact
        return f"{self.campaign.name} - {member}"