import React from 'react';
import { FileText, Pill, Bell, Clock, Search } from 'lucide-react';

const EmptyState = ({ title, message, icon: IconComponent, actionText, onAction }) => {
  const Icon = IconComponent || FileText;

  return (
    <div className="med-card" style={{ textAlign: 'center', padding: '48px 24px' }}>
      <div style={{
        width: '64px',
        height: '64px',
        borderRadius: '50%',
        backgroundColor: 'var(--light-mint)',
        color: 'var(--primary-green)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 16px'
      }}>
        <Icon size={32} />
      </div>

      <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
        {title}
      </h3>
      <p style={{ fontSize: '14px', color: 'var(--text-muted)', maxWidth: '400px', margin: '0 auto 24px' }}>
        {message}
      </p>

      {actionText && onAction && (
        <button onClick={onAction} className="btn btn-primary">
          {actionText}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
