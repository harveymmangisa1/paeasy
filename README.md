# ERP Scaffold Setup Guide

This project is a multitenant, multibranch ERP system scaffold built with Django and React.

## Backend Setup (Django)

1. **Navigate to backend**: `cd erp_backend`
2. **Install dependencies**: `pip install -r requirements.txt`
3. **Run migrations**:
   ```bash
   python manage.py makemigrations core tenants users inventory sales accounting hr
   python manage.py migrate
   ```
4. **Seed data**: `python seed_data.py`
5. **Start server**: `python manage.py runserver`

## Frontend Setup (React)

1. **Navigate to frontend**: `cd erp_frontend`
2. **Install dependencies**: `npm install`
3. **Start dev server**: `npm run dev`

## Docker Setup (Recommended)

Run the entire system in one command:
```bash
docker-compose up --build
```

## Key API Endpoints

- Swaggger UI: `http://localhost:8000/api/docs/`
- POS Sync: `POST /api/sales/sync/sales`
- Dashboard Stats: `GET /api/analytics/dashboard/`

## Features Included
- **Multitenancy**: Tenant isolation via middleware and base models.
- **Hierarchical Branches**: HQ vs Branch access levels.
- **POS Integration**: Real-time sales sync and inventory deduction.
- **Modular Frontend**: Separate modules for Inventory, Sales, etc.
- **Design System**: Glassmorphism UI with Tailwind CSS.
