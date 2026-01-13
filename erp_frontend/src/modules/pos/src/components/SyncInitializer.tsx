'use client';

import { useEffect } from 'react';
import { syncService } from '@/lib/sync';

export function SyncInitializer() {
    useEffect(() => {
        // Start the sync service when the app loads
        syncService.start();

        // Cleanup on unmount
        return () => {
            syncService.stop();
        };
    }, []);

    return null; // This component renders nothing
}
