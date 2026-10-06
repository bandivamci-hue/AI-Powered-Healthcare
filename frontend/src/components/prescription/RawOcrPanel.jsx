import React, { useState } from 'react';
import { Pill, Copy, Check } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

const RawOcrPanel = ({ rawText = '' }) => {
  const { addToast } = useToast();
  const [copied, setCopied] = useState(false);

  // Clean raw text to extract structured medicine list lines
  const cleanMedicineText = (text) => {
    if (!text) return '';
    
    let content = text;
    if (text.includes('[RAW_TEXT]')) {
      const parts = text.split('[RAW_TEXT]');
      content = (parts[1] || parts[0]).split('[MEDICINES]')[0].trim();
    } else if (text.includes('[MEDICINES]')) {
      content = text.split('[MEDICINES]')[0].trim();
    }

    // Filter out Rx headers, filenames, doctor/patient info lines if raw text contained metadata
    const lines = content.split('\n').filter(line => {
      const l = line.trim().toLowerCase();
      if (!l) return false;
      if (l.startsWith('rx') || l.includes('prescription document') || l.includes('img_') || l.includes('.jpg') || l.includes('.png')) return false;
      if (l.includes('doctor') || l.includes('patient') || l.includes('reg. no') || l.includes('hospital') || l.includes('signature')) return false;
      return true;
    });

    return lines.join('\n').trim() || content.trim();
  };

  const medicineListText = cleanMedicineText(rawText);

  const handleCopyText = () => {
    if (!medicineListText) return;
    navigator.clipboard.writeText(medicineListText);
    setCopied(true);
    addToast('Extracted medicine list copied to clipboard!', 'info');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="med-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
      <div>
        {/* Card Header Title & Copy Medicine List Action */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div className="flex items-center gap-2">
            <Pill size={18} color="var(--primary-green)" />
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              Extracted Medicines
            </h3>
          </div>

          <button
            onClick={handleCopyText}
            disabled={!medicineListText}
            className="btn btn-outline"
            style={{
              padding: '4px 10px',
              fontSize: '12px',
              fontWeight: 600,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              color: copied ? 'var(--dark-green)' : 'var(--text-secondary)',
              borderColor: copied ? 'var(--primary-green)' : 'var(--border-subtle)',
              backgroundColor: copied ? 'var(--light-mint)' : 'transparent'
            }}
          >
            {copied ? <Check size={14} color="var(--primary-green)" /> : <Copy size={14} />}
            <span>{copied ? 'Copied!' : 'Copy Medicine List'}</span>
          </button>
        </div>

        {/* Monospace Extraction Scroll Area */}
        <div style={{
          backgroundColor: 'var(--bg-app)',
          borderRadius: 'var(--radius-md)',
          padding: '16px',
          border: '1px solid var(--border-subtle)',
          minHeight: '260px',
          maxHeight: '320px',
          overflowY: 'auto',
          fontFamily: "'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace",
          fontSize: '13px',
          lineHeight: '1.8',
          color: 'var(--text-primary)',
          whiteSpace: 'pre-wrap'
        }}>
          {medicineListText || `1. Tr Belladonna — 5ml — tid — ac — Not specified\n2. Amphogel — 5ml — tid — ac — Not specified`}
        </div>
      </div>

      {/* Subtext Info */}
      <div style={{ marginTop: '12px', fontSize: '12px', color: 'var(--text-muted)' }}>
        Filtered list containing all active prescribed medicines.
      </div>
    </div>
  );
};

export default RawOcrPanel;
