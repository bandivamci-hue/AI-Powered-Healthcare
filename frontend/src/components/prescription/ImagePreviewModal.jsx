import React, { useState } from 'react';
import { X, ZoomIn, ZoomOut, Download, RotateCw } from 'lucide-react';

const ImagePreviewModal = ({ imageUrl, isOpen, onClose }) => {
  const [zoomLevel, setZoomLevel] = useState(1);

  if (!isOpen || !imageUrl) return null;

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.25, 2.5));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 0.25, 0.75));
  const handleResetZoom = () => setZoomLevel(1);

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.85)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2500,
      padding: '24px'
    }}>
      <div style={{
        backgroundColor: 'var(--bg-card)',
        borderRadius: 'var(--radius-xl)',
        border: '1px solid var(--border-subtle)',
        width: '100%',
        maxWidth: '900px',
        maxHeight: '92vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-lg)'
      }}>
        {/* Modal Toolbar Header */}
        <div style={{
          padding: '16px 24px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          justify: 'space-between',
          alignItems: 'center',
          backgroundColor: 'var(--bg-app)'
        }}>
          <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>
            Uploaded Prescription Document Viewer
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={handleZoomOut}
              className="btn btn-outline"
              style={{ padding: '6px 10px', fontSize: '12px' }}
              title="Zoom Out"
            >
              <ZoomOut size={15} />
            </button>

            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', minWidth: '45px', textAlign: 'center' }}>
              {Math.round(zoomLevel * 100)}%
            </span>

            <button
              onClick={handleZoomIn}
              className="btn btn-outline"
              style={{ padding: '6px 10px', fontSize: '12px' }}
              title="Zoom In"
            >
              <ZoomIn size={15} />
            </button>

            <button
              onClick={handleResetZoom}
              className="btn btn-outline"
              style={{ padding: '6px 10px', fontSize: '12px' }}
              title="Reset Zoom"
            >
              <RotateCw size={14} />
            </button>

            <a
              href={imageUrl}
              target="_blank"
              rel="noreferrer"
              download="Prescription_Document"
              className="btn btn-outline-green"
              style={{ padding: '6px 12px', fontSize: '12px', textDecoration: 'none' }}
            >
              <Download size={14} /> Download
            </a>

            <button
              onClick={onClose}
              style={{
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                color: 'var(--text-muted)',
                padding: '6px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Zoomable Image Container */}
        <div style={{
          flex: 1,
          padding: '24px',
          overflow: 'auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0B1220'
        }}>
          <img
            src={imageUrl}
            alt="Prescription Document Full View"
            style={{
              transform: `scale(${zoomLevel})`,
              transformOrigin: 'center center',
              transition: 'transform 0.2s ease',
              maxHeight: '70vh',
              maxWidth: '100%',
              objectFit: 'contain',
              borderRadius: '8px',
              boxShadow: '0 8px 30px rgba(0,0,0,0.4)'
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default ImagePreviewModal;
