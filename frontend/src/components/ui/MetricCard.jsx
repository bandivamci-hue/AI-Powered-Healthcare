import React from 'react';

const MetricCard = ({ title, value, icon: Icon, iconColor, iconBg, trend, trendColor }) => {
  return (
    <div className="med-card" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)' }}>{title}</span>
        <div style={{
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          backgroundColor: iconBg || 'var(--light-mint)',
          color: iconColor || 'var(--primary-green)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {Icon && <Icon size={18} />}
        </div>
      </div>
      <span style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-primary)' }}>{value}</span>
      {trend && (
        <span style={{ fontSize: '12px', fontWeight: 600, color: trendColor || 'var(--primary-green)' }}>
          {trend}
        </span>
      )}
    </div>
  );
};

export default MetricCard;
