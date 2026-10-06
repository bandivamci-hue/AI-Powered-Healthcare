import React from 'react';
import AppLayout from '../components/layout/AppLayout';
import { TrendingUp, FileText, CheckCircle, Calendar, Download } from 'lucide-react';

const ReportsPage = () => {
  return (
    <AppLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#111827', marginBottom: '4px' }}>
            Health & Intake Reports
          </h1>
          <p style={{ fontSize: '15px', color: '#667085' }}>
            Medication adherence statistics and health tracking overview.
          </p>
        </div>

        <button className="btn btn-primary" onClick={() => alert('Downloading PDF Health Report...')}>
          <Download size={18} /> Export PDF Report
        </button>
      </div>

      {/* Grid of Report Visual Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '28px', marginBottom: '28px' }}>
        {/* Weekly Adherence Chart Container */}
        <div className="med-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700 }}>Weekly Medication Adherence</h3>
            <span style={{ fontSize: '13px', color: '#16A57A', fontWeight: 700 }}>75% Average Adherence</span>
          </div>

          {/* Pure CSS Bar Chart */}
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '200px', padding: '0 20px', borderBottom: '2px solid #E2E8F0', marginBottom: '16px' }}>
            {[
              { day: 'Mon', val: 100, color: '#16A57A' },
              { day: 'Tue', val: 80, color: '#16A57A' },
              { day: 'Wed', val: 60, color: '#F59E0B' },
              { day: 'Thu', val: 100, color: '#16A57A' },
              { day: 'Fri', val: 90, color: '#16A57A' },
              { day: 'Sat', val: 75, color: '#16A57A' },
              { day: 'Sun', val: 100, color: '#16A57A' }
            ].map((bar, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '40px' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#4B5563', marginBottom: '6px' }}>{bar.val}%</span>
                <div style={{
                  width: '100%',
                  height: `${bar.val * 1.5}px`,
                  backgroundColor: bar.color,
                  borderRadius: '6px 6px 0 0',
                  transition: 'height 0.3s'
                }}></div>
                <span style={{ fontSize: '12px', color: '#667085', marginTop: '8px' }}>{bar.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Adherence Summary Card */}
        <div className="med-card" style={{ backgroundColor: '#EAF8F2', border: '1px solid #D1F1E5' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#087F62', marginBottom: '16px' }}>
            Health Progress
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <span style={{ fontSize: '13px', color: '#047857' }}>Completed Doses</span>
              <h2 style={{ fontSize: '32px', fontWeight: 800, color: '#087F62' }}>28 / 32</h2>
            </div>
            <div>
              <span style={{ fontSize: '13px', color: '#047857' }}>Prescriptions Scanned</span>
              <h2 style={{ fontSize: '32px', fontWeight: 800, color: '#087F62' }}>14 Documents</h2>
            </div>
            <div style={{ backgroundColor: 'white', padding: '12px', borderRadius: '8px', fontSize: '12px', color: '#047857' }}>
              🎉 Great job! You have taken 87.5% of your doses on time this week.
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default ReportsPage;
