import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  PhoneCall, 
  ShieldAlert, 
  MapPin, 
  Navigation, 
  ExternalLink, 
  X, 
  AlertTriangle, 
  HeartPulse, 
  User, 
  Loader2,
  Activity
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import LoadingSpinner from '../common/LoadingSpinner';
import api from '../../services/api';

const FloatingSosButton = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToast } = useToast();

  const [isOpen, setIsOpen] = useState(false);
  const [locatingHospitals, setLocatingHospitals] = useState(false);
  const [quickHospitals, setQuickHospitals] = useState([]);
  const [locError, setLocError] = useState('');

  const handleLocateHospitals = () => {
    setLocatingHospitals(true);
    setLocError('');

    if (!navigator.geolocation) {
      setLocatingHospitals(false);
      setLocError('Geolocation is not supported by your device browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const res = await api.get(`/api/hospitals/nearby/?lat=${latitude}&lng=${longitude}&radius=5000`);
          if (res.data && res.data.success && res.data.hospitals && res.data.hospitals.length > 0) {
            setQuickHospitals(res.data.hospitals.slice(0, 3));
            setLocError('');
          } else {
            setQuickHospitals([]);
            setLocError(res.data?.error || 'No hospitals found within 5km radius.');
          }
        } catch (err) {
          console.warn('[SOS Hospital Locate Error]:', err);
          setQuickHospitals([]);
          const errDetail = err.response?.data?.details || err.response?.data?.error || 'Unable to find nearby hospitals.';
          setLocError(errDetail);
        } finally {
          setLocatingHospitals(false);
        }
      },
      (err) => {
        setLocatingHospitals(false);
        setQuickHospitals([]);
        console.warn('[SOS Location Denied]:', err);
        if (err.code === 1) {
          setLocError('Location access was denied. Please enable GPS permissions.');
        } else {
          setLocError('Location request timed out. Please click Refresh GPS.');
        }
      },
      { timeout: 8000, enableHighAccuracy: true, maximumAge: 0 }
    );
  };

  return (
    <>
      {/* Floating SOS Launcher Button (positioned above AI bot) */}
      <button
        onClick={() => {
          setIsOpen(true);
          if (quickHospitals.length === 0) {
            handleLocateHospitals();
          }
        }}
        style={{
          position: 'fixed',
          bottom: '96px',
          right: '24px',
          zIndex: 2400,
          height: '46px',
          padding: '0 16px',
          borderRadius: '24px',
          backgroundColor: '#DC2626',
          color: 'white',
          border: '2px solid #FFFFFF',
          boxShadow: '0 6px 20px rgba(220, 38, 38, 0.5)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontWeight: 900,
          fontSize: '14px',
          letterSpacing: '0.5px',
          cursor: 'pointer',
          transition: 'transform 0.2s ease, box-shadow 0.2s ease',
          outline: 'none'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.06)';
          e.currentTarget.style.boxShadow = '0 8px 24px rgba(220, 38, 38, 0.65)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = '0 6px 20px rgba(220, 38, 38, 0.5)';
        }}
        title="Immediate Emergency SOS"
      >
        <span style={{
          width: '10px',
          height: '10px',
          borderRadius: '50%',
          backgroundColor: '#FFFFFF',
          animation: 'pulse 1.2s infinite'
        }} />
        <span>SOS EMERGENCY</span>
      </button>

      {/* Emergency Action Modal */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(5px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 3000,
            padding: '16px'
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsOpen(false);
          }}
        >
          <div
            className="med-card"
            style={{
              width: '100%',
              maxWidth: '560px',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '0',
              borderRadius: '24px',
              border: '2px solid #EF4444',
              boxShadow: '0 25px 60px rgba(220, 38, 38, 0.35)',
              backgroundColor: 'var(--bg-card)'
            }}
          >
            {/* Header */}
            <div style={{
              backgroundColor: '#DC2626',
              color: 'white',
              padding: '20px 24px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div className="flex items-center gap-3">
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <ShieldAlert size={24} color="white" />
                </div>
                <div>
                  <h3 style={{ fontSize: '20px', fontWeight: 900, margin: 0, color: 'white' }}>
                    EMERGENCY SOS
                  </h3>
                  <span style={{ fontSize: '12px', opacity: 0.9 }}>
                    Immediate 24/7 Life Safety & Assistance
                  </span>
                </div>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  cursor: 'pointer'
                }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Emergency Call Buttons Grid */}
              <div>
                <span style={{ fontSize: '12px', fontWeight: 800, color: '#DC2626', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '10px' }}>
                  1. Instant Emergency Dialers
                </span>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '10px' }}>
                  {/* Ambulance */}
                  <a
                    href="tel:108"
                    className="btn"
                    style={{
                      backgroundColor: '#EF4444',
                      color: 'white',
                      fontWeight: 800,
                      fontSize: '13px',
                      padding: '12px 14px',
                      borderRadius: '12px',
                      textDecoration: 'none',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '4px',
                      textAlign: 'center'
                    }}
                  >
                    <PhoneCall size={18} />
                    <span>Call Ambulance</span>
                    <strong style={{ fontSize: '15px' }}>108 / 102</strong>
                  </a>

                  {/* National Emergency */}
                  <a
                    href="tel:112"
                    className="btn"
                    style={{
                      backgroundColor: '#2563EB',
                      color: 'white',
                      fontWeight: 800,
                      fontSize: '13px',
                      padding: '12px 14px',
                      borderRadius: '12px',
                      textDecoration: 'none',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '4px',
                      textAlign: 'center'
                    }}
                  >
                    <ShieldAlert size={18} />
                    <span>National Emergency</span>
                    <strong style={{ fontSize: '15px' }}>112</strong>
                  </a>

                  {/* Health Helpline */}
                  <a
                    href="tel:1075"
                    className="btn"
                    style={{
                      backgroundColor: '#D97706',
                      color: 'white',
                      fontWeight: 800,
                      fontSize: '13px',
                      padding: '12px 14px',
                      borderRadius: '12px',
                      textDecoration: 'none',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '4px',
                      textAlign: 'center'
                    }}
                  >
                    <HeartPulse size={18} />
                    <span>Health Helpline</span>
                    <strong style={{ fontSize: '15px' }}>1075</strong>
                  </a>
                </div>

                {/* Personal Emergency Contact */}
                {user?.emergencyContactPhone && (
                  <div style={{ marginTop: '10px' }}>
                    <a
                      href={`tel:${user.emergencyContactPhone}`}
                      className="btn btn-outline"
                      style={{
                        width: '100%',
                        borderColor: '#DC2626',
                        color: '#DC2626',
                        backgroundColor: 'rgba(220, 38, 38, 0.05)',
                        padding: '10px 16px',
                        borderRadius: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        textDecoration: 'none',
                        fontSize: '13px',
                        fontWeight: 700
                      }}
                    >
                      <User size={16} /> Call Emergency Contact ({user.emergencyContactName || 'Family'}: {user.emergencyContactPhone})
                    </a>
                  </div>
                )}
              </div>

              {/* Patient Critical Health Summary */}
              <div style={{ backgroundColor: 'var(--bg-app)', padding: '14px 16px', borderRadius: '14px', border: '1px solid var(--border-subtle)' }}>
                <span style={{ fontSize: '11.5px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
                  Patient Critical Health Profile
                </span>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', fontSize: '12px' }}>
                  <div>
                    <span style={{ color: 'var(--text-muted)', display: 'block' }}>Blood Group</span>
                    <strong style={{ color: 'var(--primary-green)', fontSize: '14px' }}>{user?.bloodGroup || 'Not provided'}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)', display: 'block' }}>Allergies</span>
                    <strong style={{ color: user?.allergies ? '#DC2626' : 'var(--text-primary)', fontSize: '13px' }}>{user?.allergies || 'None'}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)', display: 'block' }}>Conditions</span>
                    <strong style={{ color: 'var(--text-primary)', fontSize: '13px' }}>{user?.chronicConditions || 'None'}</strong>
                  </div>
                </div>
              </div>

              {/* Nearest Hospital Quick Locator */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 800, color: '#2563EB', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    2. Nearest Emergency Rooms
                  </span>
                  <button
                    onClick={handleLocateHospitals}
                    disabled={locatingHospitals}
                    style={{ fontSize: '11px', color: '#2563EB', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    {locatingHospitals ? <LoadingSpinner size={12} color="#2563EB" /> : <Navigation size={12} />} Refresh GPS
                  </button>
                </div>

                {locError && (
                  <div style={{ padding: '8px 12px', borderRadius: '8px', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#DC2626', fontSize: '12px', marginBottom: '8px' }}>
                    {locError}
                  </div>
                )}

                {locatingHospitals ? (
                  <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
                    <div style={{ marginBottom: '8px' }}>
                      <LoadingSpinner size={24} color="#2563EB" strokeWidth={3} />
                    </div>
                    Detecting real nearby hospitals from Google Places...
                  </div>
                ) : quickHospitals.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {quickHospitals.map((h, i) => (
                      <div
                        key={i}
                        style={{
                          backgroundColor: 'var(--bg-card)',
                          border: '1px solid var(--border-subtle)',
                          borderRadius: '12px',
                          padding: '10px 14px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          gap: '10px'
                        }}
                      >
                        <div>
                          <strong style={{ fontSize: '13.5px', color: 'var(--text-primary)', display: 'block' }}>{h.name}</strong>
                          <span style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                            {h.distance_km ? `${h.distance_km < 1 ? Math.round(h.distance_km * 1000) + ' m' : h.distance_km + ' km'} away • ` : ''}📍 {h.address}
                          </span>
                        </div>

                        <div className="flex gap-2">
                          <a
                            href={h.directions_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-primary"
                            style={{ padding: '6px 10px', fontSize: '11px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '3px' }}
                          >
                            <Navigation size={12} /> Map
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <button
                    onClick={handleLocateHospitals}
                    className="btn btn-outline"
                    style={{ width: '100%', padding: '10px', fontSize: '13px' }}
                  >
                    <Navigation size={15} /> Find Real Hospitals Near My GPS
                  </button>
                )}

                <button
                  onClick={() => {
                    setIsOpen(false);
                    navigate('/health-center?tab=emergency');
                  }}
                  style={{
                    width: '100%',
                    marginTop: '12px',
                    padding: '8px',
                    background: 'none',
                    border: 'none',
                    color: 'var(--primary-green)',
                    fontSize: '12.5px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px'
                  }}
                >
                  View Full Health Center & First Aid Guides <ExternalLink size={13} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FloatingSosButton;
