from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    LeadViewSet, ContactViewSet, AccountViewSet, OpportunityViewSet,
    ActivityViewSet, NoteViewSet, CampaignViewSet, CampaignMemberViewSet
)

router = DefaultRouter()
router.register(r'leads', LeadViewSet)
router.register(r'contacts', ContactViewSet)
router.register(r'accounts', AccountViewSet)
router.register(r'opportunities', OpportunityViewSet)
router.register(r'activities', ActivityViewSet)
router.register(r'notes', NoteViewSet)
router.register(r'campaigns', CampaignViewSet)
router.register(r'campaign-members', CampaignMemberViewSet)

urlpatterns = [
    path('', include(router.urls)),
]