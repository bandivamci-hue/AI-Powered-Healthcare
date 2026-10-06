import React from 'react';
import AppLayout from '../components/layout/AppLayout';
import { Sliders, Globe, Bell, Eye, Lock, Shield } from 'lucide-react';

const SettingsPage = () => {
  return (
    <AppLayout>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#111827', marginBottom: '4px' }}>
          Application Settings
        </h1>
        <p style={{ fontSize: '15px', color: '#667085' }}>
          Customize your preferences, language, accessibility, and privacy controls.
        </p>
      </div>

      <div className="med-card" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="flex items-center gap-3">
            <Bell size={20} color="#16A57A" />
            <div>
              <h4 style={{ fontSize: '16px', fontWeight: 700 }}>Push & Sound Notifications</h4>
              <p style={{ fontSize: '13px', color: '#667085' }}>Receive reminders for upcoming doses on device.</p>
            </div>
          </div>
          <input type="checkbox" defaultChecked style={{ width: '20px', height: '20px', accentColor: '#16A57A' }} />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #F1F5F9', paddingTop: '20px' }}>
          <div className="flex items-center gap-3">
            <Globe size={20} color="#16A57A" />
            <div>
              <h4 style={{ fontSize: '16px', fontWeight: 700 }}>Auto-Translate Prescriptions</h4>
              <p style={{ fontSize: '13px', color: '#667085' }}>Automatically simplify and translate doctor notes upon scan.</p>
            </div>
          </div>
          <input type="checkbox" defaultChecked style={{ width: '20px', height: '20px', accentColor: '#16A57A' }} />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #F1F5F9', paddingTop: '20px' }}>
          <div className="flex items-center gap-3">
            <Eye size={20} color="#16A57A" />
            <div>
              <h4 style={{ fontSize: '16px', fontWeight: 700 }}>Large High-Contrast Text</h4>
              <p style={{ fontSize: '13px', color: '#667085' }}>Enhance font size and visibility for elderly users.</p>
            </div>
          </div>
          <input type="checkbox" style={{ width: '20px', height: '20px', accentColor: '#16A57A' }} />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #F1F5F9', paddingTop: '20px' }}>
          <div className="flex items-center gap-3">
            <Shield size={20} color="#16A57A" />
            <div>
              <h4 style={{ fontSize: '16px', fontWeight: 700 }}>Data Privacy & Vault Encryption</h4>
              <p style={{ fontSize: '13px', color: '#667085' }}>Encrypt prescription uploads before cloud sync.</p>
            </div>
          </div>
          <input type="checkbox" defaultChecked style={{ width: '20px', height: '20px', accentColor: '#16A57A' }} />
        </div>
      </div>
    </AppLayout>
  );
};

export default SettingsPage;
