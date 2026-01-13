'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { db } from '@/lib/db/database';

interface CloseOfDayModalProps {
  onSuccess: () => void;
}

export default function CloseOfDayModal({ onSuccess }: CloseOfDayModalProps) {
  const [open, setOpen] = useState(false);
  const [openingBalance, setOpeningBalance] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCloseDay = async () => {
    setIsProcessing(true);
    try {
      const balance = parseFloat(openingBalance);
      if (isNaN(balance)) {
        alert('Please enter a valid opening balance.');
        return;
      }

      const settings = await db.shopSettings.toArray();
      if (settings.length > 0) {
        await db.shopSettings.update(settings[0].id!, { openingBalance: balance });
      } else {
        // Create default settings if not exists (fallback)
        await db.shopSettings.add({
          openingBalance: balance,
          shopName: 'My Shop',
          address: '',
          phone: '',
          vatRate: 16.5,
          taxInclusive: true,
          currency: 'MWK',
          dateFormat: 'dd/MM/yyyy',
          timeFormat: '24h',
          receiptHeader: '',
          receiptFooter: '',
          showLogoOnReceipt: false,
          receiptWidth: 80,
          autoBackupSchedule: 'daily',
          createdAt: new Date(),
          updatedAt: new Date()
        } as any);
      }

      alert('Day closed successfully!');
      onSuccess();
      setOpen(false);

    } catch (error) {
      console.error('Error closing day:', error);
      alert('Failed to close day.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">Close Day</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Close of Day</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p>Review your reports and confirm all transactions before closing the day.</p>
          <div className="space-y-2">
            <label htmlFor="opening-balance" className="font-medium">Next Day's Opening Balance</label>
            <Input
              id="opening-balance"
              type="number"
              value={openingBalance}
              onChange={(e) => setOpeningBalance(e.target.value)}
              placeholder="Enter cash amount"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleCloseDay} disabled={isProcessing}>
            {isProcessing ? 'Processing...' : 'Confirm & Close Day'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
