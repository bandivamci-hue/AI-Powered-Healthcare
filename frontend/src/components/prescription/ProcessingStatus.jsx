import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CheckCircle2, RotateCw, Sparkles, ShieldCheck } from 'lucide-react';

const ProcessingStatus = ({ totalMedicines = 0, isProcessing = false }) => {
  const navigate = useNavigate();

  return (
    <div style={{ marginBottom: '24px' }}>
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '14px' }}>
        <Link to="/dashboard" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Dashboard</Link>
        <span style={{ margin: '0 8px', color: 'var(--text-light)' }}>/</span>
        <Link to="/scan-prescription" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Scan Prescription</Link>
        <span style={{ margin: '0 8px', color: 'var(--text-light)' }}>/</span>
        <span style={{ color: 'var(--primary-green)', fontWeight: 600 }}>Prescription Results</span>
      </nav>

      {/* Main Verification Banner Row */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px',
        backgroundColor: 'var(--bg-card)',
        padding: '20px 24px',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-card)',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div className="flex items-center gap-3">
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '50%',
            backgroundColor: 'var(--light-mint)',
            color: 'var(--primary-green)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <CheckCircle2 size={26} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                Prescription Processed & Verified
              </h1>
              <span className="badge-status badge-taken" style={{ fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <ShieldCheck size={13} /> OCR Complete
              </span>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px', marginBottom: 0 }}>
              Your prescription has been analyzed. Please review the extracted information before creating your medicine schedule.
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate('/scan-prescription')}
          className="btn btn-outline-green"
          style={{ padding: '8px 16px', fontSize: '13px', borderRadius: 'var(--radius-md)' }}
        >
          <RotateCw size={15} /> Scan Another
        </button>
      </div>
    </div>
  );
};

export default ProcessingStatus;
