'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import {
    Plus,
    Search,
    Edit2,
    Trash2,
    Mail,
    User,
    Lock,
    X,
} from 'lucide-react';
import { RoleBadge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';

interface TeamMember {
    _id: string;
    name: string;
    email: string;
    role: 'admin' | 'team';
    createdAt: string;
}

export default function TeamPage() {
    const { data: session } = useSession();
    const router = useRouter();
    const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'team' as 'admin' | 'team',
    });
    const [submitting, setSubmitting] = useState(false);

    // Redirect non-admins
    useEffect(() => {
        if (session && session.user.role !== 'admin') {
            router.push('/dashboard');
        }
    }, [session, router]);

    const fetchTeamMembers = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/team');
            const data = await response.json();

            if (response.ok) {
                setTeamMembers(data.teamMembers);
            } else {
                throw new Error(data.error);
            }
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Failed to fetch team members');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (session?.user?.role === 'admin') {
            fetchTeamMembers();
        }
    }, [session]);

    const handleCreateMember = async () => {
        if (!formData.name || !formData.email || !formData.password) {
            toast.error('Please fill in all required fields');
            return;
        }

        setSubmitting(true);

        try {
            const response = await fetch('/api/team', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error);
            }

            toast.success('Team member created successfully!');
            setShowCreateModal(false);
            resetForm();
            fetchTeamMembers();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Failed to create team member');
        } finally {
            setSubmitting(false);
        }
    };

    const handleUpdateMember = async () => {
        if (!selectedMember || !formData.name || !formData.email) {
            toast.error('Please fill in all required fields');
            return;
        }

        setSubmitting(true);

        try {
            const updateData: { name: string; email: string; role: string; password?: string } = {
                name: formData.name,
                email: formData.email,
                role: formData.role,
            };

            // Only include password if it was changed
            if (formData.password) {
                updateData.password = formData.password;
            }

            const response = await fetch(`/api/team/${selectedMember._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updateData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error);
            }

            toast.success('Team member updated successfully!');
            setShowEditModal(false);
            setSelectedMember(null);
            resetForm();
            fetchTeamMembers();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Failed to update team member');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteMember = async () => {
        if (!selectedMember) return;

        try {
            const response = await fetch(`/api/team/${selectedMember._id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error);
            }

            toast.success('Team member deleted successfully');
            setShowDeleteModal(false);
            setSelectedMember(null);
            fetchTeamMembers();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Failed to delete team member');
        }
    };

    const openEditModal = (member: TeamMember) => {
        setSelectedMember(member);
        setFormData({
            name: member.name,
            email: member.email,
            password: '',
            role: member.role,
        });
        setShowEditModal(true);
    };

    const openDeleteModal = (member: TeamMember) => {
        setSelectedMember(member);
        setShowDeleteModal(true);
    };

    const resetForm = () => {
        setFormData({
            name: '',
            email: '',
            password: '',
            role: 'team',
        });
    };

    const filteredMembers = teamMembers.filter(
        (member) =>
            member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            member.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (session?.user?.role !== 'admin') {
        return null;
    }

    return (
        <div>
            {/* Header */}
            <div className="page-header">
                <div>
                    <h1 className="page-title">Team Members</h1>
                    <p className="page-subtitle">Manage your team and their access</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
                    <Plus size={18} />
                    Add Member
                </button>
            </div>

            {/* Search Bar */}
            <div style={{ marginBottom: '1.5rem', maxWidth: 400, position: 'relative' }}>
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
                    placeholder="Search by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Team List */}
            {loading ? (
                <div className="loading">
                    <div className="spinner" />
                </div>
            ) : filteredMembers.length === 0 ? (
                <div className="empty-state card">
                    <User size={48} style={{ margin: '0 auto 1rem', color: 'var(--text-muted)' }} />
                    <h3 className="empty-state-title">No team members found</h3>
                    <p className="empty-state-description">
                        {searchTerm ? 'Try a different search term.' : 'Add your first team member to get started.'}
                    </p>
                    {!searchTerm && (
                        <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
                            <Plus size={18} />
                            Add Member
                        </button>
                    )}
                </div>
            ) : (
                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th style={{ width: 120 }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredMembers.map((member) => (
                                <tr key={member._id}>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <div
                                                style={{
                                                    width: 36,
                                                    height: 36,
                                                    borderRadius: 'var(--radius-lg)',
                                                    background: 'var(--gradient-primary)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontWeight: 600,
                                                    color: 'white',
                                                    fontSize: '0.875rem',
                                                }}
                                            >
                                                {member.name.charAt(0).toUpperCase()}
                                            </div>
                                            <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                                                {member.name}
                                            </span>
                                        </div>
                                    </td>
                                    <td>{member.email}</td>
                                    <td>
                                        <RoleBadge role={member.role} />
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button
                                                className="btn btn-ghost btn-sm"
                                                onClick={() => openEditModal(member)}
                                                title="Edit"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                className="btn btn-ghost btn-sm"
                                                onClick={() => openDeleteModal(member)}
                                                title="Delete"
                                                disabled={member._id === session?.user?.id}
                                                style={{
                                                    color: member._id === session?.user?.id ? 'var(--text-muted)' : 'var(--accent-rose)',
                                                }}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Create Modal */}
            <Modal
                isOpen={showCreateModal}
                onClose={() => {
                    setShowCreateModal(false);
                    resetForm();
                }}
                title="Add Team Member"
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
                        <button className="btn btn-primary" onClick={handleCreateMember} disabled={submitting}>
                            {submitting ? (
                                <>
                                    <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
                                    Creating...
                                </>
                            ) : (
                                <>
                                    <Plus size={16} />
                                    Create
                                </>
                            )}
                        </button>
                    </>
                }
            >
                <div className="form-group">
                    <label className="form-label">Name *</label>
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
                            placeholder="Enter name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                        />
                    </div>
                </div>

                <div className="form-group">
                    <label className="form-label">Email *</label>
                    <div style={{ position: 'relative' }}>
                        <Mail
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
                            type="email"
                            className="form-input"
                            style={{ paddingLeft: '2.75rem' }}
                            placeholder="Enter email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                        />
                    </div>
                </div>

                <div className="form-group">
                    <label className="form-label">Password *</label>
                    <div style={{ position: 'relative' }}>
                        <Lock
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
                            type="password"
                            className="form-input"
                            style={{ paddingLeft: '2.75rem' }}
                            placeholder="Create password"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            required
                            minLength={6}
                        />
                    </div>
                </div>

                <div className="form-group">
                    <label className="form-label">Role *</label>
                    <select
                        className="form-input form-select"
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value as 'admin' | 'team' })}
                    >
                        <option value="team">Team Member</option>
                        <option value="admin">Administrator</option>
                    </select>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                        Administrators have full access to all features including team management.
                    </p>
                </div>
            </Modal>

            {/* Edit Modal */}
            <Modal
                isOpen={showEditModal}
                onClose={() => {
                    setShowEditModal(false);
                    setSelectedMember(null);
                    resetForm();
                }}
                title="Edit Team Member"
                footer={
                    <>
                        <button
                            className="btn btn-secondary"
                            onClick={() => {
                                setShowEditModal(false);
                                setSelectedMember(null);
                                resetForm();
                            }}
                        >
                            Cancel
                        </button>
                        <button className="btn btn-primary" onClick={handleUpdateMember} disabled={submitting}>
                            {submitting ? (
                                <>
                                    <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
                                    Saving...
                                </>
                            ) : (
                                'Save Changes'
                            )}
                        </button>
                    </>
                }
            >
                <div className="form-group">
                    <label className="form-label">Name *</label>
                    <input
                        type="text"
                        className="form-input"
                        placeholder="Enter name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                    />
                </div>

                <div className="form-group">
                    <label className="form-label">Email *</label>
                    <input
                        type="email"
                        className="form-input"
                        placeholder="Enter email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                    />
                </div>

                <div className="form-group">
                    <label className="form-label">New Password (Optional)</label>
                    <input
                        type="password"
                        className="form-input"
                        placeholder="Leave blank to keep current password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        minLength={6}
                    />
                </div>

                <div className="form-group">
                    <label className="form-label">Role *</label>
                    <select
                        className="form-input form-select"
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value as 'admin' | 'team' })}
                    >
                        <option value="team">Team Member</option>
                        <option value="admin">Administrator</option>
                    </select>
                </div>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={showDeleteModal}
                onClose={() => {
                    setShowDeleteModal(false);
                    setSelectedMember(null);
                }}
                title="Delete Team Member"
                footer={
                    <>
                        <button
                            className="btn btn-secondary"
                            onClick={() => {
                                setShowDeleteModal(false);
                                setSelectedMember(null);
                            }}
                        >
                            Cancel
                        </button>
                        <button className="btn btn-danger" onClick={handleDeleteMember}>
                            <Trash2 size={16} />
                            Delete
                        </button>
                    </>
                }
            >
                <p style={{ color: 'var(--text-secondary)' }}>
                    Are you sure you want to delete <strong>{selectedMember?.name}</strong>? This action cannot
                    be undone. All clients assigned to this member will need to be reassigned.
                </p>
            </Modal>
        </div>
    );
}
