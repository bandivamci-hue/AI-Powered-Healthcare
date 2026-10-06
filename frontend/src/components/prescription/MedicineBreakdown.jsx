import React from 'react';
import MedicineCard from './MedicineCard';
import { Pill } from 'lucide-react';

const MedicineBreakdown = ({ medicines = [] }) => {
  return (
    <div className="med-card" style={{ marginBottom: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div className="flex items-center gap-2">
          <Pill size={20} color="var(--primary-green)" />
          <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
            Extracted Medicine Breakdown ({medicines.length})
          </h3>
        </div>
        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
          Click any card to expand full dosage & timing instructions
        </span>
      </div>

      {medicines && medicines.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {medicines.map((med, idx) => (
            <MedicineCard key={med.id || idx} medicine={med} index={idx} />
          ))}
        </div>
      ) : (
        <div style={{
          padding: '36px',
          textAlign: 'center',
          color: 'var(--text-muted)',
          fontSize: '13px',
          backgroundColor: 'var(--bg-app)',
          borderRadius: 'var(--radius-md)'
        }}>
          No medicines detected in current prescription document.
        </div>
      )}
    </div>
  );
};

export default MedicineBreakdown;
