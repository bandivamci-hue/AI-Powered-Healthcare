import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Pill, 
  User, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  Camera, 
  Bell, 
  CheckCircle2, 
  ShieldCheck 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const RegisterPage = () => {
  const { addToast } = useToast();
  const { registerUser } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setError('Username and password are required.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await registerUser(username.trim(), email.trim(), password, fullName.trim());
      addToast('Account created successfully! Please sign in.', 'success');
      navigate('/login');
    } catch (err) {
      setError(err.detail || err.username?.[0] || 'Registration failed. Please check your inputs.');
      addToast('Registration failed.', 'error');
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
          {/* Bold Brand Header */}
          <Link to="/" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
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

          <h1 className="auth-headline" style={{ fontSize: '44px', lineHeight: '1.2', marginBottom: '8px', fontWeight: 800, color: 'var(--text-primary)' }}>
            Join MediCare AI<br />
            <span style={{ color: 'var(--primary-green)' }}>Simplify Your Health</span>
          </h1>

          <p style={{ color: 'var(--text-secondary)', fontSize: '16px', maxWidth: '400px', lineHeight: '1.5', marginBottom: '20px' }}>
            Create your patient account to securely scan prescriptions, schedule medication doses, and chat with your AI assistant.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
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
                <h5 style={{ fontSize: '13.5px', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>Prescription AI Scan</h5>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0 }}>Extract dosages and schedules instantly</p>
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
                <h5 style={{ fontSize: '13.5px', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>Personalized Reminders</h5>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0 }}>Never miss morning or evening doses</p>
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
                <ShieldCheck size={18} />
              </div>
              <div>
                <h5 style={{ fontSize: '13.5px', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>Encrypted Health Vault</h5>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0 }}>Your medical information remains confidential</p>
              </div>
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
            maxWidth: '460px',
            boxSizing: 'border-box'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: '16px' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              Already registered? <Link to="/login" style={{ color: 'var(--primary-green)', fontWeight: 700, textDecoration: 'none' }}>Login</Link>
            </span>
          </div>

          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 4px 0' }}>
              Create Your Account
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>
              Sign up in seconds to start managing your medications
            </p>
          </div>

          {error && (
            <div style={{ backgroundColor: '#FEE2E2', border: '1px solid #FCA5A5', color: '#991B1B', borderRadius: '8px', padding: '10px', fontSize: '12px', marginBottom: '16px' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group" style={{ marginBottom: '12px' }}>
              <label className="form-label" style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>Full Name</label>
              <div className="input-wrapper" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <User className="input-icon" size={16} style={{ position: 'absolute', left: '14px', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. Ravi Kumar"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px 10px 40px', borderRadius: '10px', fontSize: '13px', boxSizing: 'border-box' }}
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '12px' }}>
              <label className="form-label" style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>Username *</label>
              <div className="input-wrapper" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <User className="input-icon" size={16} style={{ position: 'absolute', left: '14px', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  className="input-field"
                  placeholder="Choose a username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  style={{ width: '100%', padding: '10px 14px 10px 40px', borderRadius: '10px', fontSize: '13px', boxSizing: 'border-box' }}
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '12px' }}>
              <label className="form-label" style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>Email (Optional)</label>
              <div className="input-wrapper" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Mail className="input-icon" size={16} style={{ position: 'absolute', left: '14px', color: 'var(--text-muted)' }} />
                <input
                  type="email"
                  className="input-field"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px 10px 40px', borderRadius: '10px', fontSize: '13px', boxSizing: 'border-box' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>Password *</label>
                <div className="input-wrapper" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <Lock className="input-icon" size={16} style={{ position: 'absolute', left: '12px', color: 'var(--text-muted)' }} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="input-field"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    style={{ width: '100%', padding: '10px 32px 10px 34px', borderRadius: '10px', fontSize: '13px', boxSizing: 'border-box' }}
                  />
                  <div className="password-toggle" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '10px', cursor: 'pointer', color: 'var(--text-muted)' }}>
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </div>
                </div>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>Confirm *</label>
                <div className="input-wrapper" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <Lock className="input-icon" size={16} style={{ position: 'absolute', left: '12px', color: 'var(--text-muted)' }} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="input-field"
                    placeholder="Confirm"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    style={{ width: '100%', padding: '10px 10px 10px 34px', borderRadius: '10px', fontSize: '13px', boxSizing: 'border-box' }}
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-full btn-lg"
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '10px',
                fontWeight: 700,
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
            <CheckCircle2 size={14} color="#10B981" /> Fast setup • Additional details can be added later
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
