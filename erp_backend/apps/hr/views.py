from apps.core.views import TenantAwareViewSet
from .models import Employee, Attendance, LeaveRequest, Department, Position, Shift, ShiftAssignment, PerformanceReview, PayrollSlip
from rest_framework import serializers, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .logic import clock_in, clock_out, calculate_payroll, generate_payroll_slip, approve_leave_request, assign_shift, get_employee_schedule
from datetime import datetime

# Serializers
class DepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Department
        fields = '__all__'

class PositionSerializer(serializers.ModelSerializer):
    department_name = serializers.ReadOnlyField(source='department.name')
    class Meta:
        model = Position
        fields = '__all__'

class EmployeeSerializer(serializers.ModelSerializer):
    user_name = serializers.ReadOnlyField(source='user.get_full_name')
    department_name = serializers.ReadOnlyField(source='department.name')
    position_title = serializers.ReadOnlyField(source='position.title')
    branch_name = serializers.ReadOnlyField(source='branch.name')
    
    class Meta:
        model = Employee
        fields = '__all__'

class AttendanceSerializer(serializers.ModelSerializer):
    employee_name = serializers.ReadOnlyField(source='employee.user.get_full_name')
    class Meta:
        model = Attendance
        fields = '__all__'

class LeaveRequestSerializer(serializers.ModelSerializer):
    employee_name = serializers.ReadOnlyField(source='employee.user.get_full_name')
    approved_by_name = serializers.ReadOnlyField(source='approved_by.get_full_name')
    class Meta:
        model = LeaveRequest
        fields = '__all__'

class ShiftSerializer(serializers.ModelSerializer):
    class Meta:
        model = Shift
        fields = '__all__'

class ShiftAssignmentSerializer(serializers.ModelSerializer):
    employee_name = serializers.ReadOnlyField(source='employee.user.get_full_name')
    shift_name = serializers.ReadOnlyField(source='shift.name')
    class Meta:
        model = ShiftAssignment
        fields = '__all__'

class PerformanceReviewSerializer(serializers.ModelSerializer):
    employee_name = serializers.ReadOnlyField(source='employee.user.get_full_name')
    reviewer_name = serializers.ReadOnlyField(source='reviewer.get_full_name')
    class Meta:
        model = PerformanceReview
        fields = '__all__'

class PayrollSlipSerializer(serializers.ModelSerializer):
    employee_name = serializers.ReadOnlyField(source='employee.user.get_full_name')
    class Meta:
        model = PayrollSlip
        fields = '__all__'

# ViewSets
class DepartmentViewSet(TenantAwareViewSet):
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer

class PositionViewSet(TenantAwareViewSet):
    queryset = Position.objects.all()
    serializer_class = PositionSerializer

class EmployeeViewSet(TenantAwareViewSet):
    queryset = Employee.objects.all()
    serializer_class = EmployeeSerializer

    @action(detail=True, methods=['post'])
    def clock_in(self, request, pk=None):
        try:
            att = clock_in(pk)
            return Response({
                'status': 'clocked_in',
                'time': att.clock_in,
                'attendance_id': att.id
            })
        except ValueError as e:
            return Response({'error': str(e)}, status=400)

    @action(detail=True, methods=['post'])
    def clock_out(self, request, pk=None):
        try:
            att = clock_out(pk)
            return Response({
                'status': 'clocked_out',
                'time': att.clock_out,
                'hours_worked': float(att.hours_worked) if att.hours_worked else 0,
                'overtime_hours': float(att.overtime_hours)
            })
        except Exception as e:
            return Response({'error': str(e)}, status=400)
    
    @action(detail=True, methods=['get'])
    def payroll(self, request, pk=None):
        employee = self.get_object()
        start = request.query_params.get('start')
        end = request.query_params.get('end')
        if not start or not end:
            return Response({'error': 'start and end dates required'}, status=400)
        
        report = calculate_payroll(employee, start, end)
        return Response(report)
    
    @action(detail=True, methods=['post'])
    def generate_payslip(self, request, pk=None):
        employee = self.get_object()
        start = request.data.get('period_start')
        end = request.data.get('period_end')
        bonuses = request.data.get('bonuses', 0)
        allowances = request.data.get('allowances', 0)
        
        if not start or not end:
            return Response({'error': 'period_start and period_end required'}, status=400)
        
        slip = generate_payroll_slip(employee, start, end, bonuses, allowances)
        return Response(PayrollSlipSerializer(slip).data)
    
    @action(detail=True, methods=['get'])
    def schedule(self, request, pk=None):
        employee = self.get_object()
        start = request.query_params.get('start')
        end = request.query_params.get('end')
        
        if not start or not end:
            return Response({'error': 'start and end dates required'}, status=400)
        
        schedule = get_employee_schedule(employee, start, end)
        return Response(schedule)

class AttendanceViewSet(TenantAwareViewSet):
    queryset = Attendance.objects.all()
    serializer_class = AttendanceSerializer
    filterset_fields = ['employee', 'date', 'status']

class LeaveRequestViewSet(TenantAwareViewSet):
    queryset = LeaveRequest.objects.all()
    serializer_class = LeaveRequestSerializer
    filterset_fields = ['employee', 'status', 'leave_type']
    
    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        try:
            leave_request = approve_leave_request(
                pk,
                request.user,
                approved=True
            )
            return Response({
                'status': 'approved',
                'leave_request': LeaveRequestSerializer(leave_request).data
            })
        except ValueError as e:
            return Response({'error': str(e)}, status=400)
    
    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        reason = request.data.get('reason', '')
        try:
            leave_request = approve_leave_request(
                pk,
                request.user,
                approved=False,
                rejection_reason=reason
            )
            return Response({
                'status': 'rejected',
                'leave_request': LeaveRequestSerializer(leave_request).data
            })
        except ValueError as e:
            return Response({'error': str(e)}, status=400)

class ShiftViewSet(TenantAwareViewSet):
    queryset = Shift.objects.all()
    serializer_class = ShiftSerializer

class ShiftAssignmentViewSet(TenantAwareViewSet):
    queryset = ShiftAssignment.objects.all()
    serializer_class = ShiftAssignmentSerializer
    filterset_fields = ['employee', 'shift', 'date']

class PerformanceReviewViewSet(TenantAwareViewSet):
    queryset = PerformanceReview.objects.all()
    serializer_class = PerformanceReviewSerializer
    filterset_fields = ['employee', 'status']

class PayrollSlipViewSet(TenantAwareViewSet):
    queryset = PayrollSlip.objects.all()
    serializer_class = PayrollSlipSerializer
    filterset_fields = ['employee', 'status']
    
    @action(detail=True, methods=['post'])
    def mark_paid(self, request, pk=None):
        slip = self.get_object()
        slip.status = 'paid'
        slip.payment_date = datetime.now().date()
        slip.payment_method = request.data.get('payment_method', 'bank_transfer')
        slip.save()
        return Response(PayrollSlipSerializer(slip).data)
