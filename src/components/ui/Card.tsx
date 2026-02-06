'use client';

import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
    icon: LucideIcon;
    label: string;
    value: number | string;
    variant?: 'primary' | 'success' | 'warning' | 'danger' | 'violet';
}

export function StatCard({ icon: Icon, label, value, variant = 'primary' }: StatCardProps) {
    return (
        <div className="stat-card">
            <div className={`stat-card-icon ${variant}`}>
                <Icon size={24} />
            </div>
            <div className="stat-card-content">
                <div className="stat-card-label">{label}</div>
                <div className="stat-card-value">{value}</div>
            </div>
        </div>
    );
}

interface CardProps {
    children: ReactNode;
    className?: string;
}

export function Card({ children, className = '' }: CardProps) {
    return <div className={`card ${className}`}>{children}</div>;
}

interface CardHeaderProps {
    title: string;
    action?: ReactNode;
}

export function CardHeader({ title, action }: CardHeaderProps) {
    return (
        <div className="card-header">
            <h3 className="card-title">{title}</h3>
            {action}
        </div>
    );
}
