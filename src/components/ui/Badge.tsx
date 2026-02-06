interface BadgeProps {
    variant: 'pending' | 'visited' | 'rescheduled' | 'registered' | 'not-registered' | 'admin' | 'team';
    children: React.ReactNode;
}

export function Badge({ variant, children }: BadgeProps) {
    return <span className={`badge badge-${variant}`}>{children}</span>;
}

export function StatusBadge({ status }: { status: 'pending' | 'visited' | 'rescheduled' }) {
    const labels = {
        pending: 'Pending',
        visited: 'Visited',
        rescheduled: 'Rescheduled',
    };

    return <Badge variant={status}>{labels[status]}</Badge>;
}

export function ClientStatusBadge({ status }: { status: 'registered' | 'not_registered' }) {
    return (
        <Badge variant={status === 'registered' ? 'registered' : 'not-registered'}>
            {status === 'registered' ? 'Registered' : 'Not Registered'}
        </Badge>
    );
}

export function RoleBadge({ role }: { role: 'admin' | 'team' }) {
    return <Badge variant={role}>{role === 'admin' ? 'Admin' : 'Team'}</Badge>;
}
