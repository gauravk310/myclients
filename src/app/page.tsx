'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Users, ArrowRight, BarChart3, MapPin, Calendar, CheckCircle } from 'lucide-react';

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/dashboard');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="loading" style={{ minHeight: '100vh' }}>
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh' }}>
      {/* Header */}
      <header
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          padding: '1rem 2rem',
          background: 'rgba(15, 23, 42, 0.8)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
          zIndex: 50,
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: 40,
                height: 40,
                background: 'var(--gradient-primary)',
                borderRadius: 'var(--radius-lg)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Users size={20} color="white" />
            </div>
            <span
              style={{
                fontSize: '1.25rem',
                fontWeight: 700,
                background: 'var(--gradient-primary)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              MyClients
            </span>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <Link href="/auth/signin" className="btn btn-ghost">
              Sign In
            </Link>
            <Link href="/auth/signup" className="btn btn-primary">
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '6rem 2rem 4rem',
          background: 'radial-gradient(ellipse at top, rgba(14, 165, 233, 0.1) 0%, transparent 50%)',
        }}
      >
        <div style={{ maxWidth: 900, textAlign: 'center' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 1rem',
              background: 'rgba(14, 165, 233, 0.1)',
              border: '1px solid rgba(14, 165, 233, 0.2)',
              borderRadius: 'var(--radius-full)',
              marginBottom: '2rem',
              fontSize: '0.875rem',
              color: 'var(--primary-400)',
            }}
          >
            <CheckCircle size={16} />
            Digitize Your Client Workflow
          </div>

          <h1
            style={{
              fontSize: 'clamp(2.5rem, 5vw, 4rem)',
              fontWeight: 800,
              lineHeight: 1.1,
              marginBottom: '1.5rem',
              background: 'linear-gradient(135deg, #fff 0%, #94a3b8 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Transform Your Client
            <br />
            <span
              style={{
                background: 'var(--gradient-primary)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Visiting & Follow-up
            </span>
          </h1>

          <p
            style={{
              fontSize: '1.25rem',
              color: 'var(--text-secondary)',
              maxWidth: 600,
              margin: '0 auto 2.5rem',
              lineHeight: 1.7,
            }}
          >
            Streamline your marketing team&apos;s client visits, track registrations, manage follow-ups,
            and gain real-time visibility across your entire operation.
          </p>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <Link href="/auth/signup" className="btn btn-primary btn-lg">
              Start Free Trial
              <ArrowRight size={20} />
            </Link>
            <Link href="/auth/signin" className="btn btn-secondary btn-lg">
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section
        style={{
          padding: '6rem 2rem',
          background: 'var(--bg-secondary)',
        }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <h2
              style={{
                fontSize: '2.5rem',
                fontWeight: 700,
                marginBottom: '1rem',
                color: 'var(--text-primary)',
              }}
            >
              Everything You Need
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.125rem' }}>
              Powerful features to manage your entire client visiting workflow
            </p>
          </div>

          <div className="grid grid-cols-3" style={{ gap: '2rem' }}>
            <FeatureCard
              icon={<BarChart3 size={32} />}
              title="Real-time Dashboard"
              description="Get instant visibility into your team's performance with live statistics and comprehensive analytics."
            />
            <FeatureCard
              icon={<MapPin size={32} />}
              title="Location Tracking"
              description="Store and access client locations with integrated map links for easy navigation."
            />
            <FeatureCard
              icon={<Calendar size={32} />}
              title="Visit Scheduling"
              description="Assign clients to team members with specific visit dates and track meeting outcomes."
            />
            <FeatureCard
              icon={<Users size={32} />}
              title="Team Management"
              description="Create and manage team members with role-based access control."
            />
            <FeatureCard
              icon={<CheckCircle size={32} />}
              title="Registration Tracking"
              description="Track client registration status, payment proofs, and document uploads."
            />
            <FeatureCard
              icon={<ArrowRight size={32} />}
              title="Follow-up System"
              description="Never miss a follow-up with rescheduling, feedback tracking, and issue resolution."
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          padding: '3rem 2rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.05)',
          textAlign: 'center',
        }}
      >
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
          © 2024 MyClients. All rights reserved.
        </p>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div
      style={{
        background: 'var(--bg-card)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        borderRadius: 'var(--radius-xl)',
        padding: '2rem',
        transition: 'all 0.3s',
      }}
    >
      <div
        style={{
          width: 64,
          height: 64,
          background: 'rgba(14, 165, 233, 0.1)',
          borderRadius: 'var(--radius-lg)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--primary-400)',
          marginBottom: '1.5rem',
        }}
      >
        {icon}
      </div>
      <h3
        style={{
          fontSize: '1.25rem',
          fontWeight: 600,
          color: 'var(--text-primary)',
          marginBottom: '0.75rem',
        }}
      >
        {title}
      </h3>
      <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>{description}</p>
    </div>
  );
}
