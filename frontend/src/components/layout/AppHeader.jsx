import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Home,
  Globe, 
  Bell, 
  ChevronDown, 
  Sun, 
  Moon, 
  User, 
  Settings, 
  LogOut, 
  Pill, 
  Check, 
  CheckCheck, 
  FileText, 
  PlusCircle, 
  Trash2, 
  AlertTriangle,
  Clock,
  Volume2,
  Menu
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';
import UserAvatar from '../ui/UserAvatar';
import api from '../../services/api';

const AppHeader = ({ onToggleSidebar }) => {
  const { user, logoutUser } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { addToast } = useToast();
  const [language, setLanguage] = useState('English');
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const dropdownRef = useRef(null);
  const notifDropdownRef = useRef(null);
  const navigate = useNavigate();

  const displayName = user?.fullName || user?.username || 'User';

  // Fetch notifications from Backend Central Notification System
  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;

      const res = await api.get('/api/notifications/');
      if (res.data) {
        const notifs = Array.isArray(res.data) ? res.data : res.data.results || [];
        setNotifications(notifs);
        const unread = notifs.filter(n => !n.is_read).length;
        setUnreadCount(unread);
      }
    } catch (err) {
      console.warn('Notification fetch warning:', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 5000); // Polling every 5s

    const handleSync = () => fetchNotifications();
    window.addEventListener('medicare_reminder_added', handleSync);
    window.addEventListener('storage', handleSync);

    return () => {
      clearInterval(interval);
      window.removeEventListener('medicare_reminder_added', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, []);

  // Request browser notification permission if available
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
      if (notifDropdownRef.current && !notifDropdownRef.current.contains(event.target)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logoutUser();
    navigate('/login');
  };

  const handleMarkAsRead = async (notifId, e) => {
    if (e) e.stopPropagation();
    try {
      await api.post(`/api/notifications/${notifId}/read/`);
      setNotifications(prev => prev.map(n => n.id === notifId ? { ...n, is_read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));

      // Auto-dismiss from view after 1.5 seconds
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== notifId));
      }, 1500);
    } catch (err) {
      console.warn('Mark as read error:', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.post('/api/notifications/read_all/');
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
      addToast('All notifications marked as read', 'info');

      // Auto-clear read notifications after 1.5 seconds
      setTimeout(async () => {
        try {
          await api.post('/api/notifications/clear_all/');
          setNotifications([]);
        } catch (e) {}
      }, 1500);
    } catch (err) {
      console.warn('Mark all read error:', err);
    }
  };

  const handleTakeDoseFromNotif = async (notif, e) => {
    if (e) e.stopPropagation();
    try {
      await api.post(`/api/notifications/${notif.id}/take_dose/`);
      setNotifications(prev => prev.filter(n => n.id !== notif.id));
      setUnreadCount(prev => Math.max(0, prev - 1));
      addToast(`Marked ${notif.medication_name || 'dose'} as taken!`, 'success');
      fetchNotifications();
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new Event('medicare_reminder_added'));
    } catch (err) {
      console.warn('Take dose error:', err);
      addToast('Could not mark dose as taken', 'error');
    }
  };

  const handlePlayTTS = (textToSpeak, e) => {
    if (e) e.stopPropagation();
    if (!textToSpeak) return;

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      const langCodes = {
        'English': 'en-IN',
        'Telugu': 'te-IN',
        'Hindi': 'hi-IN',
        'Tamil': 'ta-IN',
        'Kannada': 'kn-IN',
        'Malayalam': 'ml-IN',
        'Marathi': 'mr-IN',
        'Bengali': 'bn-IN'
      };
      utterance.lang = langCodes[language] || 'en-US';
      window.speechSynthesis.speak(utterance);
    }
  };

  const formatRelativeTime = (isoString) => {
    if (!isoString) return 'Just now';
    const date = new Date(isoString);
    const now = new Date();
    const diffSecs = Math.floor((now - date) / 1000);

    if (diffSecs < 60) return 'Just now';
    if (diffSecs < 3600) return `${Math.floor(diffSecs / 60)}m ago`;
    if (diffSecs < 86400) return `${Math.floor(diffSecs / 3600)}h ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'PRESCRIPTION_UPLOADED':
        return { icon: FileText, bg: 'var(--blue-soft-bg)', color: 'var(--blue-text)' };
      case 'MEDICATION_REMINDER_CREATED':
        return { icon: PlusCircle, bg: 'var(--light-mint)', color: 'var(--primary-green)' };
      case 'MEDICATION_REMINDER_DELETED':
        return { icon: Trash2, bg: '#FEE2E2', color: '#EF4444' };
      case 'MEDICATION_DOSE_MISSED':
        return { icon: AlertTriangle, bg: '#FEE2E2', color: '#EF4444' };
      case 'MEDICATION_DOSE_DUE':
      default:
        return { icon: Pill, bg: 'var(--light-mint)', color: 'var(--primary-green)' };
    }
  };

  return (
    <header className="app-header">
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <button
          onClick={onToggleSidebar}
          className="mobile-hamburger-btn"
          style={{
            display: 'none',
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-primary)',
            cursor: 'pointer'
          }}
          title="Toggle Navigation Menu"
        >
          <Menu size={20} />
        </button>

        <div className="mobile-header-brand" style={{ display: 'none', alignItems: 'center', gap: '6px' }}>
          <div style={{
            width: '28px',
            height: '28px',
            borderRadius: '8px',
            backgroundColor: 'var(--primary-green)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white'
          }}>
            <Pill size={16} style={{ transform: 'rotate(45deg)' }} />
          </div>
          <span style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)' }}>MediCare</span>
        </div>
      </div>

      <div className="header-right" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Home Button */}
        <Link
          to="/"
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-primary)',
            textDecoration: 'none',
            cursor: 'pointer'
          }}
          title="Go to Home"
        >
          <Home size={18} color="var(--primary-green)" />
        </Link>

        
        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-primary)',
            cursor: 'pointer'
          }}
          title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
        >
          {theme === 'light' ? <Moon size={18} /> : <Sun size={18} color="#F59E0B" />}
        </button>

        {/* Language Selector */}
        <div className="flex items-center gap-1" style={{ color: 'var(--text-secondary)', fontSize: '13px', fontWeight: 500, cursor: 'pointer' }}>
          <Globe size={16} />
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            style={{ border: 'none', background: 'transparent', outline: 'none', cursor: 'pointer', fontWeight: 500, color: 'var(--text-primary)' }}
          >
            <option value="English">English</option>
            <option value="Hindi">Hindi (हिंदी)</option>
            <option value="Telugu">Telugu (తెలుగు)</option>
            <option value="Tamil">Tamil (தமிழ்)</option>
            <option value="Kannada">Kannada (ಕನ್ನಡ)</option>
            <option value="Malayalam">Malayalam (മലയാളം)</option>
            <option value="Marathi">Marathi (मराठी)</option>
            <option value="Bengali">Bengali (বাংলা)</option>
          </select>
        </div>

        {/* Notification Bell with Dropdown Menu */}
        <div style={{ position: 'relative' }} ref={notifDropdownRef}>
          <div
            onClick={() => {
              setNotifOpen(!notifOpen);
              fetchNotifications();
            }}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: unreadCount > 0 ? 'var(--primary-green)' : 'var(--text-secondary)',
              cursor: 'pointer',
              position: 'relative'
            }}
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '-2px',
                right: '-2px',
                backgroundColor: '#EF4444',
                color: 'white',
                borderRadius: '50%',
                width: '16px',
                height: '16px',
                fontSize: '10px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </div>

          {/* Notification Dropdown Panel */}
          {notifOpen && (
            <div style={{
              position: 'absolute',
              top: '48px',
              right: '-60px',
              width: '360px',
              maxHeight: '460px',
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '16px',
              boxShadow: 'var(--shadow-lg)',
              zIndex: 1100,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden'
            }}>
              {/* Header */}
              <div style={{
                padding: '14px 18px',
                borderBottom: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: 'var(--bg-app)'
              }}>
                <div className="flex items-center gap-2">
                  <Bell size={16} color="var(--primary-green)" />
                  <strong style={{ fontSize: '14px', color: 'var(--text-primary)' }}>Notifications</strong>
                </div>
                {notifications.length > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--primary-green)',
                      fontSize: '11px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <CheckCheck size={14} /> Mark all read
                  </button>
                )}
              </div>

              {/* Notification List */}
              <div style={{ overflowY: 'auto', flex: 1, padding: '8px' }}>
                {notifications.length === 0 ? (
                  <div style={{ padding: '36px 16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
                    🎉 No active notifications right now!
                  </div>
                ) : (
                  notifications.map((n) => {
                    const iconConfig = getNotificationIcon(n.notification_type);
                    const IconComp = iconConfig.icon;

                    return (
                      <div
                        key={n.id}
                        onClick={() => {
                          if (n.link_url) {
                            navigate(n.link_url);
                            setNotifOpen(false);
                          }
                          if (!n.is_read) handleMarkAsRead(n.id);
                        }}
                        style={{
                          padding: '12px 14px',
                          borderRadius: '12px',
                          marginBottom: '6px',
                          backgroundColor: n.is_read ? 'transparent' : n.notification_type === 'MEDICATION_DOSE_MISSED' ? '#FFF1F2' : 'var(--light-mint)',
                          border: '1px solid',
                          borderColor: n.is_read ? 'var(--border-subtle)' : n.notification_type === 'MEDICATION_DOSE_MISSED' ? '#FECDD3' : 'var(--mint-border)',
                          transition: 'all 0.3s ease',
                          opacity: n.is_read ? 0.7 : 1,
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '6px',
                          cursor: 'pointer'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
                          <div className="flex items-center gap-2">
                            <div style={{
                              width: '28px',
                              height: '28px',
                              borderRadius: '50%',
                              backgroundColor: iconConfig.bg,
                              color: iconConfig.color,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0
                            }}>
                              <IconComp size={14} />
                            </div>
                            <div>
                              <span style={{ fontSize: '13px', fontWeight: 700, color: n.notification_type === 'MEDICATION_DOSE_MISSED' ? '#DC2626' : 'var(--text-primary)', display: 'block' }}>
                                {n.title}
                              </span>
                              <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <Clock size={11} /> {formatRelativeTime(n.created_at)}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1">
                            {/* Audio TTS Button */}
                            <button
                              onClick={(e) => handlePlayTTS(`${n.title}. ${n.message}`, e)}
                              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '2px' }}
                              title="Listen to notification"
                            >
                              <Volume2 size={14} />
                            </button>

                            {!n.is_read ? (
                              <button
                                onClick={(e) => handleMarkAsRead(n.id, e)}
                                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '2px' }}
                                title="Mark as read & dismiss"
                              >
                                <Check size={14} />
                              </button>
                            ) : (
                              <span style={{ fontSize: '11px', color: 'var(--primary-green)' }}>
                                <Check size={13} />
                              </span>
                            )}
                          </div>
                        </div>

                        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '2px 0 0' }}>
                          {n.message}
                        </p>

                        {/* Action Button: Mark Dose as Taken if it is a due medication */}
                        {n.notification_type === 'MEDICATION_DOSE_DUE' && n.dose_status !== 'TAKEN' && (
                          <button
                            onClick={(e) => handleTakeDoseFromNotif(n, e)}
                            className="btn btn-primary"
                            style={{
                              padding: '6px 12px',
                              fontSize: '12px',
                              marginTop: '4px',
                              borderRadius: '8px',
                              width: '100%'
                            }}
                          >
                            ✓ Mark as Taken
                          </button>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* Clickable User Profile Area with Initial Avatar & Dropdown */}
        <div style={{ position: 'relative' }} ref={dropdownRef}>
          <div
            onClick={() => setMenuOpen(!menuOpen)}
            className="user-profile-badge"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              cursor: 'pointer',
              padding: '4px 8px',
              borderRadius: '24px',
              transition: 'background-color 0.2s'
            }}
          >
            <UserAvatar name={displayName} size={36} fontSize={15} />
            <span style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text-primary)' }}>
              {displayName}
            </span>
            <ChevronDown size={16} color="var(--text-muted)" style={{ transform: menuOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
          </div>

          {/* User Profile Dropdown Menu */}
          {menuOpen && (
            <div style={{
              position: 'absolute',
              top: '48px',
              right: 0,
              width: '200px',
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '12px',
              boxShadow: 'var(--shadow-lg)',
              padding: '8px 0',
              zIndex: 1000
            }}>
              <div style={{ padding: '8px 16px', borderBottom: '1px solid var(--border-subtle)', marginBottom: '4px' }}>
                <strong style={{ fontSize: '14px', color: 'var(--text-primary)', display: 'block' }}>{displayName}</strong>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Patient Account</span>
              </div>

              <Link
                to="/profile"
                onClick={() => setMenuOpen(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 16px',
                  fontSize: '13px',
                  color: 'var(--text-primary)',
                  transition: 'background 0.2s'
                }}
                className="dropdown-item"
              >
                <User size={16} color="var(--primary-green)" /> My Profile
              </Link>

              <Link
                to="/settings"
                onClick={() => setMenuOpen(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 16px',
                  fontSize: '13px',
                  color: 'var(--text-primary)',
                  transition: 'background 0.2s'
                }}
                className="dropdown-item"
              >
                <Settings size={16} color="var(--text-muted)" /> Settings
              </Link>

              <div style={{ borderTop: '1px solid var(--border-subtle)', marginTop: '4px', paddingTop: '4px' }}>
                <button
                  onClick={handleLogout}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '10px 16px',
                    fontSize: '13px',
                    color: '#DC2626',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                >
                  <LogOut size={16} /> Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
