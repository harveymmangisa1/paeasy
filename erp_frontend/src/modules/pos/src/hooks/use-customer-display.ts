'use client';

import { useState, useEffect, useCallback } from 'react';
import { SaleItem } from '@/lib/db/database';

export type CustomerDisplayMessage = 
  | { type: 'UPDATE_CART'; payload: { items: any[]; subtotal: number; tax: number; total: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'PAYMENT_SUCCESS'; payload: { change: number; receiptNumber: string } };

const CHANNEL_NAME = 'paeasyshop_customer_display';

export function useCustomerDisplay() {
  const [channel, setChannel] = useState<BroadcastChannel | null>(null);

  // Receiver State
  const [cartState, setCartState] = useState<{ items: any[]; subtotal: number; tax: number; total: number } | null>(null);
  const [lastSale, setLastSale] = useState<{ change: number; receiptNumber: string } | null>(null);

  useEffect(() => {
    const bc = new BroadcastChannel(CHANNEL_NAME);
    setChannel(bc);

    bc.onmessage = (event) => {
      const message = event.data as CustomerDisplayMessage;
      
      switch (message.type) {
        case 'UPDATE_CART':
          setCartState(message.payload);
          if (message.payload.items.length > 0) {
            setLastSale(null);
          }
          break;
        case 'CLEAR_CART':
          setCartState(null);
          setLastSale(null);
          break;
        case 'PAYMENT_SUCCESS':
          setLastSale(message.payload);
          setCartState(null);
          break;
      }
    };

    return () => {
      bc.close();
    };
  }, []);

  const broadcastCart = useCallback((items: any[], subtotal: number, tax: number, total: number) => {
    channel?.postMessage({
      type: 'UPDATE_CART',
      payload: { items, subtotal, tax, total }
    });
  }, [channel]);

  const broadcastClear = useCallback(() => {
    channel?.postMessage({ type: 'CLEAR_CART' });
  }, [channel]);

  const broadcastSuccess = useCallback((change: number, receiptNumber: string) => {
    channel?.postMessage({
      type: 'PAYMENT_SUCCESS',
      payload: { change, receiptNumber }
    });
  }, [channel]);

  return {
    // Sender methods
    broadcastCart,
    broadcastClear,
    broadcastSuccess,
    
    // Receiver state
    cartState,
    lastSale,
    
    // Utility
    openDisplay: () => window.open('/customer-display', 'CustomerDisplay', 'width=1000,height=800,menubar=no,toolbar=no')
  };
}
