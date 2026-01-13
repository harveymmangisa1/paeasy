from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    EmployeeViewSet, DepartmentViewSet, PositionViewSet,
    AttendanceViewSet, LeaveRequestViewSet, ShiftViewSet,
    ShiftAssignmentViewSet, PerformanceReviewViewSet, PayrollSlipViewSet
)

router = DefaultRouter()
router.register(r'employees', EmployeeViewSet)
router.register(r'departments', DepartmentViewSet)
router.register(r'positions', PositionViewSet)
router.register(r'attendance', AttendanceViewSet)
router.register(r'leave-requests', LeaveRequestViewSet)
router.register(r'shifts', ShiftViewSet)
router.register(r'shift-assignments', ShiftAssignmentViewSet)
router.register(r'performance-reviews', PerformanceReviewViewSet)
router.register(r'payroll-slips', PayrollSlipViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
