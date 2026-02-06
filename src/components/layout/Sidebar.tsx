'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import {
    LayoutDashboard,
    Users,
    UsersRound,
    LogOut,
    Settings,
    ChevronDown,
} from 'lucide-react';
import { useState } from 'react';

const adminNavItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/dashboard/clients', label: 'Clients', icon: Users },
    { href: '/dashboard/team', label: 'Team', icon: UsersRound },
];

const teamNavItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/dashboard/clients', label: 'My Clients', icon: Users },
];

export function Sidebar() {
    const pathname = usePathname();
    const { data: session } = useSession();
    const [showUserMenu, setShowUserMenu] = useState(false);

    const navItems = session?.user?.role === 'admin' ? adminNavItems : teamNavItems;

    const handleLogout = async () => {
        await signOut({ callbackUrl: '/auth/signin' });
    };

    return (
        <aside className="sidebar">
            {/* Logo */}
            <div className="sidebar-header">
                <div className="sidebar-logo">
                    <div className="sidebar-logo-icon">
                        <Users size={20} color="white" />
                    </div>
                    <span className="sidebar-logo-text">MyClients</span>
                </div>
            </div>

            {/* Navigation */}
            <nav className="sidebar-nav">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
                        >
                            <Icon size={20} />
                            <span>{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* User Menu */}
            <div className="sidebar-footer">
                <div style={{ position: 'relative' }}>
                    <button
                        onClick={() => setShowUserMenu(!showUserMenu)}
                        className="sidebar-nav-item"
                        style={{ width: '100%', cursor: 'pointer', background: 'none', border: 'none' }}
                    >
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
                            {session?.user?.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div style={{ flex: 1, textAlign: 'left' }}>
                            <div style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)' }}>
                                {session?.user?.name || 'User'}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                {session?.user?.role === 'admin' ? 'Administrator' : 'Team Member'}
                            </div>
                        </div>
                        <ChevronDown
                            size={16}
                            style={{
                                transition: 'transform 0.2s',
                                transform: showUserMenu ? 'rotate(180deg)' : 'rotate(0)',
                            }}
                        />
                    </button>

                    {showUserMenu && (
                        <div
                            style={{
                                position: 'absolute',
                                bottom: '100%',
                                left: 0,
                                right: 0,
                                marginBottom: '0.5rem',
                                background: 'var(--bg-tertiary)',
                                borderRadius: 'var(--radius-lg)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                overflow: 'hidden',
                            }}
                        >
                            <Link
                                href="/dashboard/settings"
                                className="sidebar-nav-item"
                                style={{ margin: 0, borderRadius: 0 }}
                            >
                                <Settings size={18} />
                                <span>Settings</span>
                            </Link>
                            <button
                                onClick={handleLogout}
                                className="sidebar-nav-item"
                                style={{
                                    width: '100%',
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    margin: 0,
                                    borderRadius: 0,
                                    color: 'var(--accent-rose)',
                                }}
                            >
                                <LogOut size={18} />
                                <span>Logout</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </aside>
    );
}
