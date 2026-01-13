import os
import django
import sys
import uuid

# Setup Django environment
sys.path.append(os.getcwd())
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.tenants.models import Tenant, Branch
from apps.users.models import User
from apps.inventory.models import Category, Product, BranchStock
from apps.sales.models import Customer
from django.utils.text import slugify

def seed_data():
    print("Seed process started...")
    
    # Create Tenant 1
    t1 = Tenant.objects.create(name="Global Retail Corp", subdomain="global-retail")
    b1_hq = Branch.objects.create(tenant=t1, name="NYC Head Office", code="HQ-01", is_hq=True, address="Wall St, NY", phone="123456")
    b1_br = Branch.objects.create(tenant=t1, name="Brooklyn Store", code="ST-01", address="Brooklyn, NY", phone="789012")
    
    # Create Tenant 2
    t2 = Tenant.objects.create(name="Aura Fashion", subdomain="aura-fashion")
    b2_hq = Branch.objects.create(tenant=t2, name="Paris Studio", code="PS-01", is_hq=True, address="Champs-Élysées, Paris", phone="331234")
    
    # Create Admin Users
    User.objects.create_superuser('admin', 'admin@erp.com', 'admin_pass', tenant=t1)
    
    # Create Inventory for T1
    cat1 = Category.objects.create(tenant=t1, name="Electronics")
    p1 = Product.objects.create(tenant=t1, category=cat1, name="Smartphone X", sku="SP-X", price=999, cost_price=600)
    
    BranchStock.objects.create(tenant=t1, branch=b1_hq, product=p1, quantity=100)
    BranchStock.objects.create(tenant=t1, branch=b1_br, product=p1, quantity=25)
    
    # Create Customers
    Customer.objects.create(tenant=t1, name="John Doe", email="john@example.com")
    
    print("Seed data created successfully!")

if __name__ == "__main__":
    seed_data()
