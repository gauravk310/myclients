'use client';

import { useState, useEffect, use } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import {
    ArrowLeft,
    MapPin,
    Phone,
    Calendar,
    User,
    Edit2,
    Trash2,
    ExternalLink,
    Clock,
    CheckCircle,
    RefreshCw,
    MessageSquare,
    AlertTriangle,
    FileText,
    CreditCard,
    Image as ImageIcon,
    UserPlus,
    Plus,
    X,
} from 'lucide-react';
import { StatusBadge, ClientStatusBadge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';

interface ContactPerson {
    name: string;
    phone: string;
}

interface VisitHistory {
    _id: string;
    visitDate: string;
    visitedBy: {
        _id: string;
        name: string;
        email: string;
    };
    status: 'pending' | 'visited' | 'rescheduled';
    feedback?: string;
    issues?: string;
    rescheduledDate?: string;
    siteImages?: string[];
    contactPersonsCollected?: ContactPerson[];
    registrationCompleted?: boolean;
    registrationDetails?: string;
    paymentScreenshots?: string[];
    documentImages?: string[];
    createdAt: string;
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
        email: string;
    };
    assignedVisitDate: string;
    meetingStatus: 'pending' | 'visited' | 'rescheduled';
    clientStatus: 'registered' | 'not_registered';
    visitHistory: VisitHistory[];
    createdBy: {
        _id: string;
        name: string;
    };
    createdAt: string;
}

export default function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { data: session } = useSession();
    const router = useRouter();
    const [client, setClient] = useState<Client | null>(null);
    const [loading, setLoading] = useState(true);
    const [showVisitModal, setShowVisitModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [activeTab, setActiveTab] = useState<'visited' | 'rescheduled' | 'feedback' | 'registration'>('visited');
    const [visitForm, setVisitForm] = useState({
        status: 'visited',
        feedback: '',
        issues: '',
        rescheduledDate: '',
        registrationCompleted: false,
        registrationDetails: '',
        contactPersons: [{ name: '', phone: '' }],
        siteImages: [] as string[],
        paymentScreenshots: [] as string[],
        documentImages: [] as string[],
    });
    const [submitting, setSubmitting] = useState(false);

    const fetchClient = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/clients/${id}`);
            const data = await response.json();

            if (response.ok) {
                setClient(data.client);
            } else {
                throw new Error(data.error);
            }
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Failed to fetch client');
            router.push('/dashboard/clients');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchClient();
    }, [id]);

    const handleDeleteClient = async () => {
        try {
            const response = await fetch(`/api/clients/${id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                toast.success('Client deleted successfully');
                router.push('/dashboard/clients');
            } else {
                const data = await response.json();
                throw new Error(data.error);
            }
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Failed to delete client');
        }
    };

    const handleAddVisit = async () => {
        setSubmitting(true);

        try {
            const response = await fetch(`/api/clients/${id}/visit`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    status: visitForm.status,
                    feedback: visitForm.feedback || undefined,
                    issues: visitForm.issues || undefined,
                    rescheduledDate: visitForm.rescheduledDate || undefined,
                    registrationCompleted: visitForm.registrationCompleted,
                    registrationDetails: visitForm.registrationDetails || undefined,
                    contactPersonsCollected: visitForm.contactPersons.filter((p) => p.name && p.phone),
                    siteImages: visitForm.siteImages,
                    paymentScreenshots: visitForm.paymentScreenshots,
                    documentImages: visitForm.documentImages,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                toast.success('Visit recorded successfully!');
                setClient(data.client);
                setShowVisitModal(false);
                resetVisitForm();
            } else {
                throw new Error(data.error);
            }
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Failed to record visit');
        } finally {
            setSubmitting(false);
        }
    };

    const resetVisitForm = () => {
        setVisitForm({
            status: 'visited',
            feedback: '',
            issues: '',
            rescheduledDate: '',
            registrationCompleted: false,
            registrationDetails: '',
            contactPersons: [{ name: '', phone: '' }],
            siteImages: [],
            paymentScreenshots: [],
            documentImages: [],
        });
        setActiveTab('visited');
    };

    const handleFileUpload = async (
        e: React.ChangeEvent<HTMLInputElement>,
        type: 'site_image' | 'payment' | 'document'
    ) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        for (const file of Array.from(files)) {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('type', type);

            try {
                const response = await fetch('/api/upload', {
                    method: 'POST',
                    body: formData,
                });

                const data = await response.json();

                if (response.ok) {
                    if (type === 'site_image') {
                        setVisitForm((prev) => ({
                            ...prev,
                            siteImages: [...prev.siteImages, data.url],
                        }));
                    } else if (type === 'payment') {
                        setVisitForm((prev) => ({
                            ...prev,
                            paymentScreenshots: [...prev.paymentScreenshots, data.url],
                        }));
                    } else {
                        setVisitForm((prev) => ({
                            ...prev,
                            documentImages: [...prev.documentImages, data.url],
                        }));
                    }
                    toast.success('File uploaded successfully');
                } else {
                    throw new Error(data.error);
                }
            } catch (error) {
                toast.error(error instanceof Error ? error.message : 'Failed to upload file');
            }
        }
    };

    const addContactPerson = () => {
        setVisitForm((prev) => ({
            ...prev,
            contactPersons: [...prev.contactPersons, { name: '', phone: '' }],
        }));
    };

    const removeContactPerson = (index: number) => {
        setVisitForm((prev) => ({
            ...prev,
            contactPersons: prev.contactPersons.filter((_, i) => i !== index),
        }));
    };

    const updateContactPerson = (index: number, field: 'name' | 'phone', value: string) => {
        setVisitForm((prev) => ({
            ...prev,
            contactPersons: prev.contactPersons.map((p, i) =>
                i === index ? { ...p, [field]: value } : p
            ),
        }));
    };

    if (loading) {
        return (
            <div className="loading" style={{ minHeight: '50vh' }}>
                <div className="spinner" />
            </div>
        );
    }

    if (!client) {
        return null;
    }

    return (
        <div>
            {/* Header */}
            <div className="page-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <Link href="/dashboard/clients" className="btn btn-ghost" style={{ padding: '0.5rem' }}>
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <h1 className="page-title">{client.name}</h1>
                        <p className="page-subtitle">Client Details & Visit History</p>
                    </div>
                </div>
                <div className="action-buttons">
                    <button className="btn btn-primary" onClick={() => setShowVisitModal(true)}>
                        <Plus size={18} />
                        Record Visit
                    </button>
                    {session?.user?.role === 'admin' && (
                        <>
                            <Link href={`/dashboard/clients/${id}/edit`} className="btn btn-secondary">
                                <Edit2 size={18} />
                                Edit
                            </Link>
                            <button className="btn btn-danger" onClick={() => setShowDeleteModal(true)}>
                                <Trash2 size={18} />
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Client Info Card */}
            <div className="card" style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                    <div className="client-avatar" style={{ width: 80, height: 80, fontSize: '2rem' }}>
                        {client.name.charAt(0).toUpperCase()}
                    </div>
                    <div style={{ flex: 1, minWidth: 250 }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
                            <div className="info-row" style={{ border: 'none', padding: 0 }}>
                                <MapPin size={16} style={{ color: 'var(--text-muted)' }} />
                                <div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Address</div>
                                    <div style={{ color: 'var(--text-primary)' }}>{client.address}</div>
                                </div>
                            </div>

                            <div className="info-row" style={{ border: 'none', padding: 0 }}>
                                <Phone size={16} style={{ color: 'var(--text-muted)' }} />
                                <div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Phone</div>
                                    <div style={{ color: 'var(--text-primary)' }}>{client.phone}</div>
                                </div>
                            </div>

                            <div className="info-row" style={{ border: 'none', padding: 0 }}>
                                <Calendar size={16} style={{ color: 'var(--text-muted)' }} />
                                <div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Visit Date</div>
                                    <div style={{ color: 'var(--text-primary)' }}>
                                        {format(new Date(client.assignedVisitDate), 'MMMM d, yyyy')}
                                    </div>
                                </div>
                            </div>

                            <div className="info-row" style={{ border: 'none', padding: 0 }}>
                                <User size={16} style={{ color: 'var(--text-muted)' }} />
                                <div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Assigned To</div>
                                    <div style={{ color: 'var(--text-primary)' }}>{client.assignedTo.name}</div>
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                            <StatusBadge status={client.meetingStatus} />
                            <ClientStatusBadge status={client.clientStatus} />
                            {client.mapLocationLink && (
                                <a
                                    href={client.mapLocationLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn btn-ghost btn-sm"
                                >
                                    <MapPin size={16} />
                                    View on Map
                                    <ExternalLink size={14} />
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Visit History */}
            <h2 className="section-title" style={{ marginBottom: '1rem' }}>
                Visit History ({client.visitHistory.length})
            </h2>

            {client.visitHistory.length === 0 ? (
                <div className="empty-state card">
                    <Clock size={48} style={{ margin: '0 auto 1rem', color: 'var(--text-muted)' }} />
                    <h3 className="empty-state-title">No visits recorded</h3>
                    <p className="empty-state-description">Record the first visit to start tracking progress.</p>
                    <button className="btn btn-primary" onClick={() => setShowVisitModal(true)}>
                        <Plus size={18} />
                        Record Visit
                    </button>
                </div>
            ) : (
                <div className="timeline">
                    {[...client.visitHistory].reverse().map((visit, index) => (
                        <div key={visit._id || index} className="timeline-item">
                            <div
                                className={`timeline-dot ${visit.status === 'visited' ? 'success' : visit.status === 'rescheduled' ? 'violet' : 'warning'
                                    }`}
                            />
                            <div className="timeline-content">
                                <div className="timeline-date">
                                    {format(new Date(visit.createdAt), 'MMMM d, yyyy \'at\' h:mm a')}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                                    <StatusBadge status={visit.status} />
                                    <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                        by {visit.visitedBy?.name || 'Unknown'}
                                    </span>
                                </div>

                                {visit.feedback && (
                                    <div style={{ marginBottom: '0.75rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                                            <MessageSquare size={14} style={{ color: 'var(--primary-400)' }} />
                                            <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-muted)' }}>Feedback</span>
                                        </div>
                                        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{visit.feedback}</p>
                                    </div>
                                )}

                                {visit.issues && (
                                    <div style={{ marginBottom: '0.75rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                                            <AlertTriangle size={14} style={{ color: 'var(--accent-amber)' }} />
                                            <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-muted)' }}>Issues</span>
                                        </div>
                                        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{visit.issues}</p>
                                    </div>
                                )}

                                {visit.rescheduledDate && (
                                    <div style={{ marginBottom: '0.75rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                                            <RefreshCw size={14} style={{ color: 'var(--accent-violet)' }} />
                                            <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-muted)' }}>Rescheduled To</span>
                                        </div>
                                        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                            {format(new Date(visit.rescheduledDate), 'MMMM d, yyyy')}
                                        </p>
                                    </div>
                                )}

                                {visit.registrationCompleted && (
                                    <div style={{ marginBottom: '0.75rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                                            <CheckCircle size={14} style={{ color: 'var(--accent-emerald)' }} />
                                            <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-muted)' }}>Registration Completed</span>
                                        </div>
                                        {visit.registrationDetails && (
                                            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{visit.registrationDetails}</p>
                                        )}
                                    </div>
                                )}

                                {visit.contactPersonsCollected && visit.contactPersonsCollected.length > 0 && (
                                    <div style={{ marginBottom: '0.75rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                            <UserPlus size={14} style={{ color: 'var(--primary-400)' }} />
                                            <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-muted)' }}>Contact Persons</span>
                                        </div>
                                        <div className="table-container" style={{ marginTop: '0.5rem' }}>
                                            <table className="table">
                                                <thead>
                                                    <tr>
                                                        <th>Name</th>
                                                        <th>Phone</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {visit.contactPersonsCollected.map((person, pIndex) => (
                                                        <tr key={pIndex}>
                                                            <td>{person.name}</td>
                                                            <td>{person.phone}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}

                                {/* Images Grid */}
                                {((visit.siteImages && visit.siteImages.length > 0) ||
                                    (visit.paymentScreenshots && visit.paymentScreenshots.length > 0) ||
                                    (visit.documentImages && visit.documentImages.length > 0)) && (
                                        <div style={{ marginTop: '1rem' }}>
                                            {visit.siteImages && visit.siteImages.length > 0 && (
                                                <div style={{ marginBottom: '1rem' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                                        <ImageIcon size={14} style={{ color: 'var(--primary-400)' }} />
                                                        <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-muted)' }}>Site Images</span>
                                                    </div>
                                                    <div className="image-gallery">
                                                        {visit.siteImages.map((img, imgIndex) => (
                                                            <div key={imgIndex} className="image-item">
                                                                <img src={img} alt={`Site ${imgIndex + 1}`} />
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {visit.paymentScreenshots && visit.paymentScreenshots.length > 0 && (
                                                <div style={{ marginBottom: '1rem' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                                        <CreditCard size={14} style={{ color: 'var(--accent-emerald)' }} />
                                                        <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-muted)' }}>Payment Screenshots</span>
                                                    </div>
                                                    <div className="image-gallery">
                                                        {visit.paymentScreenshots.map((img, imgIndex) => (
                                                            <div key={imgIndex} className="image-item">
                                                                <img src={img} alt={`Payment ${imgIndex + 1}`} />
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {visit.documentImages && visit.documentImages.length > 0 && (
                                                <div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                                        <FileText size={14} style={{ color: 'var(--accent-amber)' }} />
                                                        <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-muted)' }}>Documents</span>
                                                    </div>
                                                    <div className="image-gallery">
                                                        {visit.documentImages.map((img, imgIndex) => (
                                                            <div key={imgIndex} className="image-item">
                                                                <img src={img} alt={`Document ${imgIndex + 1}`} />
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Record Visit Modal */}
            <Modal
                isOpen={showVisitModal}
                onClose={() => {
                    setShowVisitModal(false);
                    resetVisitForm();
                }}
                title="Record Visit"
                size="lg"
                footer={
                    <>
                        <button
                            className="btn btn-secondary"
                            onClick={() => {
                                setShowVisitModal(false);
                                resetVisitForm();
                            }}
                        >
                            Cancel
                        </button>
                        <button className="btn btn-primary" onClick={handleAddVisit} disabled={submitting}>
                            {submitting ? (
                                <>
                                    <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <CheckCircle size={16} />
                                    Save Visit
                                </>
                            )}
                        </button>
                    </>
                }
            >
                {/* Tabs */}
                <div className="tabs" style={{ marginBottom: '1.5rem' }}>
                    <button
                        className={`tab ${activeTab === 'visited' ? 'active' : ''}`}
                        onClick={() => setActiveTab('visited')}
                    >
                        <CheckCircle size={16} />
                        Visited
                    </button>
                    <button
                        className={`tab ${activeTab === 'rescheduled' ? 'active' : ''}`}
                        onClick={() => setActiveTab('rescheduled')}
                    >
                        <RefreshCw size={16} />
                        Reschedule
                    </button>
                    <button
                        className={`tab ${activeTab === 'feedback' ? 'active' : ''}`}
                        onClick={() => setActiveTab('feedback')}
                    >
                        <MessageSquare size={16} />
                        Feedback
                    </button>
                    <button
                        className={`tab ${activeTab === 'registration' ? 'active' : ''}`}
                        onClick={() => setActiveTab('registration')}
                    >
                        <FileText size={16} />
                        Registration
                    </button>
                </div>

                {/* Visited Tab */}
                {activeTab === 'visited' && (
                    <div>
                        <div className="form-group">
                            <label className="form-label">Visit Status</label>
                            <select
                                className="form-input form-select"
                                value={visitForm.status}
                                onChange={(e) => setVisitForm({ ...visitForm, status: e.target.value })}
                            >
                                <option value="visited">Visited</option>
                                <option value="rescheduled">Rescheduled</option>
                                <option value="pending">Pending</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Site Visit Images</label>
                            <input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={(e) => handleFileUpload(e, 'site_image')}
                                style={{ display: 'none' }}
                                id="site-images"
                            />
                            <label htmlFor="site-images" className="file-upload">
                                <ImageIcon size={32} style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }} />
                                <div className="file-upload-text">Click to upload site images</div>
                                <div className="file-upload-hint">JPG, PNG, GIF up to 10MB</div>
                            </label>
                            {visitForm.siteImages.length > 0 && (
                                <div className="image-gallery" style={{ marginTop: '1rem' }}>
                                    {visitForm.siteImages.map((img, index) => (
                                        <div key={index} className="image-item" style={{ position: 'relative' }}>
                                            <img src={img} alt={`Site ${index + 1}`} />
                                            <button
                                                style={{
                                                    position: 'absolute',
                                                    top: 4,
                                                    right: 4,
                                                    width: 24,
                                                    height: 24,
                                                    borderRadius: '50%',
                                                    background: 'var(--accent-rose)',
                                                    border: 'none',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    cursor: 'pointer',
                                                }}
                                                onClick={() =>
                                                    setVisitForm((prev) => ({
                                                        ...prev,
                                                        siteImages: prev.siteImages.filter((_, i) => i !== index),
                                                    }))
                                                }
                                            >
                                                <X size={14} color="white" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="form-group">
                            <label className="form-label">Contact Persons Collected</label>
                            {visitForm.contactPersons.map((person, index) => (
                                <div key={index} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="Name"
                                        value={person.name}
                                        onChange={(e) => updateContactPerson(index, 'name', e.target.value)}
                                        style={{ flex: 1 }}
                                    />
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="Phone"
                                        value={person.phone}
                                        onChange={(e) => updateContactPerson(index, 'phone', e.target.value)}
                                        style={{ flex: 1 }}
                                    />
                                    {visitForm.contactPersons.length > 1 && (
                                        <button
                                            className="btn btn-ghost"
                                            style={{ padding: '0.5rem' }}
                                            onClick={() => removeContactPerson(index)}
                                        >
                                            <X size={16} />
                                        </button>
                                    )}
                                </div>
                            ))}
                            <button className="btn btn-ghost btn-sm" onClick={addContactPerson}>
                                <Plus size={14} />
                                Add Contact
                            </button>
                        </div>
                    </div>
                )}

                {/* Rescheduled Tab */}
                {activeTab === 'rescheduled' && (
                    <div>
                        <div className="form-group">
                            <label className="form-label">Reschedule To</label>
                            <input
                                type="date"
                                className="form-input"
                                value={visitForm.rescheduledDate}
                                onChange={(e) =>
                                    setVisitForm({
                                        ...visitForm,
                                        rescheduledDate: e.target.value,
                                        status: 'rescheduled',
                                    })
                                }
                            />
                        </div>
                        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                            Setting a reschedule date will automatically update the visit status to &quot;Rescheduled&quot;.
                        </p>
                    </div>
                )}

                {/* Feedback Tab */}
                {activeTab === 'feedback' && (
                    <div>
                        <div className="form-group">
                            <label className="form-label">Feedback</label>
                            <textarea
                                className="form-input form-textarea"
                                placeholder="Enter visit feedback..."
                                value={visitForm.feedback}
                                onChange={(e) => setVisitForm({ ...visitForm, feedback: e.target.value })}
                                rows={4}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Issues / Concerns</label>
                            <textarea
                                className="form-input form-textarea"
                                placeholder="Note any issues or concerns..."
                                value={visitForm.issues}
                                onChange={(e) => setVisitForm({ ...visitForm, issues: e.target.value })}
                                rows={4}
                            />
                        </div>
                    </div>
                )}

                {/* Registration Tab */}
                {activeTab === 'registration' && (
                    <div>
                        <div className="form-group">
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                                <input
                                    type="checkbox"
                                    checked={visitForm.registrationCompleted}
                                    onChange={(e) => setVisitForm({ ...visitForm, registrationCompleted: e.target.checked })}
                                    style={{ width: 20, height: 20 }}
                                />
                                <span className="form-label" style={{ margin: 0 }}>
                                    Registration Completed
                                </span>
                            </label>
                        </div>

                        {visitForm.registrationCompleted && (
                            <>
                                <div className="form-group">
                                    <label className="form-label">Registration Details</label>
                                    <textarea
                                        className="form-input form-textarea"
                                        placeholder="Enter registration details..."
                                        value={visitForm.registrationDetails}
                                        onChange={(e) => setVisitForm({ ...visitForm, registrationDetails: e.target.value })}
                                        rows={3}
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Payment Screenshots</label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        onChange={(e) => handleFileUpload(e, 'payment')}
                                        style={{ display: 'none' }}
                                        id="payment-images"
                                    />
                                    <label htmlFor="payment-images" className="file-upload">
                                        <CreditCard size={32} style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }} />
                                        <div className="file-upload-text">Click to upload payment proof</div>
                                    </label>
                                    {visitForm.paymentScreenshots.length > 0 && (
                                        <div className="image-gallery" style={{ marginTop: '1rem' }}>
                                            {visitForm.paymentScreenshots.map((img, index) => (
                                                <div key={index} className="image-item" style={{ position: 'relative' }}>
                                                    <img src={img} alt={`Payment ${index + 1}`} />
                                                    <button
                                                        style={{
                                                            position: 'absolute',
                                                            top: 4,
                                                            right: 4,
                                                            width: 24,
                                                            height: 24,
                                                            borderRadius: '50%',
                                                            background: 'var(--accent-rose)',
                                                            border: 'none',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            cursor: 'pointer',
                                                        }}
                                                        onClick={() =>
                                                            setVisitForm((prev) => ({
                                                                ...prev,
                                                                paymentScreenshots: prev.paymentScreenshots.filter((_, i) => i !== index),
                                                            }))
                                                        }
                                                    >
                                                        <X size={14} color="white" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Document Images</label>
                                    <input
                                        type="file"
                                        accept="image/*,application/pdf"
                                        multiple
                                        onChange={(e) => handleFileUpload(e, 'document')}
                                        style={{ display: 'none' }}
                                        id="document-images"
                                    />
                                    <label htmlFor="document-images" className="file-upload">
                                        <FileText size={32} style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }} />
                                        <div className="file-upload-text">Click to upload documents</div>
                                    </label>
                                    {visitForm.documentImages.length > 0 && (
                                        <div className="image-gallery" style={{ marginTop: '1rem' }}>
                                            {visitForm.documentImages.map((img, index) => (
                                                <div key={index} className="image-item" style={{ position: 'relative' }}>
                                                    <img src={img} alt={`Document ${index + 1}`} />
                                                    <button
                                                        style={{
                                                            position: 'absolute',
                                                            top: 4,
                                                            right: 4,
                                                            width: 24,
                                                            height: 24,
                                                            borderRadius: '50%',
                                                            background: 'var(--accent-rose)',
                                                            border: 'none',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            cursor: 'pointer',
                                                        }}
                                                        onClick={() =>
                                                            setVisitForm((prev) => ({
                                                                ...prev,
                                                                documentImages: prev.documentImages.filter((_, i) => i !== index),
                                                            }))
                                                        }
                                                    >
                                                        <X size={14} color="white" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                )}
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                title="Delete Client"
                footer={
                    <>
                        <button className="btn btn-secondary" onClick={() => setShowDeleteModal(false)}>
                            Cancel
                        </button>
                        <button className="btn btn-danger" onClick={handleDeleteClient}>
                            <Trash2 size={16} />
                            Delete
                        </button>
                    </>
                }
            >
                <p style={{ color: 'var(--text-secondary)' }}>
                    Are you sure you want to delete <strong>{client.name}</strong>? This action cannot be undone
                    and all visit history will be permanently removed.
                </p>
            </Modal>
        </div>
    );
}
