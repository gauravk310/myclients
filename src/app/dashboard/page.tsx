'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import {
    Users,
    UserCheck,
    UserX,
    Calendar,
    Clock,
    CheckCircle,
    RefreshCw,
    ChevronRight,
    MapPin,
    Phone,
} from 'lucide-react';
import { StatCard } from '@/components/ui/Card';
import { StatusBadge, ClientStatusBadge } from '@/components/ui/Badge';

interface Stats {
    totalClients: number;
    registeredClients: number;
    nonRegisteredClients: number;
    todaysClients: number;
    pendingVisits: number;
    visitedCount: number;
    rescheduledCount: number;
}

interface Client {
    _id: string;
    name: string;
    address: string;
    phone: string;
    assignedVisitDate: string;
    meetingStatus: 'pending' | 'visited' | 'rescheduled';
    clientStatus: 'registered' | 'not_registered';
    assignedTo: {
        _id: string;
        name: string;
        email: string;
    };
}

export default function DashboardPage() {
    const { data: session } = useSession();
    const [stats, setStats] = useState<Stats | null>(null);
    const [clients, setClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [statusFilter, setStatusFilter] = useState<string>('');

    const fetchData = async () => {
        try {
            setLoading(true);

            // Fetch stats
            const statsResponse = await fetch(`/api/dashboard/stats?date=${selectedDate}`);
            const statsData = await statsResponse.json();

            if (statsResponse.ok) {
                setStats(statsData.stats);
            } else {
                throw new Error(statsData.error);
            }

            // Fetch clients
            let clientsUrl = `/api/clients?date=${selectedDate}`;
            if (statusFilter) {
                clientsUrl += `&status=${statusFilter}`;
            }

            const clientsResponse = await fetch(clientsUrl);
            const clientsData = await clientsResponse.json();

            if (clientsResponse.ok) {
                setClients(clientsData.clients);
            } else {
                throw new Error(clientsData.error);
            }
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Failed to fetch data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [selectedDate, statusFilter]);

    return (
        <div>
            {/* Header */}
            <div className="page-header">
                <div>
                    <h1 className="page-title">Dashboard</h1>
                    <p className="page-subtitle">
                        Welcome back, {session?.user?.name || 'User'}!{' '}
                        {session?.user?.role === 'admin' ? 'Here\'s your team overview.' : 'Here are your assigned clients.'}
                    </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <input
                        type="date"
                        className="form-input"
                        style={{ width: 'auto' }}
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                    />
                    <button onClick={fetchData} className="btn btn-secondary" disabled={loading}>
                        <RefreshCw size={18} className={loading ? 'spin' : ''} />
                        Refresh
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            {loading && !stats ? (
                <div className="loading">
                    <div className="spinner" />
                </div>
            ) : stats ? (
                <div className="grid grid-cols-4" style={{ marginBottom: '2rem' }}>
                    <StatCard icon={Users} label="Total Clients" value={stats.totalClients} variant="primary" />
                    <StatCard
                        icon={UserCheck}
                        label="Registered"
                        value={stats.registeredClients}
                        variant="success"
                    />
                    <StatCard
                        icon={UserX}
                        label="Not Registered"
                        value={stats.nonRegisteredClients}
                        variant="danger"
                    />
                    <StatCard
                        icon={Calendar}
                        label="Today's Visits"
                        value={stats.todaysClients}
                        variant="violet"
                    />
                </div>
            ) : null}

            {/* Visit Status Cards */}
            {stats && (
                <div className="grid grid-cols-3" style={{ marginBottom: '2rem' }}>
                    <div
                        className="stat-card"
                        style={{ cursor: 'pointer' }}
                        onClick={() => setStatusFilter(statusFilter === 'pending' ? '' : 'pending')}
                    >
                        <div className="stat-card-icon warning">
                            <Clock size={24} />
                        </div>
                        <div className="stat-card-content">
                            <div className="stat-card-label">Pending</div>
                            <div className="stat-card-value">{stats.pendingVisits}</div>
                        </div>
                        {statusFilter === 'pending' && (
                            <CheckCircle size={20} style={{ color: 'var(--primary-400)' }} />
                        )}
                    </div>

                    <div
                        className="stat-card"
                        style={{ cursor: 'pointer' }}
                        onClick={() => setStatusFilter(statusFilter === 'visited' ? '' : 'visited')}
                    >
                        <div className="stat-card-icon success">
                            <CheckCircle size={24} />
                        </div>
                        <div className="stat-card-content">
                            <div className="stat-card-label">Visited</div>
                            <div className="stat-card-value">{stats.visitedCount}</div>
                        </div>
                        {statusFilter === 'visited' && (
                            <CheckCircle size={20} style={{ color: 'var(--primary-400)' }} />
                        )}
                    </div>

                    <div
                        className="stat-card"
                        style={{ cursor: 'pointer' }}
                        onClick={() => setStatusFilter(statusFilter === 'rescheduled' ? '' : 'rescheduled')}
                    >
                        <div className="stat-card-icon violet">
                            <RefreshCw size={24} />
                        </div>
                        <div className="stat-card-content">
                            <div className="stat-card-label">Rescheduled</div>
                            <div className="stat-card-value">{stats.rescheduledCount}</div>
                        </div>
                        {statusFilter === 'rescheduled' && (
                            <CheckCircle size={20} style={{ color: 'var(--primary-400)' }} />
                        )}
                    </div>
                </div>
            )}

            {/* Client List */}
            <div className="section-header">
                <h2 className="section-title">
                    Clients for {format(new Date(selectedDate), 'MMMM d, yyyy')}
                    {statusFilter && ` - ${statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}`}
                </h2>
                {statusFilter && (
                    <button className="btn btn-ghost btn-sm" onClick={() => setStatusFilter('')}>
                        Clear Filter
                    </button>
                )}
            </div>

            {loading ? (
                <div className="loading">
                    <div className="spinner" />
                </div>
            ) : clients.length === 0 ? (
                <div className="empty-state card">
                    <Calendar size={48} style={{ margin: '0 auto 1rem', color: 'var(--text-muted)' }} />
                    <h3 className="empty-state-title">No clients found</h3>
                    <p className="empty-state-description">
                        {statusFilter
                            ? `No ${statusFilter} clients for this date.`
                            : 'No clients scheduled for this date.'}
                    </p>
                    <Link href="/dashboard/clients/new" className="btn btn-primary">
                        Add New Client
                    </Link>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {clients.map((client) => (
                        <Link
                            key={client._id}
                            href={`/dashboard/clients/${client._id}`}
                            className="client-item"
                        >
                            <div className="client-avatar">{client.name.charAt(0).toUpperCase()}</div>
                            <div className="client-info">
                                <div className="client-name">{client.name}</div>
                                <div className="client-meta">
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                        <MapPin size={12} />
                                        {client.address.length > 30
                                            ? client.address.substring(0, 30) + '...'
                                            : client.address}
                                    </span>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                        <Phone size={12} />
                                        {client.phone}
                                    </span>
                                    {session?.user?.role === 'admin' && (
                                        <span>Assigned to: {client.assignedTo?.name}</span>
                                    )}
                                </div>
                            </div>
                            <div className="client-badges">
                                <StatusBadge status={client.meetingStatus} />
                                <ClientStatusBadge status={client.clientStatus} />
                            </div>
                            <ChevronRight size={20} style={{ color: 'var(--text-muted)' }} />
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
