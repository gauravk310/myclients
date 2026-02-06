'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Users, Mail, Lock, ArrowRight } from 'lucide-react';

export default function SignInPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const result = await signIn('credentials', {
                redirect: false,
                email: formData.email,
                password: formData.password,
            });

            if (result?.error) {
                toast.error(result.error);
            } else {
                toast.success('Welcome back!');
                router.push('/dashboard');
                router.refresh();
            }
        } catch {
            toast.error('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '2rem',
                background: 'radial-gradient(ellipse at top, rgba(14, 165, 233, 0.1) 0%, transparent 50%)',
            }}
        >
            <div
                style={{
                    width: '100%',
                    maxWidth: 440,
                }}
            >
                {/* Logo */}
                <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                    <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div
                            style={{
                                width: 48,
                                height: 48,
                                background: 'var(--gradient-primary)',
                                borderRadius: 'var(--radius-lg)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <Users size={24} color="white" />
                        </div>
                        <span
                            style={{
                                fontSize: '1.5rem',
                                fontWeight: 700,
                                background: 'var(--gradient-primary)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                            }}
                        >
                            MyClients
                        </span>
                    </Link>
                </div>

                {/* Card */}
                <div
                    style={{
                        background: 'var(--bg-card)',
                        backdropFilter: 'blur(12px)',
                        border: '1px solid rgba(255, 255, 255, 0.05)',
                        borderRadius: 'var(--radius-2xl)',
                        padding: '2.5rem',
                    }}
                >
                    <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                        <h1
                            style={{
                                fontSize: '1.75rem',
                                fontWeight: 700,
                                color: 'var(--text-primary)',
                                marginBottom: '0.5rem',
                            }}
                        >
                            Welcome back
                        </h1>
                        <p style={{ color: 'var(--text-secondary)' }}>
                            Sign in to your account to continue
                        </p>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className="form-label">Email Address</label>
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
                                    placeholder="Enter your email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Password</label>
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
                                    placeholder="Enter your password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary"
                            style={{ width: '100%', marginTop: '1rem' }}
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />
                                    Signing In...
                                </>
                            ) : (
                                <>
                                    Sign In
                                    <ArrowRight size={18} />
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {/* Footer */}
                <p
                    style={{
                        textAlign: 'center',
                        marginTop: '1.5rem',
                        color: 'var(--text-secondary)',
                        fontSize: '0.875rem',
                    }}
                >
                    Don&apos;t have an account?{' '}
                    <Link href="/auth/signup" style={{ color: 'var(--primary-400)', fontWeight: 500 }}>
                        Sign Up
                    </Link>
                </p>
            </div>
        </div>
    );
}
