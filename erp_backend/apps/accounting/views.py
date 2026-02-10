from apps.core.views import TenantAwareViewSet
from .models import Account, JournalEntry, LedgerLine, Tax, Vendor, Bill
from rest_framework import serializers
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Sum

class AccountSerializer(serializers.ModelSerializer):
    balance = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    class Meta:
        model = Account
        fields = '__all__'

class TaxSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tax
        fields = '__all__'

class VendorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vendor
        fields = '__all__'

class LedgerLineSerializer(serializers.ModelSerializer):
    account_name = serializers.CharField(source='account.name', read_only=True)
    account_code = serializers.CharField(source='account.code', read_only=True)
    class Meta:
        model = LedgerLine
        fields = '__all__'

class JournalEntrySerializer(serializers.ModelSerializer):
    lines = LedgerLineSerializer(many=True)
    class Meta:
        model = JournalEntry
        fields = '__all__'

    def create(self, validated_data):
        lines_data = validated_data.pop('lines')
        from .logic import create_journal_entry
        return create_journal_entry(
            tenant=validated_data['tenant'],
            branch=validated_data['branch'],
            date=validated_data['date'],
            description=validated_data['description'],
            lines=lines_data,
            reference=validated_data.get('reference', '')
        )

class BillSerializer(serializers.ModelSerializer):
    vendor_name = serializers.CharField(source='vendor.name', read_only=True)
    class Meta:
        model = Bill
        fields = '__all__'

class AccountViewSet(TenantAwareViewSet):
    queryset = Account.objects.all()
    serializer_class = AccountSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        # Annotate with balance (simplified version)
        for acc in qs:
            debits = LedgerLine.objects.filter(account=acc).aggregate(Sum('debit'))['debit__sum'] or 0
            credits = LedgerLine.objects.filter(account=acc).aggregate(Sum('credit'))['credit__sum'] or 0
            acc.balance = debits - credits
        return qs

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

class TaxViewSet(TenantAwareViewSet):
    queryset = Tax.objects.all()
    serializer_class = TaxSerializer

class VendorViewSet(TenantAwareViewSet):
    queryset = Vendor.objects.all()
    serializer_class = VendorSerializer

class JournalEntryViewSet(TenantAwareViewSet):
    queryset = JournalEntry.objects.all()
    serializer_class = JournalEntrySerializer

class BillViewSet(TenantAwareViewSet):
    queryset = Bill.objects.all()
    serializer_class = BillSerializer

class TransactionViewSet(TenantAwareViewSet):
    """
    Lightweight transactions view backed by LedgerLine for UI compatibility.
    """
    queryset = LedgerLine.objects.all()
    serializer_class = LedgerLineSerializer

class AccountingStatsViewSet(TenantAwareViewSet):
    """
    Simple stats endpoint placeholder for dashboards.
    """
    queryset = Account.objects.all()
    serializer_class = AccountSerializer

    @action(detail=False, methods=['get'])
    def summary(self, request):
        accounts = Account.objects.filter(tenant=request.tenant_id)
        totals = {
            'total_assets': 0,
            'total_liabilities': 0,
            'monthly_revenue': 0,
            'monthly_expenses': 0,
        }
        for acc in accounts:
            debits = LedgerLine.objects.filter(account=acc).aggregate(Sum('debit'))['debit__sum'] or 0
            credits = LedgerLine.objects.filter(account=acc).aggregate(Sum('credit'))['credit__sum'] or 0
            balance = debits - credits
            if acc.account_type == 'asset':
                totals['total_assets'] += balance
            if acc.account_type == 'liability':
                totals['total_liabilities'] += balance
            if acc.account_type == 'revenue':
                totals['monthly_revenue'] += credits - debits
            if acc.account_type == 'expense':
                totals['monthly_expenses'] += debits - credits
        return Response(totals)
