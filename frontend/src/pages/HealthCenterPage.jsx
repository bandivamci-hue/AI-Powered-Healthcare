import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';
import { 
  BookOpen, Search, X, Clock, ArrowRight, ShieldCheck, 
  Sparkles, Heart, Activity, Baby, Users, Pill, Stethoscope, 
  AlertCircle, Moon, Apple, ShieldAlert, Droplets, Flame,
  PhoneCall, HeartPulse, MapPin, Navigation, ExternalLink,
  AlertTriangle, CheckCircle2, Loader2, Info, Star, RefreshCw
} from 'lucide-react';
import ArticleReaderModal from '../components/education/ArticleReaderModal';
import { useToast } from '../context/ToastContext';
import { HEALTH_ARTICLES } from './HealthEducationPage';
import LoadingSpinner from '../components/common/LoadingSpinner';
import api from '../services/api';

// Verified First-Aid Protocols
const FIRST_AID_DATA = {
  'Heavy Bleeding': {
    icon: Activity,
    color: '#DC2626',
    title: 'Severe & Heavy Bleeding First Aid',
    urgency: 'Critical - Act within seconds',
    steps: [
      { step: 1, text: 'Apply continuous, firm direct pressure over the wound using a clean cloth, sterile gauze, or your gloved hand.' },
      { step: 2, text: 'Keep the injured limb elevated above heart level if no bone fracture is suspected.' },
      { step: 3, text: 'Do NOT remove blood-soaked pads or cloths; place fresh layers directly on top and maintain constant pressure.' },
      { step: 4, text: 'If bleeding from an arm or leg is arterial/spurting and uncontrolled after direct pressure, apply a commercial tourniquet 2-3 inches above the wound (never over a joint).' },
      { step: 5, text: 'Keep the patient warm and calm while an ambulance (108) is on the way.' }
    ],
    whatNotToDo: 'Do not remove embedded objects (knife, glass) as this can cause catastrophic blood loss. Press around the object instead.'
  },
  'Chest Pain / Heart Attack': {
    icon: HeartPulse,
    color: '#DC2626',
    title: 'Suspected Heart Attack / Acute Chest Pain',
    urgency: 'Emergency - Immediate 108 Call Required',
    steps: [
      { step: 1, text: 'Call 108 / 102 immediately. Every minute matters for heart muscle survival.' },
      { step: 2, text: 'Have the patient sit down in a comfortable position (e.g. on the floor leaning against a wall) with knees bent to reduce heart strain.' },
      { step: 3, text: 'Loosen all tight clothing around the neck, chest, and waist.' },
      { step: 4, text: 'If the patient is conscious and not allergic to Aspirin, ask them to chew one standard adult 300mg Disprin/Aspirin tablet slowly.' },
      { step: 5, text: 'Stay with the person. If they become unresponsive and stop breathing, begin hands-only CPR (100-120 chest compressions per minute).' }
    ],
    whatNotToDo: 'Do not let the person drive themselves to the hospital. Do not give water or food if they feel faint.'
  },
  'Burns': {
    icon: Flame,
    color: '#EA580C',
    title: 'Thermal & Scald Burn Management',
    urgency: 'Urgent First Aid',
    steps: [
      { step: 1, text: 'Cool the burn under gentle, cold running tap water for at least 10 to 20 minutes immediately.' },
      { step: 2, text: 'Gently remove rings, watches, or loose clothing near the burn before the area starts swelling.' },
      { step: 3, text: 'Cover the cooled area loosely with clean, non-stick sterile plastic cling film or a sterile dressing.' },
      { step: 4, text: 'Keep the patient warm to prevent hypothermia after water cooling.' },
      { step: 5, text: 'Seek medical attention for burns on the face, hands, groin, or any burn larger than the patient\'s palm.' }
    ],
    whatNotToDo: 'Do NOT apply ice, ice water, butter, toothpaste, oil, or turmeric. Do NOT burst burn blisters.'
  },
  'Stroke': {
    icon: Stethoscope,
    color: '#7C3AED',
    title: 'Acute Stroke Recognition (F.A.S.T.)',
    urgency: 'Time-Critical Brain Emergency',
    steps: [
      { step: 1, text: 'F - FACE: Ask the person to smile. Does one side of their face droop or feel numb?' },
      { step: 2, text: 'A - ARMS: Ask the person to raise both arms. Does one arm drift downward?' },
      { step: 3, text: 'S - SPEECH: Ask the person to repeat a simple sentence. Is speech slurred or strange?' },
      { step: 4, text: 'T - TIME: If you observe any of these signs, call 108 immediately and note the exact time symptoms started.' },
      { step: 5, text: 'Keep the patient lying on their side (recovery position) if they feel drowsy or nauseous to keep airway clear.' }
    ],
    whatNotToDo: 'Do NOT give Aspirin, food, or drinks, as a stroke may be hemorrhagic (bleeding) and swallowing may be impaired.'
  },
  'Choking': {
    icon: AlertTriangle,
    color: '#D97706',
    title: 'Airway Obstruction & Choking Rescue',
    urgency: 'Critical - Complete Airway Block',
    steps: [
      { step: 1, text: 'Encourage the person to cough forcefully if they are able to speak or make sound.' },
      { step: 2, text: 'If they cannot breathe, speak, or cough, lean them forward and deliver 5 sharp back blows between shoulder blades with the heel of your hand.' },
      { step: 3, text: 'If unresolved, perform 5 abdominal thrusts (Heimlich maneuver): stand behind them, place a fist just above their navel, grasp with other hand, and pull inward and upward sharply.' },
      { step: 4, text: 'Alternate between 5 back blows and 5 abdominal thrusts until the blockage clears.' },
      { step: 5, text: 'If the person becomes unconscious, lower them to the floor, call 108, and begin CPR compressions.' }
    ],
    whatNotToDo: 'Do not perform blind finger sweeps in the mouth as this can push foreign objects deeper into the throat.'
  },
  'Fracture': {
    icon: Activity,
    color: '#2563EB',
    title: 'Bone Fracture & Musculoskeletal Sprains',
    urgency: 'Stabilization & Transport',
    steps: [
      { step: 1, text: 'Keep the injured limb completely still. Support it in the position you found it.' },
      { step: 2, text: 'If skin is broken (open fracture), cover with a sterile cloth without pushing bone back.' },
      { step: 3, text: 'Apply a cold pack wrapped in a towel for 15-20 minutes to reduce swelling (do not apply ice directly to skin).' },
      { step: 4, text: 'Immobilize the joint above and below the fracture using a soft splint, rolled blanket, or sling.' },
      { step: 5, text: 'Transport carefully to the nearest emergency room with orthopedic facilities.' }
    ],
    whatNotToDo: 'Do not attempt to realign or straighten a deformed bone or dislocated joint yourself.'
  }
};

const CATEGORIES = [
  { id: 'ALL', label: 'All Topics', icon: BookOpen },
  { id: 'Medicine Safety', label: 'Medicine Safety', icon: Pill },
  { id: 'Heart Health', label: 'Heart & BP', icon: Heart },
  { id: 'Diabetes', label: 'Diabetes Care', icon: Droplets },
  { id: 'Maternal Health', label: 'Maternal Health', icon: Baby },
  { id: 'Preventive Care', label: 'Preventive Care', icon: ShieldCheck },
  { id: 'Family Health', label: 'Family Care', icon: Users }
];

const HealthCenterPage = () => {
  const location = useLocation();
  const { addToast } = useToast();

  const queryParams = new URLSearchParams(location.search);
  const initialTab = queryParams.get('tab') || 'education';
  const [activeSection, setActiveSection] = useState(initialTab === 'emergency' ? 'emergency' : 'education');

  // Education state
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArticle, setSelectedArticle] = useState(null);

  // Emergency state
  const [selectedFirstAid, setSelectedFirstAid] = useState('Heavy Bleeding');
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [userCoords, setUserCoords] = useState(null);
  const [hospitalResults, setHospitalResults] = useState([]);
  const [searchLocationQuery, setSearchLocationQuery] = useState('');
  const [locationError, setLocationError] = useState('');
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [hasSearchedHospitals, setHasSearchedHospitals] = useState(false);
  const [showManualInput, setShowManualInput] = useState(false);

  // Filter education articles
  const filteredArticles = (HEALTH_ARTICLES || []).filter((art) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesCategory = selectedCategory === 'ALL' || art.category === selectedCategory;
    const matchesSearch = !q || 
      art.title.toLowerCase().includes(q) ||
      art.snippet.toLowerCase().includes(q) ||
      (art.keywords || []).some(k => k.toLowerCase().includes(q)) ||
      (art.conditions || []).some(c => c.toLowerCase().includes(q));
    return matchesCategory && matchesSearch;
  });

  const handleLocateHospitals = () => {
    setIsLoadingLocation(true);
    setLocationError('');
    setPermissionDenied(false);
    setHasSearchedHospitals(true);

    if (!navigator.geolocation) {
      setIsLoadingLocation(false);
      setLocationError('Geolocation is not supported by your device or browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setUserCoords({ lat: latitude, lng: longitude });

        try {
          const res = await api.get(`/api/hospitals/nearby/?lat=${latitude}&lng=${longitude}&radius=5000`);
          if (res.data && res.data.success && res.data.hospitals && res.data.hospitals.length > 0) {
            setHospitalResults(res.data.hospitals);
            setLocationError('');
            addToast(`Found ${res.data.hospitals.length} nearby real hospital facilities!`, 'success');
          } else {
            setHospitalResults([]);
            setLocationError(res.data?.error || 'No hospitals found within the selected radius.');
          }
        } catch (apiErr) {
          console.error('[Google Places API Error]:', apiErr);
          setHospitalResults([]);
          const errDetail = apiErr.response?.data?.details || apiErr.response?.data?.error || 'Unable to find nearby hospitals.';
          setLocationError(errDetail);
        } finally {
          setIsLoadingLocation(false);
        }
      },
      (error) => {
        setIsLoadingLocation(false);
        setHospitalResults([]);
        console.warn('Geolocation error:', error);
        if (error.code === 1) {
          setPermissionDenied(true);
          setLocationError('Location permission is required to discover nearby hospitals.');
        } else if (error.code === 2) {
          setLocationError('Position unavailable. Please check your device location settings.');
        } else if (error.code === 3) {
          setLocationError('Location request timed out. Please try again.');
        } else {
          setLocationError('Unable to retrieve your location. Please try again.');
        }
      },
      { timeout: 10000, enableHighAccuracy: true, maximumAge: 0 }
    );
  };

  const activeFirstAid = FIRST_AID_DATA[selectedFirstAid] || FIRST_AID_DATA['Heavy Bleeding'];
  const FirstAidIcon = activeFirstAid.icon;

  return (
    <AppLayout>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>
            Health Center
          </h1>
          <p style={{ fontSize: '15px', color: 'var(--text-muted)', margin: 0 }}>
            Unified Health Education, Emergency Services, and Dynamic GPS Nearby Hospital Finder.
          </p>
        </div>

        {/* Section Switcher Tabs */}
        <div style={{ display: 'flex', gap: '8px', backgroundColor: 'var(--bg-card)', padding: '4px', borderRadius: '14px', border: '1px solid var(--border-subtle)' }}>
          <button
            onClick={() => setActiveSection('education')}
            className="flex items-center gap-2"
            style={{
              padding: '8px 18px',
              borderRadius: '10px',
              fontWeight: 700,
              fontSize: '13.5px',
              border: 'none',
              cursor: 'pointer',
              backgroundColor: activeSection === 'education' ? 'var(--primary-green)' : 'transparent',
              color: activeSection === 'education' ? 'white' : 'var(--text-secondary)',
              transition: 'all 0.2s ease'
            }}
          >
            <BookOpen size={16} /> Health Education
          </button>

          <button
            onClick={() => setActiveSection('emergency')}
            className="flex items-center gap-2"
            style={{
              padding: '8px 18px',
              borderRadius: '10px',
              fontWeight: 700,
              fontSize: '13.5px',
              border: 'none',
              cursor: 'pointer',
              backgroundColor: activeSection === 'emergency' ? '#DC2626' : 'transparent',
              color: activeSection === 'emergency' ? 'white' : 'var(--text-secondary)',
              transition: 'all 0.2s ease'
            }}
          >
            <ShieldAlert size={16} /> Emergency & Hospitals
          </button>
        </div>
      </div>

      {/* SECTION 1: HEALTH EDUCATION */}
      {activeSection === 'education' && (
        <div>
          {/* Search & Topic Categories Filter */}
          <div className="med-card" style={{ padding: '20px', marginBottom: '24px' }}>
            <div className="input-wrapper" style={{ marginBottom: '16px' }}>
              <Search className="input-icon" size={18} />
              <input
                type="text"
                className="input-field"
                placeholder="Search health guides by condition, medicine, or symptom (e.g. blood pressure, fever, antibiotics)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex gap-2" style={{ overflowX: 'auto', paddingBottom: '4px' }}>
              {CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                const isSelected = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '20px',
                      fontSize: '12.5px',
                      fontWeight: 600,
                      border: '1px solid',
                      borderColor: isSelected ? 'var(--primary-green)' : 'var(--border-subtle)',
                      backgroundColor: isSelected ? 'var(--primary-green)' : 'var(--bg-app)',
                      color: isSelected ? 'white' : 'var(--text-secondary)',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <Icon size={14} />
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Articles Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
            {filteredArticles.map((art) => (
              <div
                key={art.id}
                onClick={() => setSelectedArticle(art)}
                className="med-card"
                style={{
                  padding: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  borderTop: `4px solid ${art.color || 'var(--primary-green)'}`
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <span style={{
                      fontSize: '11.5px',
                      fontWeight: 700,
                      color: art.color || 'var(--primary-green)',
                      backgroundColor: 'var(--bg-app)',
                      padding: '3px 10px',
                      borderRadius: '12px',
                      border: '1px solid var(--border-subtle)'
                    }}>
                      {art.category}
                    </span>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={12} /> {art.readTime}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.4, marginBottom: '8px' }}>
                    {art.title}
                  </h3>

                  <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: 1.6, margin: '0 0 16px 0' }}>
                    {art.snippet}
                  </p>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '14px', borderTop: '1px solid var(--border-subtle)' }}>
                  <span style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--primary-green)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    Read & Listen <ArrowRight size={14} />
                  </span>
                  <span style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                    Translate & Voice
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 2: EMERGENCY & HOSPITALS */}
      {activeSection === 'emergency' && (
        <div>
          {/* High-Contrast Safety Critical Header */}
          <div 
            style={{
              backgroundColor: '#DC2626',
              color: 'white',
              borderRadius: '24px',
              padding: '32px 28px',
              marginBottom: '28px',
              boxShadow: '0 12px 30px rgba(220, 38, 38, 0.28)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '10px' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', backgroundColor: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ShieldAlert size={28} color="white" />
              </div>
              <div>
                <span style={{ fontSize: '11.5px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.9 }}>
                  24/7 Immediate Emergency Action
                </span>
                <h2 style={{ fontSize: '26px', fontWeight: 800, margin: 0, lineHeight: 1.2 }}>
                  Need Urgent Medical Help?
                </h2>
              </div>
            </div>
            <p style={{ fontSize: '14.5px', lineHeight: '1.6', maxWidth: '680px', margin: 0, opacity: 0.95 }}>
              If you or someone nearby is experiencing severe chest pain, extreme difficulty breathing, heavy uncontrolled bleeding, or sudden paralysis, immediately dial emergency services below.
            </p>
          </div>

          {/* Quick Call Action Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px', marginBottom: '28px' }}>
            {/* Card 1: Ambulance 108 / 102 */}
            <div className="med-card" style={{ border: '2px solid #EF4444', backgroundColor: 'rgba(239, 68, 68, 0.04)', textAlign: 'center', padding: '24px 20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '12px' }}>
              <div>
                <div style={{ width: '50px', height: '50px', borderRadius: '50%', backgroundColor: '#EF4444', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px', boxShadow: '0 6px 16px rgba(239, 68, 68, 0.35)' }}>
                  <PhoneCall size={24} />
                </div>
                <span style={{ fontSize: '11.5px', fontWeight: 800, color: '#DC2626', textTransform: 'uppercase' }}>Ambulance</span>
                <h3 style={{ fontSize: '28px', fontWeight: 900, color: '#DC2626', margin: '2px 0 6px' }}>102 / 108</h3>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>Free 24/7 National Emergency Ambulance</p>
              </div>
              <a href="tel:108" className="btn btn-full" style={{ backgroundColor: '#EF4444', color: 'white', fontWeight: 800, fontSize: '13.5px', padding: '10px 16px', borderRadius: '10px', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                <PhoneCall size={15} /> Call Ambulance (108)
              </a>
            </div>

            {/* Card 2: Health Helpline 1075 */}
            <div className="med-card" style={{ border: '2px solid #F59E0B', backgroundColor: 'rgba(245, 158, 11, 0.04)', textAlign: 'center', padding: '24px 20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '12px' }}>
              <div>
                <div style={{ width: '50px', height: '50px', borderRadius: '50%', backgroundColor: '#F59E0B', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px', boxShadow: '0 6px 16px rgba(245, 158, 11, 0.35)' }}>
                  <HeartPulse size={24} />
                </div>
                <span style={{ fontSize: '11.5px', fontWeight: 800, color: '#D97706', textTransform: 'uppercase' }}>National Health Helpline</span>
                <h3 style={{ fontSize: '28px', fontWeight: 900, color: '#D97706', margin: '2px 0 6px' }}>1075</h3>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>Government Health Advisory & Support</p>
              </div>
              <a href="tel:1075" className="btn btn-full" style={{ backgroundColor: '#F59E0B', color: 'white', fontWeight: 800, fontSize: '13.5px', padding: '10px 16px', borderRadius: '10px', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                <PhoneCall size={15} /> Call Helpline (1075)
              </a>
            </div>

            {/* Card 3: National Emergency 112 */}
            <div className="med-card" style={{ border: '2px solid #2563EB', backgroundColor: 'rgba(37, 99, 235, 0.04)', textAlign: 'center', padding: '24px 20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '12px' }}>
              <div>
                <div style={{ width: '50px', height: '50px', borderRadius: '50%', backgroundColor: '#2563EB', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px', boxShadow: '0 6px 16px rgba(37, 99, 235, 0.35)' }}>
                  <ShieldAlert size={24} />
                </div>
                <span style={{ fontSize: '11.5px', fontWeight: 800, color: '#2563EB', textTransform: 'uppercase' }}>National Emergency</span>
                <h3 style={{ fontSize: '28px', fontWeight: 900, color: '#2563EB', margin: '2px 0 6px' }}>112</h3>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>Unified Emergency Response Service</p>
              </div>
              <a href="tel:112" className="btn btn-full" style={{ backgroundColor: '#2563EB', color: 'white', fontWeight: 800, fontSize: '13.5px', padding: '10px 16px', borderRadius: '10px', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                <PhoneCall size={15} /> Call 112
              </a>
            </div>
          </div>

          {/* DYNAMIC NEARBY HOSPITALS SECTION WITH DEDICATED 5-STATE PERMISSION UX */}
          <div className="med-card" style={{ marginBottom: '28px', padding: '28px', border: '1.5px solid #2563EB' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', flexWrap: 'wrap', gap: '14px' }}>
              <div>
                <div className="flex items-center gap-2" style={{ marginBottom: '4px' }}>
                  <MapPin size={22} color="#2563EB" />
                  <h3 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                    Nearby Hospitals & Emergency Rooms
                  </h3>
                </div>
                <p style={{ fontSize: '13.5px', color: 'var(--text-muted)', margin: 0 }}>
                  Real-time GPS Google Places hospital detection sorted by distance from your actual coordinates.
                </p>
              </div>

              {hasSearchedHospitals && hospitalResults.length > 0 && !isLoadingLocation && (
                <button
                  onClick={handleLocateHospitals}
                  disabled={isLoadingLocation}
                  className="btn btn-outline"
                  style={{ fontSize: '12.5px', padding: '8px 16px', borderColor: '#2563EB', color: '#2563EB', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700 }}
                >
                  <RefreshCw size={14} /> Refresh GPS
                </button>
              )}
            </div>

            {/* STATE 2: DETECTING LOCATION */}
            {isLoadingLocation && (
              <div style={{
                textAlign: 'center',
                padding: '48px 20px',
                backgroundColor: 'var(--bg-app)',
                borderRadius: '16px',
                border: '1.5px dashed #2563EB'
              }}>
                <div style={{ marginBottom: '14px' }}>
                  <LoadingSpinner size={36} color="#2563EB" strokeWidth={3} />
                </div>
                <h4 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '6px' }}>
                  Detecting your location...
                </h4>
                <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', margin: 0 }}>
                  Connecting to GPS & querying Google Places Nearby Search...
                </p>
              </div>
            )}

            {/* STATE 1: LOCATION NOT DETECTED */}
            {!hasSearchedHospitals && !isLoadingLocation && (
              <div style={{
                textAlign: 'center',
                padding: '40px 20px',
                backgroundColor: 'var(--bg-app)',
                borderRadius: '16px',
                border: '1.5px dashed var(--border-subtle)'
              }}>
                <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: 'rgba(37, 99, 235, 0.12)', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  <Navigation size={28} />
                </div>
                <h4 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>
                  Location not detected
                </h4>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)', maxWidth: '520px', margin: '0 auto 20px' }}>
                  Allow location access to discover nearby hospitals, 24/7 trauma centers, and emergency rooms with real distance and directions.
                </p>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
                  <button
                    onClick={handleLocateHospitals}
                    className="btn btn-primary"
                    style={{ backgroundColor: '#2563EB', padding: '12px 28px', fontSize: '14px', fontWeight: 800, borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}
                  >
                    <Navigation size={16} /> Use My Location
                  </button>
                </div>
              </div>
            )}

            {/* STATE 4: PERMISSION DENIED */}
            {permissionDenied && !isLoadingLocation && (
              <div style={{
                padding: '28px',
                backgroundColor: 'rgba(239, 68, 68, 0.06)',
                border: '1.5px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '16px',
                textAlign: 'center'
              }}>
                <AlertCircle size={36} color="#DC2626" style={{ margin: '0 auto 12px' }} />
                <h4 style={{ fontSize: '17px', fontWeight: 800, color: '#DC2626', marginBottom: '6px' }}>
                  Location permission is required
                </h4>
                <p style={{ fontSize: '13.5px', color: 'var(--text-muted)', marginBottom: '18px', maxWidth: '480px', margin: '0 auto 18px' }}>
                  Location access is required to find hospitals near you. Please enable location permissions in your browser.
                </p>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
                  <button
                    onClick={handleLocateHospitals}
                    className="btn btn-primary"
                    style={{ backgroundColor: '#DC2626', fontSize: '13.5px', padding: '10px 22px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700 }}
                  >
                    <RefreshCw size={14} /> Try Again
                  </button>
                </div>
              </div>
            )}

            {/* STATE 5: NO HOSPITALS FOUND / ERROR */}
            {!isLoadingLocation && hasSearchedHospitals && hospitalResults.length === 0 && !permissionDenied && (
              <div style={{
                padding: '32px',
                backgroundColor: 'var(--bg-app)',
                border: '1.5px solid var(--border-subtle)',
                borderRadius: '16px',
                textAlign: 'center'
              }}>
                <Info size={36} color="#D97706" style={{ margin: '0 auto 12px' }} />
                <h4 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '6px' }}>
                  {locationError ? 'Unable to find nearby hospitals' : 'No hospitals found within the selected radius.'}
                </h4>
                <p style={{ fontSize: '13.5px', color: 'var(--text-muted)', marginBottom: '18px', maxWidth: '520px', margin: '0 auto 18px', lineHeight: 1.5 }}>
                  {locationError || 'No hospital facilities were detected within 5km of your current GPS location.'}
                </p>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
                  <button
                    onClick={handleLocateHospitals}
                    className="btn btn-primary"
                    style={{ backgroundColor: '#2563EB', fontSize: '13.5px', padding: '10px 22px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700 }}
                  >
                    <RefreshCw size={14} /> Try Again
                  </button>
                </div>
              </div>
            )}

            {/* STATE 3: LOCATION DETECTED — REAL GOOGLE PLACES HOSPITAL CARDS */}
            {!isLoadingLocation && hospitalResults.length > 0 && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', padding: '8px 14px', backgroundColor: 'rgba(37, 99, 235, 0.08)', borderRadius: '10px', color: '#2563EB', fontSize: '13px', fontWeight: 700 }}>
                  <MapPin size={15} />
                  <span>Location detected • Nearby hospitals based on your current location</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '18px' }}>
                  {hospitalResults.map((h, idx) => (
                    <div 
                      key={h.id || idx} 
                      style={{ 
                        backgroundColor: 'var(--bg-app)', 
                        border: '1px solid var(--border-subtle)', 
                        borderRadius: '16px', 
                        padding: '20px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        gap: '14px',
                        boxShadow: 'var(--shadow-sm)'
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                          <h4 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)', margin: 0, lineHeight: 1.3 }}>
                            🏥 {h.name}
                          </h4>
                          {h.distance_km !== undefined && h.distance_km !== null && (
                            <span style={{ fontSize: '11.5px', fontWeight: 800, backgroundColor: 'rgba(37, 99, 235, 0.12)', color: '#2563EB', padding: '3px 10px', borderRadius: '14px', whiteSpace: 'nowrap' }}>
                              {h.distance_km < 1 ? `${Math.round(h.distance_km * 1000)} m` : `${h.distance_km} km`} away
                            </span>
                          )}
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', flexWrap: 'wrap' }}>
                          {h.open_now !== undefined && h.open_now !== null && (
                            <span style={{ fontSize: '11px', fontWeight: 700, color: h.open_now ? '#047857' : '#DC2626', backgroundColor: h.open_now ? 'rgba(4, 120, 87, 0.1)' : 'rgba(220, 38, 38, 0.1)', padding: '2px 8px', borderRadius: '6px' }}>
                              {h.open_now ? 'Open now' : 'Closed'}
                            </span>
                          )}
                          {h.rating && (
                            <span style={{ fontSize: '11.5px', fontWeight: 700, color: '#D97706', display: 'flex', alignItems: 'center', gap: '3px' }}>
                              <Star size={12} fill="#D97706" color="#D97706" /> {h.rating}
                            </span>
                          )}
                        </div>

                        {h.address && (
                          <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', margin: '0 0 6px 0', lineHeight: 1.4 }}>
                            📍 {h.address}
                          </p>
                        )}
                      </div>

                      <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                        {h.phone && (
                          <a 
                            href={`tel:${h.phone}`}
                            className="btn btn-outline-green"
                            style={{ flex: 1, fontSize: '12.5px', padding: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', textDecoration: 'none', fontWeight: 700 }}
                          >
                            <PhoneCall size={14} /> Call
                          </a>
                        )}
                        <a 
                          href={h.directions_url || `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(h.name + ' ' + (h.address || ''))}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-primary"
                          style={{ flex: 1, fontSize: '12.5px', padding: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', textDecoration: 'none', backgroundColor: '#2563EB', fontWeight: 700 }}
                        >
                          <Navigation size={14} /> Directions <ExternalLink size={12} />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* First Aid Section */}
          <div className="med-card" style={{ padding: '28px', marginBottom: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h3 style={{ fontSize: '19px', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 4px 0' }}>
                  Immediate First Aid Protocols
                </h3>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>
                  Verified clinical emergency steps before medical assistance arrives.
                </p>
              </div>

              <span style={{ fontSize: '11.5px', fontWeight: 700, color: '#DC2626', backgroundColor: 'rgba(220, 38, 38, 0.1)', padding: '4px 12px', borderRadius: '20px' }}>
                ⚠️ Emergency Protocol
              </span>
            </div>

            {/* Selector */}
            <div className="flex gap-2" style={{ overflowX: 'auto', paddingBottom: '8px', marginBottom: '18px' }}>
              {Object.keys(FIRST_AID_DATA).map((catName) => {
                const cat = FIRST_AID_DATA[catName];
                const isSelected = selectedFirstAid === catName;
                return (
                  <button
                    key={catName}
                    onClick={() => setSelectedFirstAid(catName)}
                    style={{
                      padding: '7px 14px',
                      borderRadius: '20px',
                      fontSize: '12.5px',
                      fontWeight: 700,
                      backgroundColor: isSelected ? cat.color : 'var(--bg-app)',
                      color: isSelected ? 'white' : 'var(--text-primary)',
                      border: `1.5px solid ${isSelected ? cat.color : 'var(--border-subtle)'}`,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {catName}
                  </button>
                );
              })}
            </div>

            {/* Instruction Steps */}
            <div style={{ backgroundColor: 'var(--bg-app)', border: `1.5px solid ${activeFirstAid.color}40`, borderRadius: '18px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '50%', backgroundColor: `${activeFirstAid.color}20`, color: activeFirstAid.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FirstAidIcon size={20} />
                </div>
                <div>
                  <h4 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                    {activeFirstAid.title}
                  </h4>
                  <span style={{ fontSize: '11.5px', fontWeight: 700, color: activeFirstAid.color }}>
                    {activeFirstAid.urgency}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {activeFirstAid.steps.map((st) => (
                  <div key={st.step} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', backgroundColor: 'var(--bg-card)', padding: '12px 14px', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: activeFirstAid.color, color: 'white', fontSize: '12px', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '1px' }}>
                      {st.step}
                    </div>
                    <p style={{ fontSize: '13.5px', color: 'var(--text-primary)', lineHeight: 1.5, margin: 0 }}>
                      {st.text}
                    </p>
                  </div>
                ))}
              </div>

              <div style={{ padding: '10px 14px', backgroundColor: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '10px', fontSize: '12.5px', color: '#DC2626', lineHeight: 1.5, display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <strong>Critical Caution:</strong> {activeFirstAid.whatNotToDo}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reader Modal for Selected Article */}
      {selectedArticle && (
        <ArticleReaderModal
          article={selectedArticle}
          isOpen={!!selectedArticle}
          onClose={() => setSelectedArticle(null)}
        />
      )}
    </AppLayout>
  );
};

export default HealthCenterPage;
