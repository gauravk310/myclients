'use client';

import { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    children: ReactNode;
    variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    loading?: boolean;
}

export function Button({
    children,
    variant = 'primary',
    size = 'md',
    loading = false,
    disabled,
    className = '',
    ...props
}: ButtonProps) {
    const sizeClass = size === 'sm' ? 'btn-sm' : size === 'lg' ? 'btn-lg' : '';
    const variantClass = `btn-${variant}`;

    return (
        <button
            className={`btn ${variantClass} ${sizeClass} ${className}`}
            disabled={disabled || loading}
            {...props}
        >
            {loading ? (
                <>
                    <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
                    Loading...
                </>
            ) : (
                children
            )}
        </button>
    );
}
