import React from 'react';
import { Pill, ShieldCheck, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer 
      className="app-footer" 
      style={{ 
        backgroundColor: '#0F172A', 
        color: '#94A3B8', 
        padding: '60px 0 32px', 
        borderTop: '1px solid #1E293B',
        width: '100%',
        boxSizing: 'border-box'
      }}
    >
      <div className="container" style={{ padding: '0 7%', maxWidth: '1440px', margin: '0 auto', boxSizing: 'border-box' }}>
        <div className="footer-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '36px', marginBottom: '44px' }}>
          {/* Brand Col */}
          <div style={{ maxWidth: '320px' }}>
            <div className="brand-logo" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <div style={{
                width: '38px',
                height: '38px',
                background: 'linear-gradient(135deg, #10B981 0%, #047857 100%)',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                flexShrink: 0
              }}>
                <Pill size={20} style={{ transform: 'rotate(-45deg)' }} />
              </div>
              <div>
                <span style={{ fontSize: '19px', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.3px' }}>MediCare AI</span>
              </div>
            </div>
            <p style={{ fontSize: '13.5px', lineHeight: '1.6', marginBottom: '18px', color: '#94A3B8' }}>
              Understand your medical information, manage your medicines, and stay connected with your health — in a simple and accessible way.
            </p>
            <div className="flex items-center gap-2" style={{ color: '#10B981', fontSize: '13px', fontWeight: 600 }}>
              <ShieldCheck size={18} /> Safe & Protected Health Data
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h4 style={{ color: '#FFFFFF', fontSize: '15px', fontWeight: 700, marginBottom: '16px' }}>Product</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13.5px' }}>
              <li><a href="#features" style={{ color: '#94A3B8', textDecoration: 'none', transition: 'color 0.2s' }}>Features</a></li>
              <li><a href="#how-it-works" style={{ color: '#94A3B8', textDecoration: 'none', transition: 'color 0.2s' }}>How It Works</a></li>
              <li><Link to="/scan-prescription" style={{ color: '#94A3B8', textDecoration: 'none', transition: 'color 0.2s' }}>Prescription Scanner</Link></li>
              <li><Link to="/reminders" style={{ color: '#94A3B8', textDecoration: 'none', transition: 'color 0.2s' }}>Medication Reminders</Link></li>
            </ul>
          </div>

          {/* Resources Links */}
          <div>
            <h4 style={{ color: '#FFFFFF', fontSize: '15px', fontWeight: 700, marginBottom: '16px' }}>Resources</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13.5px' }}>
              <li><Link to="/health-education" style={{ color: '#94A3B8', textDecoration: 'none', transition: 'color 0.2s' }}>Health Education</Link></li>
              <li><Link to="/emergency" style={{ color: '#94A3B8', textDecoration: 'none', transition: 'color 0.2s' }}>Emergency Finder</Link></li>
              <li><Link to="/history" style={{ color: '#94A3B8', textDecoration: 'none', transition: 'color 0.2s' }}>Medical History Vault</Link></li>
              <li><a href="#about" style={{ color: '#94A3B8', textDecoration: 'none', transition: 'color 0.2s' }}>Clinical AI Accuracy</a></li>
            </ul>
          </div>

          {/* Languages Supported */}
          <div>
            <h4 style={{ color: '#FFFFFF', fontSize: '15px', fontWeight: 700, marginBottom: '16px' }}>Languages</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13.5px', color: '#94A3B8' }}>
              <li>English</li>
              <li>Hindi (हिंदी)</li>
              <li>Telugu (తెలుగు)</li>
              <li>Tamil (தமிழ்)</li>
              <li>Kannada (ಕನ್ನಡ)</li>
            </ul>
          </div>
        </div>

        {/* Bottom Sub-bar */}
        <div style={{ borderTop: '1px solid #1E293B', paddingTop: '24px', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '12px', fontSize: '13px', color: '#64748B' }}>
          <p style={{ margin: 0 }}>© {new Date().getFullYear()} MediCare AI. All rights reserved.</p>
          <p className="flex items-center gap-1" style={{ margin: 0, color: '#94A3B8' }}>
            Built with <Heart size={14} color="#EF4444" fill="#EF4444" /> for accessible healthcare
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
