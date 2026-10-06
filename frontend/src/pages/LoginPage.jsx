import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Pill, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  Camera, 
  Bell, 
  CheckCircle2, 
  Globe 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { loginUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Please enter both username and password.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await loginUser(username, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.detail || 'Failed to sign in. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="auth-page-container" 
      style={{
        backgroundImage: "url('/images/backgroundimg.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 6%',
        boxSizing: 'border-box'
      }}
    >
      {/* LEFT PANEL */}
      <div className="auth-left-panel" style={{ background: 'transparent', maxWidth: '440px', padding: '0' }}>
        <div>
          {/* Brand Header */}
          <Link to="/" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '12px', marginBottom: '18px' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #10B981 0%, #047857 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
            }}>
              <Pill size={22} style={{ transform: 'rotate(-45deg)' }} />
            </div>

            <div>
              <div style={{ fontSize: '20px', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>
                MediCare
              </div>
              <div style={{ fontSize: '9px', fontWeight: 700, color: 'var(--primary-green)', letterSpacing: '0.4px', textTransform: 'uppercase' }}>
                Your Medicine Assistant
              </div>
            </div>
          </Link>

          <h1 className="auth-headline" style={{ fontSize: '46px', lineHeight: '1.2', marginBottom: '8px', fontWeight: 800, color: 'var(--text-primary)' }}>
            Manage Your Health<br />
            <span style={{ color: 'var(--primary-green)' }}>The Smart Way</span>
          </h1>

          <p style={{ color: 'var(--text-secondary)', fontSize: '18px', maxWidth: '380px', lineHeight: '1.4', marginBottom: '16px' }}>
            Scan your prescription, get medicine details, set reminders and never miss a dose.
          </p>

          {/* 3 Interactive Highlight Badges */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '18px' }}>
            <div className="auth-feature-badge med-card" style={{
              borderRadius: '16px',
              padding: '12px 18px',
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              maxWidth: '340px'
            }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: 'var(--light-mint)', color: 'var(--primary-green)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Camera size={18} />
              </div>
              <div>
                <h5 style={{ fontSize: '13.5px', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>Scan Prescription</h5>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0 }}>Upload or capture prescription image</p>
              </div>
            </div>

            <div className="auth-feature-badge med-card" style={{
              borderRadius: '16px',
              padding: '12px 18px',
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              maxWidth: '340px'
            }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: 'var(--light-mint)', color: 'var(--primary-green)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Bell size={18} />
              </div>
              <div>
                <h5 style={{ fontSize: '13.5px', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>Smart Reminders</h5>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0 }}>Get timely reminders for your medicines</p>
              </div>
            </div>

            <div className="auth-feature-badge med-card" style={{
              borderRadius: '16px',
              padding: '12px 18px',
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              maxWidth: '340px'
            }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: 'var(--light-mint)', color: 'var(--primary-green)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CheckCircle2 size={18} />
              </div>
              <div>
                <h5 style={{ fontSize: '13.5px', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>Stay Healthy</h5>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0 }}>Track your medicines and stay on schedule</p>
              </div>
            </div>
          </div>

          <div className="auth-feature-badge med-card" style={{
            borderRadius: '20px',
            padding: '12px 20px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '14px'
          }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#10B981', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Pill size={20} style={{ transform: 'rotate(-45deg)' }} />
            </div>
            <div style={{ textAlign: 'left' }}>
              <span style={{ fontSize: '11px', color: 'var(--primary-green)', fontWeight: 800 }}>100% SECURE HEALTHCARE</span>
              <p style={{ fontSize: '12px', color: 'var(--text-primary)', fontWeight: 600, margin: 0 }}>AI Prescription Verification</p>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="auth-right-panel" style={{ flex: '1', display: 'flex', justifyContent: 'flex-end', zIndex: 2 }}>
        <div 
          className="auth-card med-card"
          style={{
            borderRadius: '28px',
            padding: '28px 34px',
            width: '100%',
            maxWidth: '420px',
            boxSizing: 'border-box'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div className="flex items-center gap-1" style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>
              <Globe size={15} /> English
            </div>
            <span style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>
              Don't have an account? <Link to="/register" style={{ color: 'var(--primary-green)', fontWeight: 600, textDecoration: 'none' }}>Sign Up</Link>
            </span>
          </div>

          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 4px 0' }}>
              Welcome Back!
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>
              Login to continue to your account
            </p>
          </div>

          {error && (
            <div style={{ backgroundColor: '#FEE2E2', border: '1px solid #FCA5A5', color: '#991B1B', borderRadius: '8px', padding: '10px', fontSize: '12px', marginBottom: '16px' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group" style={{ marginBottom: '14px' }}>
              <label className="form-label" style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '5px' }}>Email or Username</label>
              <div className="input-wrapper" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Mail className="input-icon" size={16} style={{ position: 'absolute', left: '14px', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  className="input-field"
                  placeholder="Enter your email or username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '11px 14px 11px 40px',
                    borderRadius: '10px',
                    fontSize: '13px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '8px' }}>
              <label className="form-label" style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '5px' }}>Password</label>
              <div className="input-wrapper" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Lock className="input-icon" size={16} style={{ position: 'absolute', left: '14px', color: 'var(--text-muted)' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="input-field"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '11px 38px 11px 40px',
                    borderRadius: '10px',
                    fontSize: '13px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
                <div className="password-toggle" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '12px', cursor: 'pointer', color: 'var(--text-muted)' }}>
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </div>
              </div>
            </div>

            <div style={{ textAlign: 'right', marginBottom: '18px' }}>
              <a href="#forgot" style={{ fontSize: '12px', color: 'var(--primary-green)', fontWeight: 600, textDecoration: 'none' }}>
                Forgot Password?
              </a>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-full btn-lg"
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '10px',
                border: 'none',
                fontWeight: 700,
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              {loading ? 'Signing in...' : 'Login'}
            </button>
          </form>

          <div style={{ display: 'flex', alignItems: 'center', margin: '18px 0', color: 'var(--text-muted)', fontSize: '11px' }}>
            <div style={{ flex: 1, borderBottom: '1px solid var(--border-subtle)' }}></div>
            <span style={{ padding: '0 10px', fontWeight: 600 }}>OR</span>
            <div style={{ flex: 1, borderBottom: '1px solid var(--border-subtle)' }}></div>
          </div>

          <button
            type="button"
            className="btn btn-outline btn-full"
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '13px'
            }}
            onClick={() => alert('Google authentication can be enabled in backend settings.')}
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" style={{ width: '16px', height: '16px', marginRight: '8px' }} />
            Continue with Google
          </button>

          <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
            <CheckCircle2 size={15} color="#10B981" /> Your data is safe and secure with us.
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;