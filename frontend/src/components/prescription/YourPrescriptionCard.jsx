import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Upload, ChevronUp, ChevronDown, CheckCircle2, Loader2, Sparkles } from 'lucide-react';
import ImagePreviewModal from './ImagePreviewModal';

const YourPrescriptionCard = ({ imageUrl, rawText, onRawTextChange, onTranslateClick, medicinesCount = 0, isReprocessing = false }) => {
  const navigate = useNavigate();
  const [showManualInput, setShowManualInput] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="med-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div>
        <div className="flex items-center gap-2" style={{ marginBottom: '4px' }}>
          <FileText size={20} color="var(--primary-green)" />
          <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
            Your Prescription
          </h3>
        </div>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>
          Uploaded prescription document and OCR transcribed text.
        </p>
      </div>

      {/* Uploaded Prescription Section */}
      <div style={{ backgroundColor: 'var(--bg-app)', borderRadius: 'var(--radius-md)', padding: '16px', border: '1px solid var(--border-subtle)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <strong style={{ fontSize: '13px', color: 'var(--text-primary)' }}>Uploaded Prescription</strong>
          <button
            onClick={() => navigate('/scan-prescription')}
            style={{ fontSize: '12px', color: 'var(--primary-green)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}
          >
            Clear
          </button>
        </div>

        {/* Prescription Image Viewer Box */}
        <div style={{
          backgroundColor: 'var(--bg-card)',
          borderRadius: 'var(--radius-md)',
          padding: '12px',
          border: '1px solid var(--border-subtle)',
          textAlign: 'center',
          cursor: 'pointer'
        }}
        onClick={() => setModalOpen(true)}
        >
          {imageUrl ? (
            <img
              src={imageUrl}
              alt="Uploaded Prescription"
              style={{
                maxHeight: '260px',
                maxWidth: '100%',
                borderRadius: '6px',
                objectFit: 'contain'
              }}
            />
          ) : (
            <div style={{ padding: '40px 20px', color: 'var(--text-muted)', fontSize: '13px' }}>
              <FileText size={36} style={{ margin: '0 auto 8px', opacity: 0.5 }} />
              Prescription Document Uploaded
            </div>
          )}
        </div>

        {/* Processed Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '12px', fontSize: '12px', color: 'var(--primary-green)', fontWeight: 600 }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--primary-green)', display: 'inline-block' }}></span>
          Prescription processed ({medicinesCount} medicines extracted)
        </div>
      </div>

      {/* Upload Another Prescription Button */}
      <button
        onClick={() => navigate('/scan-prescription')}
        className="btn btn-outline-green btn-full"
        style={{ padding: '10px 16px', fontSize: '13px', borderRadius: 'var(--radius-md)' }}
      >
        <Upload size={15} /> Upload another prescription
      </button>

      {/* Manual Text Input Section (Raw OCR Text) */}
      <div style={{ paddingTop: '8px', borderTop: '1px solid var(--border-subtle)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <button
            onClick={() => setShowManualInput(!showManualInput)}
            style={{
              fontSize: '13px',
              color: 'var(--text-primary)',
              fontWeight: 700,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            {showManualInput ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
            <span>Raw OCR Text</span>
          </button>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            Source: OCR extracted text
          </span>
        </div>

        {showManualInput && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <textarea
              value={rawText}
              onChange={(e) => onRawTextChange && onRawTextChange(e.target.value)}
              placeholder="Verbatim raw OCR text extracted from prescription..."
              rows={7}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: 'var(--radius-md)',
                border: '1.5px solid var(--mint-border)',
                backgroundColor: 'var(--bg-app)',
                color: 'var(--text-primary)',
                fontFamily: "'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace",
                fontSize: '12px',
                lineHeight: '1.6',
                outline: 'none',
                resize: 'vertical'
              }}
            />

            <button
              onClick={onTranslateClick}
              disabled={isReprocessing}
              className="btn btn-primary btn-full"
              style={{
                padding: '12px',
                fontSize: '13px',
                fontWeight: 700,
                backgroundColor: 'var(--primary-green)',
                color: '#FFFFFF',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                opacity: isReprocessing ? 0.7 : 1
              }}
            >
              {isReprocessing ? (
                <>
                  <Loader2 className="animate-spin" size={16} /> Re-extracting from edited text...
                </>
              ) : (
                <>
                  <Sparkles size={16} /> Re-extract & Translate Instructions
                </>
              )}
            </button>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)' }}>
              <span>Editable transcription</span>
              <span className="badge-status badge-taken" style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '12px' }}>
                ✓ OCR Extracted Text
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Image Full Modal */}
      <ImagePreviewModal
        imageUrl={imageUrl}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
};

export default YourPrescriptionCard;
