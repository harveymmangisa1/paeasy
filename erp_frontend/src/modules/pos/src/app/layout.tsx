import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/lib/auth';
import { CartProvider } from '@/lib/cart';
import { SyncInitializer } from '@/components/SyncInitializer';
import { BrandingProvider } from '@/components/layout/BrandingProvider';
import { Providers } from '@/components/Providers';

export const metadata: Metadata = {
  title: 'PaeasyShop',
  description: 'Point of Sale System for Retail Shops in Malawi',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <AuthProvider>
          <BrandingProvider>
            <CartProvider>
              <Providers>
                <SyncInitializer />
                {children}
              </Providers>
            </CartProvider>
          </BrandingProvider>
        </AuthProvider>
      </body>
    </html>
  );
}