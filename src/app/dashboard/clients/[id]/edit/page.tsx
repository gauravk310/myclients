'use client';

import { useState, useEffect, use } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { ArrowLeft, User, MapPin, Save, Trash2 } from 'lucide-react';

interface TeamMember {
    _id: string;
    name: string;
    email: string;
}

interface Client {
    _id: string;
    name: string;
    address: string;
    mapLocationLink?: string;
    phone: string;
    assignedTo: {
        _id: string;
        name: string;
    };
    assignedVisitDate: string;
    meetingStatus: 'pending' | 'visited' | 'rescheduled';
    clientStatus: 'registered' | 'not_registered';
}

export default function EditClientPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { data: session } = useSession();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
    const [formData, setFormData] = useState({
        name: '',
        address: '',
        mapLocationLink: '',
        phone: '',
        assignedTo: '',
        assignedVisitDate: '',
        meetingStatus: 'pending' as 'pending' | 'visited' | 'rescheduled',
        clientStatus: 'not_registered' as 'registered' | 'not_registered',
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch client
                const clientResponse = await fetch(`/api/clients/${id}`);
                const clientData = await clientResponse.json();

                if (!clientResponse.ok) {
                    throw new Error(clientData.error);
                }

                const client: Client = clientData.client;
                setFormData({
                    name: client.name,
                    address: client.address,
                    mapLocationLink: client.mapLocationLink || '',
                    phone: client.phone,
                    assignedTo: client.assignedTo._id,
                    assignedVisitDate: format(new Date(client.assignedVisitDate), 'yyyy-MM-dd'),
                    meetingStatus: client.meetingStatus,
                    clientStatus: client.clientStatus,
                });

                // Fetch team members if admin
                if (session?.user?.role === 'admin') {
                    const teamResponse = await fetch('/api/team');
                    const teamData = await teamResponse.json();
                    if (teamResponse.ok) {
                        setTeamMembers(teamData.teamMembers);
                    }
                }
            } catch (error) {
                toast.error(error instanceof Error ? error.message : 'Failed to fetch client');
                router.push('/dashboard/clients');
            } finally {
                setLoading(false);
            }
        };

        if (session) {
            fetchData();
        }
    }, [id, session, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const response = await fetch(`/api/clients/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to update client');
            }

            toast.success('Client updated successfully!');
            router.push(`/dashboard/clients/${id}`);
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'An error occurred');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="loading" style={{ minHeight: '50vh' }}>
                <div className="spinner" />
            </div>
        );
    }

    return (
        <div>
            {/* Header */}
            <div className="page-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <Link href={`/dashboard/clients/${id}`} className="btn btn-ghost" style={{ padding: '0.5rem' }}>
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <h1 className="page-title">Edit Client</h1>
                        <p className="page-subtitle">Update client information</p>
                    </div>
                </div>
            </div>

            {/* Form */}
            <div className="card" style={{ maxWidth: 600 }}>
                <form onSubmit={handleSubmit}>
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

                    {/* Meeting Status */}
                    <div className="form-group">
                        <label className="form-label">Meeting Status</label>
                        <select
                            className="form-input form-select"
                            value={formData.meetingStatus}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    meetingStatus: e.target.value as 'pending' | 'visited' | 'rescheduled',
                                })
                            }
                        >
                            <option value="pending">Pending</option>
                            <option value="visited">Visited</option>
                            <option value="rescheduled">Rescheduled</option>
                        </select>
                    </div>

                    {/* Client Status */}
                    <div className="form-group">
                        <label className="form-label">Client Status</label>
                        <select
                            className="form-input form-select"
                            value={formData.clientStatus}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    clientStatus: e.target.value as 'registered' | 'not_registered',
                                })
                            }
                        >
                            <option value="not_registered">Not Registered</option>
                            <option value="registered">Registered</option>
                        </select>
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                        <button type="submit" className="btn btn-primary" disabled={saving}>
                            {saving ? (
                                <>
                                    <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save size={18} />
                                    Save Changes
                                </>
                            )}
                        </button>
                        <Link href={`/dashboard/clients/${id}`} className="btn btn-secondary">
                            <Trash2 size={18} />
                            Cancel
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
