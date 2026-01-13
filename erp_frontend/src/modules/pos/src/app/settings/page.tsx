'use client';

import { useState, useEffect } from 'react';
import { ModernLayout } from '@/components/layout/ModernLayout';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Settings,
  Store,
  Receipt,
  Database,
  Download,
  Upload,
  Save,
  RefreshCw,
  Paintbrush
} from 'lucide-react';
import { db, ShopSettings } from '@/lib/db/database';
import { api } from '@/lib/api-client';
import { realtimeSync } from '@/lib/realtime-sync';
import { useCurrentTenant } from '@/lib/tenant-context';
import { hasPermission } from '@/lib/permissions';

export default function SettingsPage() {
  const { user } = useAuth();
  const { tenantId } = useCurrentTenant();
  const [shopSettings, setShopSettings] = useState<ShopSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (tenantId) {
      loadSettings();
      realtimeSync.setTenantId(tenantId);
      realtimeSync.startSettingsSync(() => {
        console.log('🔄 Settings updated from another device');
        loadSettings();
      });
    }
  }, [tenantId]);

  const loadSettings = async () => {
    try {
      const settings = await api.fetchShopSettings(tenantId);
      if (settings) {
        setShopSettings(settings);
      } else {
        // Create default settings if none exist
        const defaultSettings: Omit<ShopSettings, 'id' | 'uuid' | 'syncStatus' | 'createdAt' | 'updatedAt'> = {
          shopName: 'PaeasyShop',
          address: 'Lilongwe, Malawi',
          phone: '+265 123 456 789',
          email: 'info@paeasyshop.com',
          vatRegistration: 'MW123456789',
          vatRate: 16.5,
          taxInclusive: false,
          currency: 'MWK',
          dateFormat: 'DD/MM/YYYY',
          timeFormat: '12h',
          receiptHeader: 'THANK YOU FOR SHOPPING WITH US',
          receiptFooter: 'Please come again!',
          showLogoOnReceipt: true,
          receiptWidth: 80,
          autoBackupSchedule: 'daily',
          tenantId
        };
        const settings = await api.createShopSettings(defaultSettings);
        setShopSettings(settings);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    if (!shopSettings) return;

    setSaving(true);
    try {
      await api.updateShopSettings(shopSettings.id!, shopSettings);
      alert('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Error saving settings: ' + (error as any).message);
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof ShopSettings, value: any) => {
    if (!shopSettings) return;
    setShopSettings({ ...shopSettings, [field]: value });
  };

  const exportData = async () => {
    try {
      const products = await db.products.toArray();
      const sales = await db.sales.toArray();
      const staff = await db.staff.toArray();

      const exportData = {
        products,
        sales,
        staff,
        settings: shopSettings,
        exportDate: new Date().toISOString()
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `pos_backup_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting data:', error);
      alert('Error exporting data');
    }
  };

  const importData = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const data = JSON.parse(text);

      if (confirm('This will overwrite all existing data. Are you sure?')) {
        // Clear existing data
        await db.products.clear();
        await db.sales.clear();
        await db.staff.clear();
        await db.shopSettings.clear();

        // Import new data
        if (data.products) await db.products.bulkAdd(data.products);
        if (data.sales) await db.sales.bulkAdd(data.sales);
        if (data.staff) await db.staff.bulkAdd(data.staff);
        if (data.settings) await db.shopSettings.add(data.settings);

        alert('Data imported successfully!');
        window.location.reload();
      }
    } catch (error) {
      console.error('Error importing data:', error);
      alert('Error importing data');
    }
  };

  // Check permissions
  if (!hasPermission(user, 'settings', 'view')) {
    return (
      <ModernLayout>
        <div className="p-6">
          <div className="text-center">
            <Settings className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
            <p className="text-gray-600">You don't have permission to access settings.</p>
          </div>
        </div>
      </ModernLayout>
    );
  }

  if (loading || !shopSettings) {
    return (
      <ModernLayout>
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-96 bg-gray-200 rounded"></div>
          </div>
        </div>
      </ModernLayout>
    );
  }

  return (
    <ModernLayout>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <Button onClick={saveSettings} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>

        <Tabs defaultValue="shop" className="space-y-6">
          <TabsList>
            <TabsTrigger value="shop">Shop Info</TabsTrigger>
            <TabsTrigger value="branding">Branding</TabsTrigger>
            <TabsTrigger value="receipt">Receipt</TabsTrigger>
            <TabsTrigger value="tax">Tax & Currency</TabsTrigger>
            <TabsTrigger value="data">Data Management</TabsTrigger>
          </TabsList>

          <TabsContent value="shop">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Store className="h-5 w-5" />
                  Shop Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="shopName">Shop Name</Label>
                    <Input
                      id="shopName"
                      value={shopSettings.shopName}
                      onChange={(e) => handleInputChange('shopName', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={shopSettings.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={shopSettings.email || ''}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="vatRegistration">VAT Registration</Label>
                    <Input
                      id="vatRegistration"
                      value={shopSettings.vatRegistration || ''}
                      onChange={(e) => handleInputChange('vatRegistration', e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={shopSettings.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="branding">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Paintbrush className="h-5 w-5" />
                  Branding
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="logo">Logo URL</Label>
                  <Input
                    id="logo"
                    value={shopSettings.logo || ''}
                    onChange={(e) => handleInputChange('logo', e.target.value)}
                    placeholder="https://example.com/logo.png"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="primaryColor">Primary Color</Label>
                    <Input
                      id="primaryColor"
                      type="color"
                      value={shopSettings.primaryColor || '#3b82f6'}
                      onChange={(e) => handleInputChange('primaryColor', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="secondaryColor">Secondary Color</Label>
                    <Input
                      id="secondaryColor"
                      type="color"
                      value={shopSettings.secondaryColor || '#64748b'}
                      onChange={(e) => handleInputChange('secondaryColor', e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="font">Font</Label>
                  <select
                    id="font"
                    value={shopSettings.font || 'Inter'}
                    onChange={(e) => handleInputChange('font', e.target.value)}
                    className="w-full h-10 px-3 py-2 border border-input bg-background rounded-md text-sm"
                  >
                    <option value="Inter">Inter</option>
                    <option value="Roboto">Roboto</option>
                    <option value="Open Sans">Open Sans</option>
                    <option value="Lato">Lato</option>
                    <option value="Montserrat">Montserrat</option>
                  </select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="receipt">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Receipt className="h-5 w-5" />
                  Receipt Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="receiptWidth">Receipt Width (mm)</Label>
                    <Input
                      id="receiptWidth"
                      type="number"
                      value={shopSettings.receiptWidth}
                      onChange={(e) => handleInputChange('receiptWidth', parseInt(e.target.value))}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="showLogoOnReceipt"
                      checked={shopSettings.showLogoOnReceipt}
                      onChange={(e) => handleInputChange('showLogoOnReceipt', e.target.checked)}
                    />
                    <Label htmlFor="showLogoOnReceipt">Show Logo on Receipt</Label>
                  </div>
                </div>
                <div>
                  <Label htmlFor="receiptHeader">Receipt Header</Label>
                  <Input
                    id="receiptHeader"
                    value={shopSettings.receiptHeader}
                    onChange={(e) => handleInputChange('receiptHeader', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="receiptFooter">Receipt Footer</Label>
                  <Input
                    id="receiptFooter"
                    value={shopSettings.receiptFooter}
                    onChange={(e) => handleInputChange('receiptFooter', e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tax">
            <Card>
              <CardHeader>
                <CardTitle>Tax & Currency Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="currency">Currency</Label>
                    <select
                      id="currency"
                      value={shopSettings.currency}
                      onChange={(e) => handleInputChange('currency', e.target.value)}
                      className="w-full h-10 px-3 py-2 border border-input bg-background rounded-md text-sm"
                    >
                      <option value="MWK">MWK - Malawi Kwacha</option>
                      <option value="USD">USD - US Dollar</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="vatRate">VAT Rate (%)</Label>
                    <Input
                      id="vatRate"
                      type="number"
                      step="0.1"
                      value={shopSettings.vatRate}
                      onChange={(e) => handleInputChange('vatRate', parseFloat(e.target.value))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="dateFormat">Date Format</Label>
                    <select
                      id="dateFormat"
                      value={shopSettings.dateFormat}
                      onChange={(e) => handleInputChange('dateFormat', e.target.value)}
                      className="w-full h-10 px-3 py-2 border border-input bg-background rounded-md text-sm"
                    >
                      <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                      <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                      <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="timeFormat">Time Format</Label>
                    <select
                      id="timeFormat"
                      value={shopSettings.timeFormat}
                      onChange={(e) => handleInputChange('timeFormat', e.target.value)}
                      className="w-full h-10 px-3 py-2 border border-input bg-background rounded-md text-sm"
                    >
                      <option value="12h">12-hour</option>
                      <option value="24h">24-hour</option>
                    </select>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="taxInclusive"
                    checked={shopSettings.taxInclusive}
                    onChange={(e) => handleInputChange('taxInclusive', e.target.checked)}
                  />
                  <Label htmlFor="taxInclusive">Prices include tax</Label>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="data">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Data Management
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Export Data</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 mb-4">
                        Export all your data including products, sales, and settings.
                      </p>
                      <Button onClick={exportData} className="w-full">
                        <Download className="h-4 w-4 mr-2" />
                        Export All Data
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Import Data</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 mb-4">
                        Import data from a backup file. This will overwrite all existing data.
                      </p>
                      <input
                        type="file"
                        accept=".json"
                        onChange={importData}
                        className="hidden"
                        id="import-file"
                      />
                      <Button
                        onClick={() => document.getElementById('import-file')?.click()}
                        variant="outline"
                        className="w-full"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Import Data
                      </Button>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Database Statistics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">Products</div>
                        <div className="text-sm text-gray-500">In database</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">Sales</div>
                        <div className="text-sm text-gray-500">Transactions</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">Staff</div>
                        <div className="text-sm text-gray-500">Members</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-orange-600">Size</div>
                        <div className="text-sm text-gray-500">Est. database</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ModernLayout>
  );
}
