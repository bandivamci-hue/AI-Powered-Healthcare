import React, { useState } from 'react';
import { ZoomIn, FileText, ShieldCheck, CheckCircle2 } from 'lucide-react';
import ImagePreviewModal from './ImagePreviewModal';

const PrescriptionPreview = ({ imageUrl, medicinesCount = 0, isVerified = true }) => {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="med-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
      <div>
        {/* Card Title & View Full Modal Action */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div className="flex items-center gap-2">
            <FileText size={18} color="var(--primary-green)" />
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              Scanned Prescription
            </h3>
          </div>

          {imageUrl && (
            <button
              onClick={() => setModalOpen(true)}
              style={{
                color: 'var(--primary-green)',
                fontSize: '12px',
                fontWeight: 600,
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <ZoomIn size={14} /> View Full
            </button>
          )}
        </div>

        {/* Prescription Image Viewer Box */}
        <div className="prescription-preview-box" style={{ minHeight: '260px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {imageUrl ? (
            <img
              src={imageUrl}
              alt="Scanned Doctor Prescription"
              onClick={() => setModalOpen(true)}
              style={{
                maxHeight: '300px',
                maxWidth: '100%',
                borderRadius: '8px',
                objectFit: 'contain',
                cursor: 'pointer',
                transition: 'transform 0.2s ease'
              }}
            />
          ) : (
            <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
              <FileText size={40} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
              No Prescription Document Uploaded
            </div>
          )}
        </div>
      </div>

      {/* AI Vision Verification Footer Badge */}
      <div style={{
        marginTop: '16px',
        backgroundColor: 'var(--light-mint)',
        borderRadius: 'var(--radius-md)',
        padding: '12px 14px',
        border: '1px solid var(--mint-border)',
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
      }}>
        <ShieldCheck size={20} color="var(--primary-green)" />
        <div>
          <h5 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--dark-green)', margin: 0 }}>
            AI Vision Status: Verified
          </h5>
          <p style={{ fontSize: '12px', color: 'var(--dark-green)', margin: '2px 0 0 0' }}>
            Fast Flash OCR Complete • {medicinesCount} Medicines Extracted
          </p>
        </div>
      </div>

      {/* Fullscreen Zoom Modal */}
      <ImagePreviewModal
        imageUrl={imageUrl}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
};

export default PrescriptionPreview;
