import React, { useState } from 'react';
import { Pill, ChevronDown, ChevronUp, CheckCircle2, AlertCircle } from 'lucide-react';

const MedicineCard = ({ medicine = {}, index = 0 }) => {
  const [expanded, setExpanded] = useState(false);

  const rawName = medicine.name || `Medication ${index + 1}`;
  const strength = medicine.strength || '';
  const fullName = strength ? `${rawName} ${strength}` : rawName;
  const form = medicine.form || medicine.type || (rawName.toLowerCase().includes('cap') ? 'Capsule' : 'Tablet');
  const dose = medicine.dose || '1 dose';
  const frequency = medicine.frequency || 'Twice daily';
  const timing = medicine.timing || 'After meals';
  const duration = medicine.duration || '5 days';
  const needsVerification = medicine.needsVerification || medicine.isUncertain || false;

  return (
    <div
      style={{
        backgroundColor: 'var(--bg-card)',
        borderRadius: 'var(--radius-lg)',
        border: needsVerification ? '1.5px solid #FCD34D' : '1px solid var(--border-card)',
        padding: '18px 20px',
        boxShadow: 'var(--shadow-sm)',
        transition: 'all 0.2s ease'
      }}
    >
      {/* Card Summary Row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="flex items-center gap-3">
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '50%',
            backgroundColor: 'var(--light-mint)',
            color: 'var(--primary-green)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <Pill size={22} />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h4 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                💊 {fullName}
              </h4>
              <span className="badge-status" style={{
                fontSize: '11px',
                padding: '2px 8px',
                backgroundColor: needsVerification ? '#FEF3C7' : 'var(--light-mint)',
                color: needsVerification ? '#D97706' : 'var(--dark-green)',
                fontWeight: 600
              }}>
                {form}
              </span>
            </div>

            <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
              Dose: <strong style={{ color: 'var(--text-primary)' }}>{dose}</strong> • {frequency} • {timing} • ({duration})
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {needsVerification ? (
            <span className="badge-status" style={{ backgroundColor: '#FEF3C7', color: '#D97706', fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <AlertCircle size={13} /> Needs verification
            </span>
          ) : (
            <span className="badge-status badge-taken" style={{ fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <CheckCircle2 size={13} /> ✓ AI extracted
            </span>
          )}

          <button
            onClick={() => setExpanded(!expanded)}
            style={{
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              padding: '4px'
            }}
            aria-label={expanded ? 'Collapse details' : 'Expand details'}
          >
            {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
        </div>
      </div>

      {/* Expanded Grid Details View */}
      {expanded && (
        <div style={{
          marginTop: '16px',
          paddingTop: '16px',
          borderTop: '1px solid var(--border-subtle)',
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '12px',
          fontSize: '12px'
        }}>
          <div style={{ backgroundColor: 'var(--bg-app)', padding: '10px 12px', borderRadius: 'var(--radius-sm)' }}>
            <span style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '2px', fontWeight: 600 }}>Dose</span>
            <strong style={{ color: 'var(--text-primary)', fontSize: '13px' }}>{dose}</strong>
          </div>

          <div style={{ backgroundColor: 'var(--bg-app)', padding: '10px 12px', borderRadius: 'var(--radius-sm)' }}>
            <span style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '2px', fontWeight: 600 }}>Frequency</span>
            <strong style={{ color: 'var(--text-primary)', fontSize: '13px' }}>{frequency}</strong>
          </div>

          <div style={{ backgroundColor: 'var(--bg-app)', padding: '10px 12px', borderRadius: 'var(--radius-sm)' }}>
            <span style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '2px', fontWeight: 600 }}>Timing</span>
            <strong style={{ color: 'var(--text-primary)', fontSize: '13px' }}>{timing}</strong>
          </div>

          <div style={{ backgroundColor: 'var(--bg-app)', padding: '10px 12px', borderRadius: 'var(--radius-sm)' }}>
            <span style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '2px', fontWeight: 600 }}>Course Duration</span>
            <strong style={{ color: 'var(--text-primary)', fontSize: '13px' }}>{duration}</strong>
          </div>
        </div>
      )}
    </div>
  );
};

export default MedicineCard;
