'use client';

import { Toaster } from 'react-hot-toast';

export function ToastProvider() {
    return (
        <Toaster
            position="top-right"
            toastOptions={{
                duration: 4000,
                style: {
                    background: 'var(--bg-secondary)',
                    color: 'var(--text-primary)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: 'var(--radius-lg)',
                },
                success: {
                    iconTheme: {
                        primary: 'var(--accent-emerald)',
                        secondary: 'white',
                    },
                },
                error: {
                    iconTheme: {
                        primary: 'var(--accent-rose)',
                        secondary: 'white',
                    },
                },
            }}
        />
    );
}
