# PaeasyShop POS System

## 🏪 **Modern Cloud-Based Point of Sale System**

A professional, feature-rich POS system built with **Next.js** and **Supabase** for retail shops. Designed for reliability, security, and real-time multi-device synchronization.

---

## ⚡ **Key Features**

### **Cloud-First Architecture** (Powered by Supabase)
- ✅ **Real-time Sync**: All POS terminals stay synchronized
- ✅ **Cloud Backup**: Automatic backup of all sales data
- ✅ **Multi-Device**: Unlimited POS terminals per shop
- ✅ **Remote Admin**: Manage from anywhere via web dashboard
- ✅ **Offline Mode**: Works without internet, syncs when reconnected

### **Sales & Checkout**
- ✅ Modern, fast checkout interface
- ✅ Barcode scanner support
- ✅ Multiple payment methods (Cash, Mobile Money, Card, Credit)
- ✅ Keyboard shortcuts (F1-F4) for speed
- ✅ Receipt printing ready
- ✅ Discount and tax calculations

### **Inventory Management**
- ✅ Product catalog with categories
- ✅ Stock level tracking
- ✅ Low stock alerts
- ✅ Barcode support
- ✅ Cost and selling price management
- ✅ CSV export/import

### **User Management**
- ✅ Role-based access (Admin, Manager, Cashier)
- ✅ Secure authentication (Email + PIN)
- ✅ Permission system
- ✅ Activity tracking
- ✅ Cloud-synced user accounts

### **Reports & Analytics**
- ✅ Daily sales summaries
- ✅ Z-Reports (end-of-day cashier reports)
- ✅ Product performance analytics
- ✅ Payment method analysis
- ✅ Staff performance tracking
- ✅ PDF export

---

## 🚀 **QUICK START** (15 minutes)

### **Prerequisites**
- Node.js 18+ installed
- Supabase account (free tier works!)
- Internet connection

### **1. Clone & Install**
```bash
git clone <your-repo>
cd paeasyshop
npm install
```

### **2. Set Up Supabase** ⚠️ **REQUIRED**

**This is the most important step!**

1. **Create Supabase Project**:
   - Go to https://supabase.com
   - Create new project (takes 2-3 minutes)
   - Copy your API keys

2. **Configure Environment**:
   ```bash
   # Create .env.local file
   cp .env.example .env.local
   
   # Edit .env.local and add your Supabase keys:
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

3. **Create Database Tables**:
   - Open Supabase Dashboard → SQL Editor
   - Copy contents of `SUPABASE_SCHEMA.sql`
   - Paste and run in SQL Editor
   - Verify 4 tables created: `tenants`, `staff`, `products`, `sales`

4. **Create Admin User**:
   - Supabase Dashboard → Authentication → Users
   - Add user with your email
   - Copy the User ID (UUID)
   - Add to `staff` table with `role='admin'`

**📖 Detailed Guide**: See `SUPABASE_SETUP_REQUIRED.md`

### **3. Run the Application**
```bash
npm run dev
```

Open http://localhost:9003 and login with your admin credentials!

---

## 📦 **DEPLOYMENT**

### **Web App (Admin Dashboard)**
```bash
# Deploy to Vercel
vercel deploy --prod

# Add environment variables in Vercel:
# - NEXT_PUBLIC_SUPABASE_URL
# - NEXT_PUBLIC_SUPABASE_ANON_KEY  
# - SUPABASE_SERVICE_ROLE_KEY
```

### **Desktop App (POS Terminals)**
```bash
# Build Windows installer
npm run electron-build

# Installer will be in dist/ folder
# Install on each POS machine
```

---

## 📚 **DOCUMENTATION**

| Document | Purpose |
|----------|---------|
| **SUPABASE_SETUP_REQUIRED.md** | ⭐ **START HERE** - Complete Supabase setup guide |
| **DELIVERY_SUMMARY.md** | System overview and delivery checklist |
| **PRE_DELIVERY_CHECKLIST.md** | Testing protocol before deployment |
| **ADMIN_USER_MANAGEMENT.md** | How to create and manage users |
| **ENV_SETUP.md** | Environment variables reference |
| **QUICK_FIX.md** | Troubleshooting common issues |
| **Help Page** (`/help`) | In-app user guide with keyboard shortcuts |

---

## 🎯 **TECH STACK**

- **Frontend**: Next.js 15, React 18, TypeScript
- **UI**: Shadcn/UI, Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth + bcrypt
- **Local Storage**: Dexie (IndexedDB)
- **Desktop**: Electron
- **Deployment**: Vercel (web), Electron Builder (desktop)

---

## 🔐 **SECURITY FEATURES**

- ✅ Password hashing (bcrypt)
- ✅ Supabase Row Level Security (RLS)
- ✅ Role-based permissions
- ✅ Secure API routes
- ✅ Environment variable protection
- ✅ Auto-logout on inactivity

---

## 📱 **SUPPORT**

**Helpline**: +265 999 771 155  
**Available**: 24/7 for urgent support

**In-App Help**: Navigate to Help page for complete user guide

---

## 🎨 **SCREENSHOTS**

### Modern Sales Interface
- Clean, minimal corporate design
- Keyboard shortcuts for speed
- Real-time cart updates

### Admin Dashboard
- Sales analytics at a glance
- Low stock alerts
- Quick action buttons

### Cloud Sync
- Automatic background sync every 60 seconds
- Works offline, syncs when reconnected
- Real-time inventory updates

---

## ⚙️ **CONFIGURATION**

### **Keyboard Shortcuts**
- `F1` - Focus barcode scanner
- `F2` - Focus product search
- `F3` - Clear cart
- `F4` - Open checkout

### **Sync Settings**
- Interval: 60 seconds (configurable in `src/lib/sync.ts`)
- Automatic retry on failure
- Offline queue for pending sales

---

## 🚨 **IMPORTANT NOTES**

### **Supabase is REQUIRED for Production**

While the system can run locally for testing, **Supabase is essential** for:
- Multi-device synchronization
- Cloud backup
- Admin dashboard access
- User management
- Scalability

**Without Supabase, you lose 80% of the system's capabilities!**

### **First-Time Setup**
1. ✅ Set up Supabase (15 minutes)
2. ✅ Create admin user
3. ✅ Test login and sync
4. ✅ Deploy to production

---

## 📊 **SYSTEM REQUIREMENTS**

### **Web App**
- Modern browser (Chrome, Firefox, Edge, Safari)
- Internet connection for cloud sync
- 2GB RAM minimum

### **Desktop App**
- Windows 10/11
- 4GB RAM minimum
- 500MB disk space
- USB port for barcode scanner (optional)

---

## 🔄 **UPDATE PROCESS**

```bash
# Pull latest changes
git pull origin main

# Install new dependencies
npm install

# Run database migrations (if any)
# Check SUPABASE_SCHEMA.sql for updates

# Restart application
npm run dev
```

---

## 📈 **ROADMAP**

- [ ] Multi-tenancy support
- [ ] Receipt printer integration
- [ ] Mobile app (React Native)
- [ ] Advanced analytics dashboard
- [ ] Loyalty program integration
- [ ] Email notifications
- [ ] Automated inventory ordering

---

## 📄 **LICENSE**

Proprietary - All rights reserved

---

## 🙏 **ACKNOWLEDGMENTS**

Built with:
- Next.js
- Supabase
- Shadcn/UI
- Electron
- Dexie

---

## ✅ **READY TO DEPLOY**

**Version**: 1.0  
**Status**: Production Ready  
**Last Updated**: December 4, 2025

**Start with**: `SUPABASE_SETUP_REQUIRED.md` → 15 minutes to full deployment! 🚀
