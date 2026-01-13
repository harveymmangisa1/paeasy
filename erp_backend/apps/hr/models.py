from django.db import models
from apps.core.models import TenantAwareModel
from django.conf import settings

class Department(TenantAwareModel):
    """Organizational departments"""
    name = models.CharField(max_length=100)
    code = models.CharField(max_length=20)
    manager = models.ForeignKey('Employee', on_delete=models.SET_NULL, null=True, blank=True, related_name='managed_departments')
    description = models.TextField(blank=True)
    
    class Meta:
        unique_together = ('tenant', 'code')
    
    def __str__(self):
        return self.name

class Position(TenantAwareModel):
    """Job positions/titles"""
    title = models.CharField(max_length=100)
    department = models.ForeignKey(Department, on_delete=models.CASCADE, related_name='positions')
    level = models.IntegerField(default=1)  # 1=Entry, 2=Mid, 3=Senior, 4=Lead, 5=Executive
    min_salary = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    max_salary = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    
    def __str__(self):
        return f"{self.title} - {self.department.name}"

class Employee(TenantAwareModel):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='employee_profile')
    employee_id = models.CharField(max_length=50)
    branch = models.ForeignKey('tenants.Branch', on_delete=models.SET_NULL, null=True, related_name='employees')
    
    # Enhanced fields
    department = models.ForeignKey(Department, on_delete=models.SET_NULL, null=True, related_name='employees')
    position = models.ForeignKey(Position, on_delete=models.SET_NULL, null=True, related_name='employees')
    designation = models.CharField(max_length=100)  # Keep for backward compatibility
    
    joining_date = models.DateField()
    probation_end_date = models.DateField(null=True, blank=True)
    
    # Compensation
    salary = models.DecimalField(max_digits=12, decimal_places=2)
    salary_type = models.CharField(max_length=20, default='monthly')  # monthly, hourly, daily
    
    # Personal Info
    date_of_birth = models.DateField(null=True, blank=True)
    gender = models.CharField(max_length=10, blank=True)
    phone = models.CharField(max_length=20, blank=True)
    emergency_contact = models.CharField(max_length=100, blank=True)
    emergency_phone = models.CharField(max_length=20, blank=True)
    address = models.TextField(blank=True)
    
    # Employment Status
    EMPLOYMENT_STATUS = (
        ('active', 'Active'),
        ('probation', 'Probation'),
        ('suspended', 'Suspended'),
        ('terminated', 'Terminated'),
        ('resigned', 'Resigned'),
    )
    employment_status = models.CharField(max_length=20, choices=EMPLOYMENT_STATUS, default='probation')
    
    # Leave Balances
    annual_leave_balance = models.IntegerField(default=21)  # Days
    sick_leave_balance = models.IntegerField(default=10)
    
    class Meta:
        unique_together = ('tenant', 'employee_id')
    
    def __str__(self):
        return f"{self.employee_id} - {self.user.get_full_name()}"

class Attendance(TenantAwareModel):
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='attendance')
    date = models.DateField()
    clock_in = models.DateTimeField()
    clock_out = models.DateTimeField(null=True, blank=True)
    
    STATUS_CHOICES = (
        ('present', 'Present'),
        ('absent', 'Absent'),
        ('leave', 'On Leave'),
        ('half_day', 'Half Day'),
        ('late', 'Late'),
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='present')
    
    # Calculated fields
    hours_worked = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    overtime_hours = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    
    notes = models.TextField(blank=True)
    
    class Meta:
        unique_together = ('tenant', 'employee', 'date')

class LeaveRequest(TenantAwareModel):
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='leave_requests')
    
    LEAVE_TYPES = (
        ('annual', 'Annual Leave'),
        ('sick', 'Sick Leave'),
        ('maternity', 'Maternity Leave'),
        ('paternity', 'Paternity Leave'),
        ('unpaid', 'Unpaid Leave'),
        ('emergency', 'Emergency Leave'),
    )
    leave_type = models.CharField(max_length=50, choices=LEAVE_TYPES)
    
    start_date = models.DateField()
    end_date = models.DateField()
    days_requested = models.IntegerField()
    
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('cancelled', 'Cancelled'),
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    
    reason = models.TextField()
    rejection_reason = models.TextField(blank=True)
    
    approved_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='approved_leaves')
    approved_at = models.DateTimeField(null=True, blank=True)

class Shift(TenantAwareModel):
    """Work shift definitions"""
    name = models.CharField(max_length=100)  # Morning, Evening, Night
    start_time = models.TimeField()
    end_time = models.TimeField()
    branch = models.ForeignKey('tenants.Branch', on_delete=models.CASCADE, related_name='shifts')
    
    # Break configuration
    break_duration = models.IntegerField(default=60)  # minutes
    
    def __str__(self):
        return f"{self.name} ({self.start_time} - {self.end_time})"

class ShiftAssignment(TenantAwareModel):
    """Assign employees to shifts"""
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='shift_assignments')
    shift = models.ForeignKey(Shift, on_delete=models.CASCADE)
    date = models.DateField()
    
    class Meta:
        unique_together = ('tenant', 'employee', 'date')

class PerformanceReview(TenantAwareModel):
    """Employee performance evaluations"""
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='performance_reviews')
    reviewer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='conducted_reviews')
    
    review_period_start = models.DateField()
    review_period_end = models.DateField()
    
    # Ratings (1-5 scale)
    quality_of_work = models.IntegerField(default=3)
    productivity = models.IntegerField(default=3)
    communication = models.IntegerField(default=3)
    teamwork = models.IntegerField(default=3)
    punctuality = models.IntegerField(default=3)
    
    overall_rating = models.DecimalField(max_digits=3, decimal_places=2, null=True, blank=True)
    
    strengths = models.TextField(blank=True)
    areas_for_improvement = models.TextField(blank=True)
    goals = models.TextField(blank=True)
    
    STATUS_CHOICES = (
        ('draft', 'Draft'),
        ('submitted', 'Submitted'),
        ('acknowledged', 'Acknowledged by Employee'),
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    
    def save(self, *args, **kwargs):
        # Auto-calculate overall rating
        ratings = [self.quality_of_work, self.productivity, self.communication, self.teamwork, self.punctuality]
        self.overall_rating = sum(ratings) / len(ratings)
        super().save(*args, **kwargs)

class PayrollSlip(TenantAwareModel):
    """Monthly payroll records"""
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='payroll_slips')
    
    period_start = models.DateField()
    period_end = models.DateField()
    
    # Earnings
    basic_salary = models.DecimalField(max_digits=12, decimal_places=2)
    overtime_pay = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    bonuses = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    allowances = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    
    # Deductions
    tax = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    insurance = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    other_deductions = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    
    # Totals
    gross_salary = models.DecimalField(max_digits=12, decimal_places=2)
    net_salary = models.DecimalField(max_digits=12, decimal_places=2)
    
    # Attendance summary
    days_worked = models.IntegerField(default=0)
    hours_worked = models.DecimalField(max_digits=6, decimal_places=2, default=0)
    overtime_hours = models.DecimalField(max_digits=6, decimal_places=2, default=0)
    
    STATUS_CHOICES = (
        ('draft', 'Draft'),
        ('processed', 'Processed'),
        ('paid', 'Paid'),
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    
    payment_date = models.DateField(null=True, blank=True)
    payment_method = models.CharField(max_length=50, blank=True)
    
    notes = models.TextField(blank=True)
    
    class Meta:
        unique_together = ('tenant', 'employee', 'period_start', 'period_end')
