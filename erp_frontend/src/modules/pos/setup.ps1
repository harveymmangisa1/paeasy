# Setup Script for PaeasyShop

Write-Host "🚀 Setting up PaeasyShop..." -ForegroundColor Cyan

# Step 1: Clean npm cache
Write-Host "`n📦 Cleaning npm cache..." -ForegroundColor Yellow
npm cache clean --force

# Step 2: Remove node_modules if exists
Write-Host "`n🗑️  Removing old node_modules..." -ForegroundColor Yellow
if (Test-Path "node_modules") {
    Remove-Item -Recurse -Force node_modules
    Write-Host "✅ node_modules removed" -ForegroundColor Green
} else {
    Write-Host "✅ No node_modules to remove" -ForegroundColor Green
}

# Step 3: Remove package-lock.json if exists
Write-Host "`n🗑️  Removing package-lock.json..." -ForegroundColor Yellow
if (Test-Path "package-lock.json") {
    Remove-Item -Force package-lock.json
    Write-Host "✅ package-lock.json removed" -ForegroundColor Green
} else {
    Write-Host "✅ No package-lock.json to remove" -ForegroundColor Green
}

# Step 4: Install dependencies
Write-Host "`n📥 Installing dependencies..." -ForegroundColor Yellow
npm install

# Step 5: Install Supabase client
Write-Host "`n🔧 Installing Supabase client..." -ForegroundColor Yellow
npm install @supabase/supabase-js

# Step 6: Check if .env.local exists
Write-Host "`n🔐 Checking environment variables..." -ForegroundColor Yellow
if (Test-Path ".env.local") {
    Write-Host "✅ .env.local found" -ForegroundColor Green
} else {
    Write-Host "⚠️  .env.local not found - creating template..." -ForegroundColor Red
    @"
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your-project-url-here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Optional: For server-side operations
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
"@ | Out-File -FilePath ".env.local" -Encoding UTF8
    Write-Host "✅ .env.local template created - please add your Supabase credentials" -ForegroundColor Yellow
}

Write-Host "`n✨ Setup complete!" -ForegroundColor Green
Write-Host "`nNext steps:" -ForegroundColor Cyan
Write-Host "1. Add your Supabase credentials to .env.local" -ForegroundColor White
Write-Host "2. Run: npm run dev" -ForegroundColor White
Write-Host "3. Open: http://localhost:3000" -ForegroundColor White
Write-Host "`nDefault login:" -ForegroundColor Cyan
Write-Host "  Admin: admin / admin123 (PIN: 1234)" -ForegroundColor White
Write-Host "  Manager: manager / manager123 (PIN: 5678)" -ForegroundColor White
Write-Host "  Cashier: cashier / cashier123 (PIN: 9012)" -ForegroundColor White
