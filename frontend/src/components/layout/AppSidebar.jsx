import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Camera, 
  Pill, 
  Bell, 
  HeartPulse, 
  User,
  Settings, 
  LogOut,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const AppSidebar = ({ isOpen, onClose }) => {
  const { logoutUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutUser();
    if (onClose) onClose();
    navigate('/login');
  };

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Scan Prescription', path: '/scan-prescription', icon: Camera },
    { label: 'Reminders', path: '/reminders', icon: Bell },
    { label: 'Health Center', path: '/health-center', icon: HeartPulse },
    { label: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div 
          className="mobile-sidebar-backdrop"
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(3px)',
            zIndex: 2999
          }}
        />
      )}

      <aside 
        className={`app-sidebar no-scrollbar ${isOpen ? 'mobile-sidebar-open' : ''}`} 
        style={{ 
          overflowY: 'auto', 
          scrollbarWidth: 'none', 
          msOverflowStyle: 'none'
        }}
      >
        <div>
          {/* Bold Brand Logo Header */}
          <div className="brand-logo" style={{ padding: '4px 8px', marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '14px',
                background: 'linear-gradient(135deg, #10B981 0%, #047857 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
                boxShadow: '0 4px 14px rgba(16, 185, 129, 0.35)',
                flexShrink: 0
              }}>
                <span style={{ display: 'inline-flex', transform: 'rotate(45deg)' }}>
                  <Pill size={24} />
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <span style={{
                    fontSize: '21px',
                    fontWeight: 900,
                    color: '#FFFFFF',
                    letterSpacing: '-0.5px',
                    fontFamily: "'Inter', sans-serif"
                  }}>
                    MediCare
                  </span>
                  <span style={{
                    width: '7px',
                    height: '7px',
                    borderRadius: '50%',
                    backgroundColor: '#10B981',
                    marginLeft: '3px',
                    display: 'inline-block'
                  }}></span>
                </div>

                <span style={{
                  fontSize: '9.5px',
                  fontWeight: 700,
                  color: '#ccfbf1',
                  letterSpacing: '0.4px',
                  textTransform: 'uppercase'
                }}>
                  Your Medicine Assistant
                </span>
              </div>
            </div>

            {/* Mobile Close Button */}
            {onClose && (
              <button
                onClick={onClose}
                className="mobile-sidebar-close-btn"
                style={{
                  display: 'none',
                  background: 'rgba(255, 255, 255, 0.15)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  cursor: 'pointer'
                }}
                title="Close Navigation"
              >
                <X size={18} />
              </button>
            )}
          </div>

          {/* Streamlined Navigation Items */}
          <nav className="sidebar-nav" style={{ marginTop: '20px' }}>
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => {
                    if (onClose) onClose();
                  }}
                  className={({ isActive }) =>
                    `sidebar-link ${isActive ? 'active' : ''}`
                  }
                  style={item.highlight ? { color: '#fecaca', fontWeight: 600 } : {}}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Bottom Logout Action */}
        <div style={{ paddingTop: '16px', borderTop: '1px solid rgba(255, 255, 255, 0.15)', marginTop: '20px' }}>
          <button
            onClick={handleLogout}
            className="btn btn-full"
            style={{ 
              justifyContent: 'flex-start', 
              padding: '10px 16px', 
              color: '#fee2e2', 
              border: '1px solid rgba(239, 68, 68, 0.4)',
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              borderRadius: '10px'
            }}
          >
            <LogOut size={17} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default AppSidebar;
