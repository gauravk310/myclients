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
        <nav className="navbar">
            {/* Logo */}
            <div className="navbar-logo">
                <div className="navbar-logo-icon">
                    <Users size={20} color="white" />
                </div>
                <span className="navbar-logo-text">MyClients</span>
            </div>

            {/* Navigation */}
            <div className="navbar-nav">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`navbar-nav-item ${isActive ? 'active' : ''}`}
                        >
                            <Icon size={20} />
                            <span>{item.label}</span>
                        </Link>
                    );
                })}
            </div>

            {/* User Menu */}
            <div className="navbar-user">
                <div style={{ position: 'relative' }}>
                    <button
                        onClick={() => setShowUserMenu(!showUserMenu)}
                        className="navbar-user-button"
                    >
                        <div className="navbar-user-avatar">
                            {session?.user?.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div className="navbar-user-info">
                            <div className="navbar-user-name">
                                {session?.user?.name || 'User'}
                            </div>
                            <div className="navbar-user-role">
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
                        <div className="navbar-dropdown">
                            <Link
                                href="/dashboard/settings"
                                className="navbar-dropdown-item"
                            >
                                <Settings size={18} />
                                <span>Settings</span>
                            </Link>
                            <button
                                onClick={handleLogout}
                                className="navbar-dropdown-item navbar-dropdown-logout"
                            >
                                <LogOut size={18} />
                                <span>Logout</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}
