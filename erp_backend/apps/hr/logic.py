from django.utils import timezone
from .models import Attendance, Employee, LeaveRequest, PayrollSlip, ShiftAssignment
from decimal import Decimal
from datetime import datetime, timedelta

def clock_in(employee_id):
    employee = Employee.objects.get(id=employee_id)
    now = timezone.now()
    
    # Check if already clocked in but not clocked out today
    if Attendance.objects.filter(employee=employee, date=now.date(), clock_out__isnull=True).exists():
        raise ValueError("Already clocked in")
        
    return Attendance.objects.create(
        tenant=employee.tenant,
        employee=employee,
        date=now.date(),
        clock_in=now
    )

def clock_out(employee_id):
    employee = Employee.objects.get(id=employee_id)
    now = timezone.now()
    
    attendance = Attendance.objects.filter(
        employee=employee, 
        date=now.date(), 
        clock_out__isnull=True
    ).latest('clock_in')
    
    attendance.clock_out = now
    
    # Calculate hours worked
    duration = now - attendance.clock_in
    hours = Decimal(duration.total_seconds() / 3600)
    attendance.hours_worked = hours
    
    # Calculate overtime (assuming 8 hour workday)
    if hours > 8:
        attendance.overtime_hours = hours - 8
    
    attendance.save()
    return attendance

def calculate_payroll(employee, period_start, period_end):
    """Calculate payroll for an employee for a given period"""
    attendances = Attendance.objects.filter(
        employee=employee,
        date__range=[period_start, period_end]
    )
    
    total_hours = Decimal(0)
    overtime_hours = Decimal(0)
    days_worked = 0
    
    for att in attendances:
        if att.clock_in and att.clock_out:
            duration = att.clock_out - att.clock_in
            hours = Decimal(duration.total_seconds() / 3600)
            total_hours += hours
            days_worked += 1
            
            if hours > 8:
                overtime_hours += (hours - 8)
    
    # Calculate pay
    if employee.salary_type == 'monthly':
        basic_salary = employee.salary
        hourly_rate = employee.salary / Decimal(160)  # Assuming 160 hours/month
    elif employee.salary_type == 'hourly':
        hourly_rate = employee.salary
        basic_salary = hourly_rate * total_hours
    else:  # daily
        basic_salary = employee.salary * days_worked
        hourly_rate = employee.salary / Decimal(8)
    
    overtime_pay = overtime_hours * hourly_rate * Decimal(1.5)  # 1.5x for overtime
    
    return {
        'employee': employee.user.get_full_name(),
        'employee_id': employee.employee_id,
        'period_start': period_start,
        'period_end': period_end,
        'days_worked': days_worked,
        'hours_worked': round(total_hours, 2),
        'overtime_hours': round(overtime_hours, 2),
        'basic_salary': round(basic_salary, 2),
        'overtime_pay': round(overtime_pay, 2),
        'gross_pay': round(basic_salary + overtime_pay, 2)
    }

def generate_payroll_slip(employee, period_start, period_end, bonuses=0, allowances=0, tax_rate=0.15):
    """Generate a complete payroll slip"""
    payroll_data = calculate_payroll(employee, period_start, period_end)
    
    basic_salary = Decimal(payroll_data['basic_salary'])
    overtime_pay = Decimal(payroll_data['overtime_pay'])
    bonuses = Decimal(bonuses)
    allowances = Decimal(allowances)
    
    gross_salary = basic_salary + overtime_pay + bonuses + allowances
    
    # Calculate deductions
    tax = gross_salary * Decimal(tax_rate)
    insurance = Decimal(0)  # Can be configured
    other_deductions = Decimal(0)
    
    total_deductions = tax + insurance + other_deductions
    net_salary = gross_salary - total_deductions
    
    # Create payroll slip
    slip = PayrollSlip.objects.create(
        tenant=employee.tenant,
        employee=employee,
        period_start=period_start,
        period_end=period_end,
        basic_salary=basic_salary,
        overtime_pay=overtime_pay,
        bonuses=bonuses,
        allowances=allowances,
        tax=tax,
        insurance=insurance,
        other_deductions=other_deductions,
        gross_salary=gross_salary,
        net_salary=net_salary,
        days_worked=payroll_data['days_worked'],
        hours_worked=payroll_data['hours_worked'],
        overtime_hours=payroll_data['overtime_hours'],
        status='processed'
    )
    
    return slip

def approve_leave_request(leave_request_id, approver_user, approved=True, rejection_reason=''):
    """Approve or reject a leave request"""
    leave_request = LeaveRequest.objects.get(id=leave_request_id)
    
    if leave_request.status != 'pending':
        raise ValueError("Leave request is not pending")
    
    if approved:
        # Check if employee has enough leave balance
        employee = leave_request.employee
        days = leave_request.days_requested
        
        if leave_request.leave_type == 'annual':
            if employee.annual_leave_balance < days:
                raise ValueError("Insufficient annual leave balance")
            employee.annual_leave_balance -= days
        elif leave_request.leave_type == 'sick':
            if employee.sick_leave_balance < days:
                raise ValueError("Insufficient sick leave balance")
            employee.sick_leave_balance -= days
        
        employee.save()
        
        leave_request.status = 'approved'
        leave_request.approved_by = approver_user
        leave_request.approved_at = timezone.now()
    else:
        leave_request.status = 'rejected'
        leave_request.rejection_reason = rejection_reason
    
    leave_request.save()
    return leave_request

def assign_shift(employee, shift, date):
    """Assign an employee to a shift for a specific date"""
    assignment, created = ShiftAssignment.objects.get_or_create(
        tenant=employee.tenant,
        employee=employee,
        date=date,
        defaults={'shift': shift}
    )
    
    if not created:
        assignment.shift = shift
        assignment.save()
    
    return assignment

def get_employee_schedule(employee, start_date, end_date):
    """Get employee's shift schedule for a date range"""
    assignments = ShiftAssignment.objects.filter(
        employee=employee,
        date__range=[start_date, end_date]
    ).select_related('shift')
    
    schedule = []
    for assignment in assignments:
        schedule.append({
            'date': assignment.date,
            'shift_name': assignment.shift.name,
            'start_time': assignment.shift.start_time,
            'end_time': assignment.shift.end_time,
        })
    
    return schedule
