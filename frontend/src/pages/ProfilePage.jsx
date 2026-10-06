import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import UserAvatar from '../components/ui/UserAvatar';
import { documentService } from '../services/documentService';
import { scheduleStore } from '../services/scheduleStore';
import PrescriptionPreview from '../components/prescription/PrescriptionPreview';
import RawOcrPanel from '../components/prescription/RawOcrPanel';
import MedicineGuidance from '../components/prescription/MedicineGuidance';
import MedicineBreakdown from '../components/prescription/MedicineBreakdown';
import VoiceGuidanceCard from '../components/prescription/VoiceGuidanceCard';
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  ShieldCheck, 
  Edit3, 
  Globe, 
  Heart, 
  Lock, 
  X, 
  Check, 
  AlertCircle, 
  MapPin, 
  Activity, 
  PlusCircle, 
  Sparkles, 
  Loader2,
  Clock,
  FileText,
  Search,
  Download,
  Eye,
  Pill,
  RefreshCw,
  CheckCircle2,
  Volume2,
  Upload,
  FileCheck,
  FileSpreadsheet
} from 'lucide-react';

const LANGUAGE_OPTIONS = [
  { value: 'English', label: 'English' },
  { value: 'Hindi', label: 'Hindi (हिंदी)' },
  { value: 'Telugu', label: 'Telugu (తెలుగు)' },
  { value: 'Tamil', label: 'Tamil (தமிழ்)' },
  { value: 'Kannada', label: 'Kannada (ಕನ್ನಡ)' },
  { value: 'Malayalam', label: 'Malayalam (മലയാളം)' },
  { value: 'Bengali', label: 'Bengali (বাংলা)' },
  { value: 'Marathi', label: 'Marathi (मराठी)' },
  { value: 'Gujarati', label: 'Gujarati (ગુજરાતી)' },
  { value: 'Punjabi', label: 'Punjabi (ਪੰਜਾਬੀ)' },
  { value: 'Odia', label: 'Odia (ଓଡ଼ିଆ)' }
];

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading, updateUserProfile } = useAuth();
  const { addToast } = useToast();
  
  // Check URL params for active tab (e.g. /profile?tab=history)
  const queryParams = new URLSearchParams(window.location.search);
  const initialTab = queryParams.get('tab') || 'personal';
  const [activeTab, setActiveTab] = useState(initialTab);

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  // Form State
  const [formData, setFormData] = useState({
    fullName: '',
    dateOfBirth: '',
    age: '',
    gender: '',
    phoneNumber: '',
    email: '',
    preferredLanguage: 'English',
    bloodGroup: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    allergies: '',
    chronicConditions: '',
    address: '',
    city: '',
    state: '',
    country: 'India'
  });

  // Medication History State
  const [documents, setDocuments] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('ALL');
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [modalLanguage, setModalLanguage] = useState(user?.preferredLanguage || 'Telugu');
  const [activeVoiceGuidance, setActiveVoiceGuidance] = useState('');

  // Synchronize form data when user state loads or changes
  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || '',
        dateOfBirth: user.dateOfBirth || '',
        age: user.age !== null && user.age !== undefined ? String(user.age) : '',
        gender: user.gender || '',
        phoneNumber: user.phoneNumber || '',
        email: user.email || '',
        preferredLanguage: user.preferredLanguage || 'English',
        bloodGroup: user.bloodGroup || '',
        emergencyContactName: user.emergencyContactName || '',
        emergencyContactPhone: user.emergencyContactPhone || '',
        allergies: user.allergies || '',
        chronicConditions: user.chronicConditions || '',
        address: user.address || '',
        city: user.city || '',
        state: user.state || '',
        country: user.country || 'India'
      });
    }
  }, [user]);

  // Load medical records if activeTab is history
  const loadMedicalHistory = async () => {
    setHistoryLoading(true);
    try {
      const data = await documentService.getDocuments();
      setDocuments(data || []);
    } catch (err) {
      console.warn('Error loading history:', err);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    loadMedicalHistory();
  }, []);

  const handleOpenEdit = () => {
    setFormErrors({});
    if (user) {
      setFormData({
        fullName: user.fullName || '',
        dateOfBirth: user.dateOfBirth || '',
        age: user.age !== null && user.age !== undefined ? String(user.age) : '',
        gender: user.gender || '',
        phoneNumber: user.phoneNumber || '',
        email: user.email || '',
        preferredLanguage: user.preferredLanguage || 'English',
        bloodGroup: user.bloodGroup || '',
        emergencyContactName: user.emergencyContactName || '',
        emergencyContactPhone: user.emergencyContactPhone || '',
        allergies: user.allergies || '',
        chronicConditions: user.chronicConditions || '',
        address: user.address || '',
        city: user.city || '',
        state: user.state || '',
        country: user.country || 'India'
      });
    }
    setIsEditing(true);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setFormErrors({});
    setIsSaving(true);

    const payload = {
      full_name: formData.fullName.trim(),
      date_of_birth: formData.dateOfBirth || null,
      age: formData.age ? parseInt(formData.age, 10) : null,
      gender: formData.gender || '',
      phone_number: formData.phoneNumber.trim(),
      email: formData.email.trim(),
      preferred_language: formData.preferredLanguage || 'English',
      blood_group: formData.bloodGroup || '',
      emergency_contact_name: formData.emergencyContactName.trim(),
      emergency_contact_phone: formData.emergencyContactPhone.trim(),
      allergies: formData.allergies.trim(),
      chronic_conditions: formData.chronicConditions.trim(),
      address: formData.address.trim(),
      city: formData.city.trim(),
      state: formData.state.trim(),
      country: formData.country.trim() || 'India'
    };

    try {
      await updateUserProfile(payload);
      setIsEditing(false);
      addToast('Profile saved successfully!', 'success');
    } catch (err) {
      console.error('[Profile Update Error]:', err);
      if (typeof err === 'object' && err !== null) {
        setFormErrors(err);
      }
      addToast(err?.detail || err?.full_name?.[0] || err?.phone_number?.[0] || 'Failed to update profile. Please verify your entries.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // History Actions
  const handleApplySchedule = (record) => {
    if (record.medicines && record.medicines.length > 0) {
      scheduleStore.setScheduleForNewScan(record.medicines, true);
      setSelectedRecord(null);
      addToast(`Applied ${record.document_name} to Today's Schedule!`, 'success');
      navigate('/dashboard');
    } else {
      addToast('No extracted medicines found in this document to schedule.', 'warning');
    }
  };

  const getCleanOcrText = (doc) => {
    if (doc.extracted_text) return doc.extracted_text;
    if (!doc.ai_summary) return '';
    if (doc.ai_summary.includes('[RAW_TEXT]')) {
      const parts = doc.ai_summary.split('[RAW_TEXT]');
      return (parts[1] || parts[0]).split('[MEDICINES]')[0].trim();
    }
    if (doc.ai_summary.includes('[MEDICINES]')) {
      return doc.ai_summary.split('[MEDICINES]')[0].trim();
    }
    return doc.ai_summary.trim();
  };

  const handleQuickListen = (doc, e) => {
    e.stopPropagation();
    setSelectedRecord(doc);
    const summaryText = doc.medicines && doc.medicines.length > 0
      ? `Medical prescription ${doc.document_name}. Contains ${doc.medicines.length} prescribed medicines: ` +
        doc.medicines.map(m => `${m.name}, ${m.dose || '1 dose'}, ${m.frequency || 'as prescribed'}`).join('. ')
      : `Medical document ${doc.document_name}. ${getCleanOcrText(doc)}`;
    setActiveVoiceGuidance(summaryText);
    addToast(`Playing audio guide for ${doc.document_name}`, 'info');
  };

  const filteredDocuments = documents.filter((item) => {
    const term = searchTerm.toLowerCase();
    const nameMatch = (item.document_name || '').toLowerCase().includes(term);
    const docMatch = (item.doctor_name || '').toLowerCase().includes(term);
    const medMatch = (item.medicines || []).some((m) => (m.name || '').toLowerCase().includes(term));
    const textMatch = (item.ai_summary || '').toLowerCase().includes(term);

    const matchesSearch = nameMatch || docMatch || medMatch || textMatch;
    if (selectedType === 'ALL') return matchesSearch;
    return matchesSearch && (item.document_type || 'prescription').toLowerCase() === selectedType.toLowerCase();
  });

  const getDocTypeBadge = (type) => {
    const t = (type || 'prescription').toLowerCase();
    if (t.includes('prescription')) return { label: 'Prescription', color: '#10B981', bg: 'var(--light-mint)', icon: Pill };
    if (t.includes('report')) return { label: 'Medical Report', color: '#3B82F6', bg: 'var(--blue-soft-bg)', icon: Activity };
    if (t.includes('discharge')) return { label: 'Discharge Summary', color: '#8B5CF6', bg: 'var(--purple-soft-bg)', icon: FileText };
    if (t.includes('lab')) return { label: 'Lab Test', color: '#F59E0B', bg: 'var(--yellow-soft-bg)', icon: FileSpreadsheet };
    return { label: 'Medical Document', color: '#10B981', bg: 'var(--light-mint)', icon: FileText };
  };

  if (authLoading) {
    return (
      <AppLayout>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px', gap: '16px' }}>
          <Loader2 size={36} className="animate-spin" color="var(--primary-green)" />
          <p style={{ color: 'var(--text-muted)', fontSize: '15px', fontWeight: 500 }}>Loading your profile...</p>
        </div>
      </AppLayout>
    );
  }

  const displayName = user?.fullName || user?.username || 'Patient';
  const completionPct = user?.completionPercentage || 0;
  const isComplete = user?.isProfileCompleted || false;

  return (
    <AppLayout>
      {/* Profile Setup Callout Banner for Incomplete Profiles */}
      {!isComplete && (
        <div className="med-card" style={{
          marginBottom: '24px',
          backgroundColor: 'var(--mint-bg, rgba(16, 185, 129, 0.08))',
          border: '1.5px solid var(--primary-green)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div className="flex items-center gap-4">
            <div style={{
              width: '46px',
              height: '46px',
              borderRadius: '50%',
              backgroundColor: 'var(--primary-green)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <Sparkles size={24} />
            </div>
            <div>
              <h3 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '2px' }}>
                Complete Your MediCare Profile
              </h3>
              <p style={{ fontSize: '13.5px', color: 'var(--text-muted)', margin: 0 }}>
                Add your personal and emergency information so MediCare can provide a personalized healthcare experience.
              </p>
            </div>
          </div>
          <button onClick={handleOpenEdit} className="btn btn-primary" style={{ padding: '10px 22px' }}>
            <PlusCircle size={17} /> Complete Profile
          </button>
        </div>
      )}

      {/* Top Profile Header Card */}
      <div className="med-card" style={{ marginBottom: '28px', backgroundColor: 'var(--bg-card)', border: '1.5px solid var(--mint-border)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
          <div className="flex items-center gap-5">
            <UserAvatar name={displayName} size={84} fontSize={34} />

            <div>
              <div className="flex items-center gap-2" style={{ marginBottom: '4px' }}>
                <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)' }}>{displayName}</h1>
                <span className={`badge-pill ${isComplete ? 'badge-taken' : 'badge-upcoming'}`} style={{ fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <ShieldCheck size={14} /> {isComplete ? 'Profile Active' : 'Profile Incomplete'}
                </span>
              </div>
              <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '6px' }}>
                {user?.email || 'No email attached'} • {user?.phoneNumber ? user.phoneNumber : 'No phone number'}
              </p>
              <div className="flex items-center gap-3" style={{ fontSize: '12.5px', color: 'var(--text-light)' }}>
                <span>Language: <strong style={{ color: 'var(--text-primary)' }}>{user?.preferredLanguage || 'English'}</strong></span>
                {user?.bloodGroup && <span>• Blood Group: <strong style={{ color: 'var(--primary-green)' }}>{user.bloodGroup}</strong></span>}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '10px' }}>
            <button className="btn btn-primary" onClick={handleOpenEdit}>
              <Edit3 size={16} /> Edit Profile
            </button>

            {/* Profile Completion Meter */}
            <div style={{ width: '200px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 600, marginBottom: '4px', color: 'var(--text-muted)' }}>
                <span>Profile Completion</span>
                <span style={{ color: 'var(--primary-green)' }}>{completionPct}%</span>
              </div>
              <div style={{ height: '7px', backgroundColor: 'var(--border-subtle)', borderRadius: '999px', overflow: 'hidden' }}>
                <div style={{ width: `${completionPct}%`, height: '100%', backgroundColor: 'var(--primary-green)', borderRadius: '999px', transition: 'width 0.4s ease' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs (5 Tabs including Merged Medication History) */}
      <div className="flex gap-3" style={{ marginBottom: '24px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px', overflowX: 'auto' }}>
        {[
          { id: 'personal', label: 'Personal Details', icon: User },
          { id: 'contact', label: 'Contact & Address', icon: MapPin },
          { id: 'health', label: 'Health Profile & Emergency', icon: Heart },
          { id: 'history', label: `Medication History (${documents.length})`, icon: Clock },
          { id: 'security', label: 'Account & Security', icon: Lock }
        ].map((tab) => {
          const TabIcon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex items-center gap-2"
              style={{
                padding: '10px 18px',
                borderRadius: '12px',
                fontWeight: 600,
                fontSize: '13.5px',
                backgroundColor: activeTab === tab.id ? 'var(--primary-green)' : 'transparent',
                color: activeTab === tab.id ? 'white' : 'var(--text-muted)',
                transition: 'all 0.2s',
                border: 'none',
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              <TabIcon size={16} /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: Personal Details */}
      {activeTab === 'personal' && (
        <div className="med-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>Personal Information</h3>
            <button onClick={handleOpenEdit} className="btn btn-outline" style={{ padding: '6px 14px', fontSize: '12.5px' }}>
              <Edit3 size={14} /> Edit Details
            </button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
            <div>
              <label style={{ fontSize: '12.5px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Full Name</label>
              <p style={{ fontSize: '14.5px', fontWeight: 600, color: user?.fullName ? 'var(--text-primary)' : 'var(--text-light)', margin: 0 }}>
                {user?.fullName || <span style={{ fontStyle: 'italic', fontWeight: 400 }}>Not provided</span>}
              </p>
            </div>
            <div>
              <label style={{ fontSize: '12.5px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Date of Birth</label>
              <p style={{ fontSize: '14.5px', fontWeight: 600, color: user?.dateOfBirth ? 'var(--text-primary)' : 'var(--text-light)', margin: 0 }}>
                {user?.dateOfBirth || <span style={{ fontStyle: 'italic', fontWeight: 400 }}>Not provided</span>}
              </p>
            </div>
            <div>
              <label style={{ fontSize: '12.5px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Age</label>
              <p style={{ fontSize: '14.5px', fontWeight: 600, color: user?.age ? 'var(--text-primary)' : 'var(--text-light)', margin: 0 }}>
                {user?.age ? `${user.age} Years` : <span style={{ fontStyle: 'italic', fontWeight: 400 }}>Not provided</span>}
              </p>
            </div>
            <div>
              <label style={{ fontSize: '12.5px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Gender</label>
              <p style={{ fontSize: '14.5px', fontWeight: 600, color: user?.gender ? 'var(--text-primary)' : 'var(--text-light)', margin: 0 }}>
                {user?.gender || <span style={{ fontStyle: 'italic', fontWeight: 400 }}>Not provided</span>}
              </p>
            </div>
            <div>
              <label style={{ fontSize: '12.5px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Blood Group</label>
              <p style={{ fontSize: '14.5px', fontWeight: 600, color: user?.bloodGroup ? 'var(--primary-green)' : 'var(--text-light)', margin: 0 }}>
                {user?.bloodGroup || <span style={{ fontStyle: 'italic', fontWeight: 400 }}>Not provided</span>}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Contact & Address */}
      {activeTab === 'contact' && (
        <div className="med-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>Contact Information & Address</h3>
            <button onClick={handleOpenEdit} className="btn btn-outline" style={{ padding: '6px 14px', fontSize: '12.5px' }}>
              <Edit3 size={14} /> Edit Details
            </button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
            <div>
              <label style={{ fontSize: '12.5px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Phone Number</label>
              <p style={{ fontSize: '14.5px', fontWeight: 600, color: user?.phoneNumber ? 'var(--text-primary)' : 'var(--text-light)', margin: 0 }}>
                {user?.phoneNumber || <span style={{ fontStyle: 'italic', fontWeight: 400 }}>Not provided</span>}
              </p>
            </div>
            <div>
              <label style={{ fontSize: '12.5px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Email Address</label>
              <p style={{ fontSize: '14.5px', fontWeight: 600, color: user?.email ? 'var(--text-primary)' : 'var(--text-light)', margin: 0 }}>
                {user?.email || <span style={{ fontStyle: 'italic', fontWeight: 400 }}>Not provided</span>}
              </p>
            </div>
            <div>
              <label style={{ fontSize: '12.5px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Street Address</label>
              <p style={{ fontSize: '14.5px', fontWeight: 600, color: user?.address ? 'var(--text-primary)' : 'var(--text-light)', margin: 0 }}>
                {user?.address || <span style={{ fontStyle: 'italic', fontWeight: 400 }}>Not provided</span>}
              </p>
            </div>
            <div>
              <label style={{ fontSize: '12.5px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>City & State</label>
              <p style={{ fontSize: '14.5px', fontWeight: 600, color: user?.city || user?.state ? 'var(--text-primary)' : 'var(--text-light)', margin: 0 }}>
                {[user?.city, user?.state].filter(Boolean).join(', ') || <span style={{ fontStyle: 'italic', fontWeight: 400 }}>Not provided</span>}
              </p>
            </div>
            <div>
              <label style={{ fontSize: '12.5px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Country</label>
              <p style={{ fontSize: '14.5px', fontWeight: 600, color: user?.country ? 'var(--text-primary)' : 'var(--text-light)', margin: 0 }}>
                {user?.country || 'India'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Health Profile & Emergency Contact */}
      {activeTab === 'health' && (
        <div className="med-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>Health Profile & Emergency Information</h3>
            <button onClick={handleOpenEdit} className="btn btn-outline" style={{ padding: '6px 14px', fontSize: '12.5px' }}>
              <Edit3 size={14} /> Edit Details
            </button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
            <div>
              <label style={{ fontSize: '12.5px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Preferred Language</label>
              <p style={{ fontSize: '14.5px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                {user?.preferredLanguage || 'English'}
              </p>
            </div>
            <div>
              <label style={{ fontSize: '12.5px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Emergency Contact Person</label>
              <p style={{ fontSize: '14.5px', fontWeight: 600, color: user?.emergencyContactName ? 'var(--text-primary)' : 'var(--text-light)', margin: 0 }}>
                {user?.emergencyContactName || <span style={{ fontStyle: 'italic', fontWeight: 400 }}>Not provided</span>}
              </p>
            </div>
            <div>
              <label style={{ fontSize: '12.5px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Emergency Contact Phone</label>
              <p style={{ fontSize: '14.5px', fontWeight: 600, color: user?.emergencyContactPhone ? 'var(--text-primary)' : 'var(--text-light)', margin: 0 }}>
                {user?.emergencyContactPhone || <span style={{ fontStyle: 'italic', fontWeight: 400 }}>Not provided</span>}
              </p>
            </div>
            <div>
              <label style={{ fontSize: '12.5px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Known Drug/Food Allergies</label>
              <p style={{ fontSize: '14.5px', fontWeight: 600, color: user?.allergies ? '#DC2626' : 'var(--text-light)', margin: 0 }}>
                {user?.allergies || <span style={{ fontStyle: 'italic', fontWeight: 400 }}>None reported</span>}
              </p>
            </div>
            <div>
              <label style={{ fontSize: '12.5px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Chronic Conditions</label>
              <p style={{ fontSize: '14.5px', fontWeight: 600, color: user?.chronicConditions ? 'var(--text-primary)' : 'var(--text-light)', margin: 0 }}>
                {user?.chronicConditions || <span style={{ fontStyle: 'italic', fontWeight: 400 }}>None reported</span>}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: MERGED MEDICATION HISTORY VAULT */}
      {activeTab === 'history' && (
        <div>
          {/* Header Controls */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 4px 0' }}>
                Medication & Prescription History Vault
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>
                Database archive of your uploaded doctor prescriptions, extracted medicines, and voice guidance.
              </p>
            </div>

            <Link to="/scan-prescription" className="btn btn-primary" style={{ padding: '8px 16px', gap: '6px', fontSize: '13px' }}>
              <Upload size={16} /> Upload New Prescription
            </Link>
          </div>

          {/* Search & Filters */}
          <div className="med-card" style={{ padding: '14px 18px', marginBottom: '18px' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', alignItems: 'center', justifyContent: 'space-between' }}>
              <div className="input-wrapper" style={{ flex: 1, minWidth: '240px', maxWidth: '380px' }}>
                <Search className="input-icon" size={16} />
                <input
                  type="text"
                  className="input-field"
                  placeholder="Search document, doctor, or medicine..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ fontSize: '13px' }}
                />
              </div>

              <div className="flex gap-2" style={{ flexWrap: 'wrap' }}>
                {[
                  { id: 'ALL', label: 'All' },
                  { id: 'prescription', label: 'Prescriptions' },
                  { id: 'medical_report', label: 'Reports' },
                  { id: 'discharge_summary', label: 'Discharges' },
                  { id: 'lab_test', label: 'Lab Tests' }
                ].map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setSelectedType(type.id)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '20px',
                      fontSize: '11.5px',
                      fontWeight: 600,
                      border: '1px solid',
                      borderColor: selectedType === type.id ? 'var(--primary-green)' : 'var(--border-subtle)',
                      backgroundColor: selectedType === type.id ? 'var(--primary-green)' : 'var(--bg-app)',
                      color: selectedType === type.id ? 'white' : 'var(--text-secondary)',
                      cursor: 'pointer'
                    }}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* History Records Table */}
          <div className="med-card" style={{ padding: 0, overflow: 'hidden' }}>
            {historyLoading ? (
              <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>
                <RefreshCw size={24} className="animate-spin" style={{ marginBottom: '8px' }} />
                <p>Loading medical records from database...</p>
              </div>
            ) : filteredDocuments.length === 0 ? (
              <div style={{ padding: '48px 24px', textAlign: 'center' }}>
                <div style={{ width: '54px', height: '54px', borderRadius: '50%', backgroundColor: 'var(--light-mint)', color: 'var(--primary-green)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                  <FileText size={28} />
                </div>
                <h4 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
                  No Medical Records Found
                </h4>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', maxWidth: '400px', margin: '0 auto 16px' }}>
                  {searchTerm || selectedType !== 'ALL'
                    ? 'No documents match your search criteria.'
                    : 'You have not uploaded any prescriptions or medical reports yet.'}
                </p>
                <Link to="/scan-prescription" className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '13px' }}>
                  <Upload size={14} /> Upload Prescription
                </Link>
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13.5px' }}>
                <thead>
                  <tr style={{ backgroundColor: 'var(--bg-app)', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '14px 18px', fontWeight: 600 }}>Document</th>
                    <th style={{ padding: '14px 18px', fontWeight: 600 }}>Type</th>
                    <th style={{ padding: '14px 18px', fontWeight: 600 }}>Doctor / Facility</th>
                    <th style={{ padding: '14px 18px', fontWeight: 600 }}>Uploaded Date</th>
                    <th style={{ padding: '14px 18px', fontWeight: 600 }}>Extracted Medicines</th>
                    <th style={{ padding: '14px 18px', fontWeight: 600, textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDocuments.map((item) => {
                    const typeBadge = getDocTypeBadge(item.document_type);
                    const TypeIcon = typeBadge.icon;

                    return (
                      <tr key={item.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                        <td style={{ padding: '14px 18px', fontWeight: 700, color: 'var(--text-primary)' }}>
                          <div className="flex items-center gap-3">
                            <div style={{ width: '34px', height: '34px', borderRadius: '8px', backgroundColor: typeBadge.bg, color: typeBadge.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              <TypeIcon size={16} />
                            </div>
                            <div>
                              <span style={{ display: 'block', fontSize: '13.5px' }}>{item.document_name}</span>
                              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>ID #{item.id}</span>
                            </div>
                          </div>
                        </td>

                        <td style={{ padding: '14px 18px' }}>
                          <span style={{
                            padding: '3px 8px',
                            borderRadius: '12px',
                            fontSize: '11px',
                            fontWeight: 600,
                            backgroundColor: typeBadge.bg,
                            color: typeBadge.color
                          }}>
                            {typeBadge.label}
                          </span>
                        </td>

                        <td style={{ padding: '14px 18px', color: 'var(--text-secondary)' }}>
                          {item.doctor_name || 'Dr. Prescribing Physician'}
                        </td>

                        <td style={{ padding: '14px 18px', color: 'var(--text-muted)' }}>
                          {item.uploaded_at ? new Date(item.uploaded_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'Recent'}
                        </td>

                        <td style={{ padding: '14px 18px' }}>
                          {item.medicines && item.medicines.length > 0 ? (
                            <div className="flex items-center gap-1" style={{ flexWrap: 'wrap' }}>
                              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                                {item.medicines[0].name}
                              </span>
                              {item.medicines.length > 1 && (
                                <span style={{ fontSize: '11px', padding: '2px 6px', borderRadius: '8px', backgroundColor: 'var(--bg-app)', color: 'var(--text-muted)' }}>
                                  +{item.medicines.length - 1} more
                                </span>
                              )}
                            </div>
                          ) : (
                            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Prescription Scanned</span>
                          )}
                        </td>

                        <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={(e) => handleQuickListen(item, e)}
                              className="btn btn-outline"
                              style={{ padding: '5px 8px', fontSize: '11.5px', color: 'var(--primary-green)' }}
                              title="Listen to summary"
                            >
                              <Volume2 size={14} /> Listen
                            </button>

                            <button
                              onClick={() => {
                                setSelectedRecord(item);
                                setModalLanguage(user?.preferredLanguage ? user.preferredLanguage.charAt(0).toUpperCase() + user.preferredLanguage.slice(1) : 'Telugu');
                              }}
                              className="btn btn-outline-green"
                              style={{ padding: '5px 10px', fontSize: '11.5px' }}
                            >
                              <Eye size={13} /> View Details
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* TAB 5: Account & Security */}
      {activeTab === 'security' && (
        <div className="med-card">
          <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px', color: 'var(--text-primary)' }}>Account & Authentication</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
            <div>
              <label style={{ fontSize: '12.5px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Account Username</label>
              <p style={{ fontSize: '14.5px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>{user?.username || 'User'}</p>
            </div>
            <div>
              <label style={{ fontSize: '12.5px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Security Mechanism</label>
              <p style={{ fontSize: '14.5px', fontWeight: 600, color: 'var(--primary-green)', margin: 0 }}>JWT Bearer Token Authentication</p>
            </div>
            <div>
              <label style={{ fontSize: '12.5px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Account Status</label>
              <p style={{ fontSize: '14.5px', fontWeight: 600, color: 'var(--primary-green)', margin: 0 }}>Active & Encrypted</p>
            </div>
          </div>
        </div>
      )}

      {/* EDIT PROFILE / SETUP MODAL */}
      {isEditing && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.55)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000,
          padding: '20px'
        }}>
          <div className="med-card" style={{ width: '100%', maxWidth: '640px', maxHeight: '90vh', overflowY: 'auto', padding: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px' }}>
              <div>
                <h3 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {isComplete ? 'Edit Profile Details' : 'Complete Your Profile'}
                </h3>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>
                  Update your real healthcare details. Changes are saved directly to the database.
                </p>
              </div>
              <button onClick={() => setIsEditing(false)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveProfile}>
              {/* Section 1: Personal Details */}
              <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--primary-green)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' }}>
                1. Personal Details
              </h4>

              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input
                  type="text"
                  className="input-field no-icon"
                  placeholder="e.g. Ravi Kumar"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  required
                />
                {formErrors.full_name && <span style={{ color: '#EF4444', fontSize: '12px' }}>{formErrors.full_name[0]}</span>}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px' }}>
                <div className="form-group">
                  <label className="form-label">Date of Birth</label>
                  <input
                    type="date"
                    className="input-field no-icon"
                    value={formData.dateOfBirth}
                    onChange={(e) => {
                      const dob = e.target.value;
                      let calculatedAge = formData.age;
                      if (dob) {
                        const birthDate = new Date(dob);
                        const today = new Date();
                        let age = today.getFullYear() - birthDate.getFullYear();
                        const m = today.getMonth() - birthDate.getMonth();
                        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                          age--;
                        }
                        if (age >= 0) calculatedAge = String(age);
                      }
                      setFormData({ ...formData, dateOfBirth: dob, age: calculatedAge });
                    }}
                  />
                  {formErrors.date_of_birth && <span style={{ color: '#EF4444', fontSize: '12px' }}>{formErrors.date_of_birth[0]}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label">Age</label>
                  <input
                    type="number"
                    min="1"
                    max="120"
                    placeholder="e.g. 28"
                    className="input-field no-icon"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  />
                  {formErrors.age && <span style={{ color: '#EF4444', fontSize: '12px' }}>{formErrors.age[0]}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label">Gender</label>
                  <select
                    className="input-field no-icon"
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div className="form-group">
                  <label className="form-label">Blood Group</label>
                  <select
                    className="input-field no-icon"
                    value={formData.bloodGroup}
                    onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                  >
                    <option value="">Select Blood Group</option>
                    {BLOOD_GROUPS.map((bg) => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Preferred Language</label>
                  <select
                    className="input-field no-icon"
                    value={formData.preferredLanguage}
                    onChange={(e) => setFormData({ ...formData, preferredLanguage: e.target.value })}
                  >
                    {LANGUAGE_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Section 2: Contact Information */}
              <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--primary-green)', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: '16px', marginBottom: '12px' }}>
                2. Contact & Address
              </h4>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div className="form-group">
                  <label className="form-label">Phone Number *</label>
                  <input
                    type="tel"
                    className="input-field no-icon"
                    placeholder="e.g. +91 9876543210"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    required
                  />
                  {formErrors.phone_number && <span style={{ color: '#EF4444', fontSize: '12px' }}>{formErrors.phone_number[0]}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input
                    type="email"
                    className="input-field no-icon"
                    placeholder="e.g. name@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Street Address</label>
                <input
                  type="text"
                  className="input-field no-icon"
                  placeholder="e.g. Flat 402, Green Meadows"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px' }}>
                <div className="form-group">
                  <label className="form-label">City</label>
                  <input
                    type="text"
                    className="input-field no-icon"
                    placeholder="e.g. Hyderabad"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">State</label>
                  <input
                    type="text"
                    className="input-field no-icon"
                    placeholder="e.g. Telangana"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Country</label>
                  <input
                    type="text"
                    className="input-field no-icon"
                    placeholder="e.g. India"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  />
                </div>
              </div>

              {/* Section 3: Emergency Contact */}
              <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--primary-green)', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: '16px', marginBottom: '12px' }}>
                3. Emergency Contact
              </h4>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div className="form-group">
                  <label className="form-label">Emergency Contact Name</label>
                  <input
                    type="text"
                    className="input-field no-icon"
                    placeholder="e.g. Spouse / Parent / Sibling"
                    value={formData.emergencyContactName}
                    onChange={(e) => setFormData({ ...formData, emergencyContactName: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Emergency Contact Phone</label>
                  <input
                    type="tel"
                    className="input-field no-icon"
                    placeholder="e.g. +91 9876543211"
                    value={formData.emergencyContactPhone}
                    onChange={(e) => setFormData({ ...formData, emergencyContactPhone: e.target.value })}
                  />
                  {formErrors.emergency_contact_phone && <span style={{ color: '#EF4444', fontSize: '12px' }}>{formErrors.emergency_contact_phone[0]}</span>}
                </div>
              </div>

              {/* Section 4: Health Profile */}
              <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--primary-green)', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: '16px', marginBottom: '12px' }}>
                4. Health Profile
              </h4>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div className="form-group">
                  <label className="form-label">Known Allergies (if any)</label>
                  <input
                    type="text"
                    className="input-field no-icon"
                    placeholder="e.g. Penicillin, Peanuts"
                    value={formData.allergies}
                    onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Chronic Conditions (if any)</label>
                  <input
                    type="text"
                    className="input-field no-icon"
                    placeholder="e.g. Hypertension, Type 2 Diabetes"
                    value={formData.chronicConditions}
                    onChange={(e) => setFormData({ ...formData, chronicConditions: e.target.value })}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px', borderTop: '1px solid var(--border-subtle)', paddingTop: '16px' }}>
                <button type="button" onClick={() => setIsEditing(false)} className="btn btn-outline" disabled={isSaving}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={isSaving}>
                  {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
                  {isSaving ? 'Saving...' : 'Save Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RICH HISTORICAL DETAILS MODAL */}
      {selectedRecord && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.8)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000,
          padding: '24px'
        }}>
          <div className="med-card" style={{ width: '100%', maxWidth: '1150px', padding: '32px', maxHeight: '92vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div className="flex items-center gap-3">
                <div style={{ width: '44px', height: '44px', borderRadius: '12px', backgroundColor: 'var(--light-mint)', color: 'var(--primary-green)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FileText size={24} />
                </div>
                <div>
                  <h3 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                    {selectedRecord.document_name}
                  </h3>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    Vault Record • Uploaded on {new Date(selectedRecord.uploaded_at || Date.now()).toLocaleString()}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setSelectedRecord(null)}
                style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={24} />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr 1fr', gap: '20px', marginBottom: '24px' }}>
              <div style={{ minHeight: '340px' }}>
                <PrescriptionPreview
                  imageUrl={selectedRecord.file_url || selectedRecord.file || selectedRecord.imageUrl}
                  medicinesCount={(selectedRecord.medicines || []).length}
                />
              </div>

              <div style={{ minHeight: '340px' }}>
                <RawOcrPanel rawText={getCleanOcrText(selectedRecord)} />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', minHeight: '340px' }}>
                <MedicineGuidance
                  medicines={selectedRecord.medicines || []}
                  selectedLanguage={modalLanguage}
                  onLanguageChange={(lang) => setModalLanguage(lang)}
                  onGuidanceChange={(text) => setActiveVoiceGuidance(text)}
                />

                <VoiceGuidanceCard
                  text={activeVoiceGuidance}
                  selectedLanguage={modalLanguage}
                />
              </div>
            </div>

            {selectedRecord.medicines && selectedRecord.medicines.length > 0 && (
              <MedicineBreakdown medicines={selectedRecord.medicines} />
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '20px', borderTop: '1px solid var(--border-subtle)' }}>
              <div>
                {selectedRecord.file_url && (
                  <a
                    href={selectedRecord.file_url}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-outline"
                    style={{ fontSize: '13px' }}
                  >
                    <Download size={15} /> Download Original Document
                  </a>
                )}
              </div>

              <div className="flex gap-3">
                <button onClick={() => setSelectedRecord(null)} className="btn btn-outline">
                  Close Record
                </button>

                <button onClick={() => handleApplySchedule(selectedRecord)} className="btn btn-primary">
                  <RefreshCw size={16} /> Apply to Today's Schedule
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
};

export default ProfilePage;
