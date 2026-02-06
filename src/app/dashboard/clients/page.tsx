'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import {
    Plus,
    Search,
    Filter,
    ChevronRight,
    MapPin,
    Phone,
    Calendar,
    X,
    User,
} from 'lucide-react';
import { StatusBadge, ClientStatusBadge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';

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

interface TeamMember {
    _id: string;
    name: string;
    email: string;
}

export default function ClientsPage() {
    const { data: session } = useSession();
    const [clients, setClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState({
        date: '',
        status: '',
        clientStatus: '',
    });
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
    const [formData, setFormData] = useState({
        name: '',
        address: '',
        mapLocationLink: '',
        phone: '',
        assignedTo: '',
        assignedVisitDate: format(new Date(), 'yyyy-MM-dd'),
    });

    const fetchClients = async () => {
        try {
            setLoading(true);
            let url = '/api/clients?';

            if (filters.date) url += `date=${filters.date}&`;
            if (filters.status) url += `status=${filters.status}&`;
            if (filters.clientStatus) url += `clientStatus=${filters.clientStatus}&`;

            const response = await fetch(url);
            const data = await response.json();

            if (response.ok) {
                setClients(data.clients);
            } else {
                throw new Error(data.error);
            }
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Failed to fetch clients');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchClients();
    }, [filters]);

    useEffect(() => {
        const fetchTeamMembers = async () => {
            // If team member, they can only assign to themselves
            if (session?.user?.role === 'team') {
                setFormData((prev) => ({ ...prev, assignedTo: session.user.id }));
                return;
            }

            // Admin fetches all team members
            try {
                const response = await fetch('/api/team');
                const data = await response.json();

                if (response.ok) {
                    setTeamMembers(data.teamMembers);
                    // Default to first team member if available
                    if (data.teamMembers.length > 0) {
                        setFormData((prev) => ({ ...prev, assignedTo: data.teamMembers[0]._id }));
                    }
                }
            } catch (error) {
                console.error('Failed to fetch team members:', error);
            }
        };

        if (session) {
            fetchTeamMembers();
        }
    }, [session]);

    const handleCreateClient = async () => {
        if (!formData.assignedTo) {
            toast.error('Please select a team member');
            return;
        }

        setSubmitting(true);

        try {
            const response = await fetch('/api/clients', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to create client');
            }

            toast.success('Client created successfully!');
            setShowCreateModal(false);
            resetForm();
            fetchClients();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'An error occurred');
        } finally {
            setSubmitting(false);
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            address: '',
            mapLocationLink: '',
            phone: '',
            assignedTo: session?.user?.role === 'team' ? session.user.id : teamMembers[0]?._id || '',
            assignedVisitDate: format(new Date(), 'yyyy-MM-dd'),
        });
    };

    const filteredClients = clients.filter((client) =>
        client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.phone.includes(searchTerm)
    );

    const clearFilters = () => {
        setFilters({ date: '', status: '', clientStatus: '' });
        setSearchTerm('');
    };

    const hasActiveFilters = filters.date || filters.status || filters.clientStatus || searchTerm;

    return (
        <div>
            {/* Header */}
            <div className="page-header">
                <div>
                    <h1 className="page-title">
                        {session?.user?.role === 'admin' ? 'All Clients' : 'My Clients'}
                    </h1>
                    <p className="page-subtitle">
                        Manage and track all client visits
                    </p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
                    <Plus size={18} />
                    Add Client
                </button>
            </div>

            {/* Search and Filter Bar */}
            <div
                style={{
                    display: 'flex',
                    gap: '1rem',
                    marginBottom: '1.5rem',
                    flexWrap: 'wrap',
                }}
            >
                <div style={{ flex: 1, minWidth: 250, position: 'relative' }}>
                    <Search
                        size={18}
                        style={{
                            position: 'absolute',
                            left: '1rem',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            color: 'var(--text-muted)',
                        }}
                    />
                    <input
                        type="text"
                        className="form-input"
                        style={{ paddingLeft: '2.75rem' }}
                        placeholder="Search by name, address, or phone..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <button
                    className={`btn ${showFilters ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setShowFilters(!showFilters)}
                >
                    <Filter size={18} />
                    Filters
                    {hasActiveFilters && (
                        <span
                            style={{
                                width: 8,
                                height: 8,
                                borderRadius: '50%',
                                background: 'var(--accent-emerald)',
                            }}
                        />
                    )}
                </button>
                {hasActiveFilters && (
                    <button className="btn btn-ghost" onClick={clearFilters}>
                        <X size={18} />
                        Clear
                    </button>
                )}
            </div>

            {/* Filter Panel */}
            {showFilters && (
                <div
                    className="card"
                    style={{
                        marginBottom: '1.5rem',
                        display: 'flex',
                        gap: '1rem',
                        flexWrap: 'wrap',
                        alignItems: 'flex-end',
                    }}
                >
                    <div className="form-group" style={{ margin: 0, minWidth: 180 }}>
                        <label className="form-label">Visit Date</label>
                        <input
                            type="date"
                            className="form-input"
                            value={filters.date}
                            onChange={(e) => setFilters({ ...filters, date: e.target.value })}
                        />
                    </div>
                    <div className="form-group" style={{ margin: 0, minWidth: 150 }}>
                        <label className="form-label">Meeting Status</label>
                        <select
                            className="form-input form-select"
                            value={filters.status}
                            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                        >
                            <option value="">All Status</option>
                            <option value="pending">Pending</option>
                            <option value="visited">Visited</option>
                            <option value="rescheduled">Rescheduled</option>
                        </select>
                    </div>
                    <div className="form-group" style={{ margin: 0, minWidth: 150 }}>
                        <label className="form-label">Client Status</label>
                        <select
                            className="form-input form-select"
                            value={filters.clientStatus}
                            onChange={(e) => setFilters({ ...filters, clientStatus: e.target.value })}
                        >
                            <option value="">All Clients</option>
                            <option value="registered">Registered</option>
                            <option value="not_registered">Not Registered</option>
                        </select>
                    </div>
                </div>
            )}

            {/* Client List */}
            {loading ? (
                <div className="loading">
                    <div className="spinner" />
                </div>
            ) : filteredClients.length === 0 ? (
                <div className="empty-state card">
                    <Search size={48} style={{ margin: '0 auto 1rem', color: 'var(--text-muted)' }} />
                    <h3 className="empty-state-title">No clients found</h3>
                    <p className="empty-state-description">
                        {hasActiveFilters
                            ? 'Try adjusting your search or filters.'
                            : 'Start by adding your first client.'}
                    </p>
                    {!hasActiveFilters && (
                        <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
                            <Plus size={18} />
                            Add Client
                        </button>
                    )}
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {filteredClients.map((client) => (
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
                                        {client.address.length > 40
                                            ? client.address.substring(0, 40) + '...'
                                            : client.address}
                                    </span>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                        <Phone size={12} />
                                        {client.phone}
                                    </span>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                        <Calendar size={12} />
                                        {format(new Date(client.assignedVisitDate), 'MMM d, yyyy')}
                                    </span>
                                    {session?.user?.role === 'admin' && (
                                        <span>Assigned: {client.assignedTo?.name}</span>
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

            {/* Results Count */}
            {!loading && filteredClients.length > 0 && (
                <p
                    style={{
                        marginTop: '1.5rem',
                        textAlign: 'center',
                        fontSize: '0.875rem',
                        color: 'var(--text-muted)',
                    }}
                >
                    Showing {filteredClients.length} of {clients.length} clients
                </p>
            )}

            {/* Create Modal */}
            <Modal
                isOpen={showCreateModal}
                onClose={() => {
                    setShowCreateModal(false);
                    resetForm();
                }}
                title="Add New Client"
                size="lg"
                footer={
                    <>
                        <button
                            className="btn btn-secondary"
                            onClick={() => {
                                setShowCreateModal(false);
                                resetForm();
                            }}
                        >
                            Cancel
                        </button>
                        <button className="btn btn-primary" onClick={handleCreateClient} disabled={submitting}>
                            {submitting ? (
                                <>
                                    <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
                                    Creating...
                                </>
                            ) : (
                                <>
                                    <Plus size={16} />
                                    Create Client
                                </>
                            )}
                        </button>
                    </>
                }
            >
                {/* Client Name */}
                <div className="form-group">
                    <label className="form-label">Client Name *</label>
                    <div style={{ position: 'relative' }}>
                        <User
                            size={18}
                            style={{
                                position: 'absolute',
                                left: '1rem',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                color: 'var(--text-muted)',
                            }}
                        />
                        <input
                            type="text"
                            className="form-input"
                            style={{ paddingLeft: '2.75rem' }}
                            placeholder="Enter client name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                        />
                    </div>
                </div>

                {/* Address */}
                <div className="form-group">
                    <label className="form-label">Address *</label>
                    <textarea
                        className="form-input form-textarea"
                        placeholder="Enter full address"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        required
                        rows={3}
                    />
                </div>

                {/* Map Location Link */}
                <div className="form-group">
                    <label className="form-label">Map Location Link (Optional)</label>
                    <div style={{ position: 'relative' }}>
                        <MapPin
                            size={18}
                            style={{
                                position: 'absolute',
                                left: '1rem',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                color: 'var(--text-muted)',
                            }}
                        />
                        <input
                            type="url"
                            className="form-input"
                            style={{ paddingLeft: '2.75rem' }}
                            placeholder="https://maps.google.com/..."
                            value={formData.mapLocationLink}
                            onChange={(e) => setFormData({ ...formData, mapLocationLink: e.target.value })}
                        />
                    </div>
                </div>

                {/* Phone */}
                <div className="form-group">
                    <label className="form-label">Phone Number *</label>
                    <input
                        type="tel"
                        className="form-input"
                        placeholder="Enter phone number"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        required
                    />
                </div>

                {/* Assigned To - Only for Admin */}
                {session?.user?.role === 'admin' && (
                    <div className="form-group">
                        <label className="form-label">Assign To *</label>
                        <select
                            className="form-input form-select"
                            value={formData.assignedTo}
                            onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                            required
                        >
                            <option value="">Select team member</option>
                            {teamMembers.map((member) => (
                                <option key={member._id} value={member._id}>
                                    {member.name} ({member.email})
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                {/* Visit Date */}
                <div className="form-group">
                    <label className="form-label">Visit Date *</label>
                    <input
                        type="date"
                        className="form-input"
                        value={formData.assignedVisitDate}
                        onChange={(e) => setFormData({ ...formData, assignedVisitDate: e.target.value })}
                        required
                    />
                </div>
            </Modal>
        </div>
    );
}
