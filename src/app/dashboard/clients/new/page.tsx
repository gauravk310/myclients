'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { ArrowLeft, User, MapPin, Plus, Trash2 } from 'lucide-react';

interface TeamMember {
    _id: string;
    name: string;
    email: string;
}

export default function NewClientPage() {
    const { data: session } = useSession();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
    const [formData, setFormData] = useState({
        name: '',
        address: '',
        mapLocationLink: '',
        phone: '',
        assignedTo: '',
        assignedVisitDate: format(new Date(), 'yyyy-MM-dd'),
    });

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.assignedTo) {
            toast.error('Please select a team member');
            return;
        }

        setLoading(true);

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
            router.push('/dashboard/clients');
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            {/* Header */}
            <div className="page-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <Link href="/dashboard/clients" className="btn btn-ghost" style={{ padding: '0.5rem' }}>
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <h1 className="page-title">Add New Client</h1>
                        <p className="page-subtitle">Create a new client record</p>
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

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? (
                                <>
                                    <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />
                                    Creating...
                                </>
                            ) : (
                                <>
                                    <Plus size={18} />
                                    Create Client
                                </>
                            )}
                        </button>
                        <Link href="/dashboard/clients" className="btn btn-secondary">
                            <Trash2 size={18} />
                            Cancel
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
