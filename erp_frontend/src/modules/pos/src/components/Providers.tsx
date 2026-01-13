'use client';

import { TenantProvider } from '@/lib/tenant-context';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <TenantProvider>
      {children}
    </TenantProvider>
  );
}