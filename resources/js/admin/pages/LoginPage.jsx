import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Store, Lock, Mail, AlertCircle, ArrowRight, Sun, Moon } from 'lucide-react';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const { login } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSubmitting(true);

        try {
            await login(email, password);
            navigate('/');
        } catch (err) {
            console.error('Login error:', err);
            setError(err.response?.data?.message || err.message || 'Invalid admin credentials.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'var(--admin-bg)',
            padding: '20px',
            position: 'relative',
        }}>
            <div style={{ position: 'absolute', top: '20px', right: '20px' }}>
                <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={toggleTheme}
                    title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
                    style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                    {theme === 'dark' ? <Sun size={16} style={{ color: '#f59e0b' }} /> : <Moon size={16} style={{ color: '#6366f1' }} />}
                    <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{theme === 'dark' ? 'Light' : 'Dark'}</span>
                </button>
            </div>
            <div className="modal-card" style={{ maxWidth: '420px', width: '100%' }}>
                {/* Brand Header */}
                <div style={{ textAlignment: 'center', textAlign: 'center', marginBottom: '28px' }}>
                    <div className="sidebar-brand-logo" style={{ width: '48px', height: '48px', margin: '0 auto 16px', fontSize: '1.2rem' }}>
                        <Store size={24} />
                    </div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--admin-text)' }}>Admin Portal</h2>
                    <p style={{ fontSize: '0.875rem', color: 'var(--admin-muted)', marginTop: '4px' }}>Sign in to access your e-commerce dashboard</p>
                </div>

                {error && (
                    <div style={{
                        padding: '12px 16px',
                        backgroundColor: 'var(--admin-danger-light)',
                        color: 'var(--admin-danger)',
                        borderRadius: '8px',
                        fontSize: '0.875rem',
                        marginBottom: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}>
                        <AlertCircle size={18} />
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '18px' }}>
                        <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--admin-muted)', display: 'block', marginBottom: '6px' }}>
                            Admin Email Address
                        </label>
                        <div style={{ position: 'relative' }}>
                            <Mail size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--admin-subtle)' }} />
                            <input
                                type="email"
                                className="form-control"
                                placeholder="admin@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                style={{ paddingLeft: '38px' }}
                                required
                            />
                        </div>
                    </div>

                    <div style={{ marginBottom: '24px' }}>
                        <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--admin-muted)', display: 'block', marginBottom: '6px' }}>
                            Password
                        </label>
                        <div style={{ position: 'relative' }}>
                            <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--admin-subtle)' }} />
                            <input
                                type="password"
                                className="form-control"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                style={{ paddingLeft: '38px' }}
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary"
                        style={{ width: '100%', justifyContent: 'center', padding: '12px' }}
                        disabled={submitting}
                    >
                        <span>{submitting ? 'Authenticating...' : 'Sign In to Panel'}</span>
                        <ArrowRight size={16} />
                    </button>
                </form>
            </div>
        </div>
    );
}
