'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { signOut } from 'next-auth/react';
import toast from 'react-hot-toast';
import { User, Mail, Shield, LogOut, Save } from 'lucide-react';

export default function SettingsPage() {
    const { data: session } = useSession();
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

    const handleLogout = async () => {
        await signOut({ callbackUrl: '/auth/signin' });
    };

    return (
        <div>
            {/* Header */}
            <div className="page-header">
                <div>
                    <h1 className="page-title">Settings</h1>
                    <p className="page-subtitle">Manage your account settings</p>
                </div>
            </div>

            {/* Profile Section */}
            <div className="card" style={{ maxWidth: 600, marginBottom: '1.5rem' }}>
                <div className="card-header">
                    <h3 className="card-title">Profile Information</h3>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2rem' }}>
                    <div
                        style={{
                            width: 80,
                            height: 80,
                            borderRadius: 'var(--radius-xl)',
                            background: 'var(--gradient-primary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '2rem',
                            fontWeight: 600,
                            color: 'white',
                        }}
                    >
                        {session?.user?.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                            {session?.user?.name || 'User'}
                        </h2>
                        <p style={{ color: 'var(--text-secondary)' }}>
                            {session?.user?.role === 'admin' ? 'Administrator' : 'Team Member'}
                        </p>
                    </div>
                </div>

                <div className="info-row">
                    <User size={20} style={{ color: 'var(--text-muted)' }} />
                    <span className="info-label">Name</span>
                    <span className="info-value">{session?.user?.name}</span>
                </div>

                <div className="info-row">
                    <Mail size={20} style={{ color: 'var(--text-muted)' }} />
                    <span className="info-label">Email</span>
                    <span className="info-value">{session?.user?.email}</span>
                </div>

                <div className="info-row">
                    <Shield size={20} style={{ color: 'var(--text-muted)' }} />
                    <span className="info-label">Role</span>
                    <span className="info-value" style={{ textTransform: 'capitalize' }}>
                        {session?.user?.role}
                    </span>
                </div>
            </div>

            {/* Account Actions */}
            <div className="card" style={{ maxWidth: 600 }}>
                <div className="card-header">
                    <h3 className="card-title">Account Actions</h3>
                </div>

                {!showLogoutConfirm ? (
                    <button
                        className="btn btn-danger"
                        onClick={() => setShowLogoutConfirm(true)}
                    >
                        <LogOut size={18} />
                        Sign Out
                    </button>
                ) : (
                    <div
                        style={{
                            padding: '1rem',
                            background: 'rgba(244, 63, 94, 0.1)',
                            borderRadius: 'var(--radius-lg)',
                            border: '1px solid rgba(244, 63, 94, 0.2)',
                        }}
                    >
                        <p style={{ marginBottom: '1rem', color: 'var(--text-secondary)' }}>
                            Are you sure you want to sign out?
                        </p>
                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                            <button className="btn btn-danger" onClick={handleLogout}>
                                <LogOut size={16} />
                                Yes, Sign Out
                            </button>
                            <button className="btn btn-secondary" onClick={() => setShowLogoutConfirm(false)}>
                                Cancel
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
