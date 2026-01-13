from apps.core.views import TenantAwareViewSet
from .models import Account, JournalEntry, LedgerLine
from rest_framework import serializers
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Sum

class AccountSerializer(serializers.ModelSerializer):
    class Meta:
        model = Account
        fields = '__all__'

class LedgerLineSerializer(serializers.ModelSerializer):
    class Meta:
        model = LedgerLine
        fields = '__all__'

class JournalEntrySerializer(serializers.ModelSerializer):
    lines = LedgerLineSerializer(many=True, read_only=True)
    class Meta:
        model = JournalEntry
        fields = '__all__'

class AccountViewSet(TenantAwareViewSet):
    queryset = Account.objects.all()
    serializer_class = AccountSerializer

    @action(detail=False, methods=['get'])
    def trial_balance(self, request):
        accounts = Account.objects.filter(tenant=request.tenant_id)
        data = []
        for acc in accounts:
            debit = LedgerLine.objects.filter(account=acc).aggregate(Sum('debit'))['debit__sum'] or 0
            credit = LedgerLine.objects.filter(account=acc).aggregate(Sum('credit'))['credit__sum'] or 0
            data.append({
                'account': acc.name,
                'code': acc.code,
                'debit': debit,
                'credit': credit,
                'balance': debit - credit
            })
        return Response(data)

class JournalEntryViewSet(TenantAwareViewSet):
    queryset = JournalEntry.objects.all()
    serializer_class = JournalEntrySerializer
