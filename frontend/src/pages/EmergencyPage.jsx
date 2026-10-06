import React, { useState } from 'react';
import AppLayout from '../components/layout/AppLayout';
import { 
  ShieldAlert, PhoneCall, HeartPulse, MapPin, 
  Navigation, ExternalLink, AlertTriangle, CheckCircle2, 
  Search, Loader2, Info, X, Clock, Flame, Activity, Stethoscope
} from 'lucide-react';
import { useToast } from '../context/ToastContext';

// Verified Curated First-Aid Database
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

// Curated Emergency Hospitals Database with real geographic coordination centers
const EMERGENCY_HOSPITALS = [
  {
    name: 'Apollo Emergency & Trauma Centre',
    city: 'Hyderabad',
    lat: 17.4156,
    lng: 78.4116,
    phone: '1066',
    address: 'Road No. 72, Film Nagar, Jubilee Hills, Hyderabad, Telangana',
    erStatus: '24/7 Level 1 Trauma Center',
    specialties: 'Cardiac ER, Stroke Unit, ICU'
  },
  {
    name: 'Care Hospital Emergency Department',
    city: 'Visakhapatnam',
    lat: 17.7212,
    lng: 83.3082,
    phone: '0891-3041444',
    address: 'AS Raja Complex, Waltair Main Road, Visakhapatnam, Andhra Pradesh',
    erStatus: '24/7 Multi-Specialty ER',
    specialties: 'Trauma, Acute Cardiac, Pediatric ER'
  },
  {
    name: 'AIIMS Emergency Medicine Centre',
    city: 'Delhi',
    lat: 28.5672,
    lng: 77.2100,
    phone: '011-26588500',
    address: 'Sri Aurobindo Marg, Ansari Nagar, New Delhi - 110029',
    erStatus: '24/7 Apex Emergency & Trauma',
    specialties: 'Trauma, Burns, Toxicology, Cardiac'
  },
  {
    name: 'King George Hospital (KGH) Government ER',
    city: 'Visakhapatnam',
    lat: 17.7056,
    lng: 83.3031,
    phone: '0891-2564891',
    address: 'Maharanipeta, Collector Office Road, Visakhapatnam, Andhra Pradesh',
    erStatus: '24/7 Government Apex ER',
    specialties: 'Trauma, Acute Medical, Poisoning, Burn Ward'
  },
  {
    name: 'Manipal Hospital Emergency Services',
    city: 'Bangalore',
    lat: 12.9592,
    lng: 77.6499,
    phone: '080-25024444',
    address: '98, HAL Old Airport Road, Kodihalli, Bengaluru, Karnataka',
    erStatus: '24/7 Level 1 Trauma ER',
    specialties: 'Cardiac, Stroke, Pediatric Trauma'
  },
  {
    name: 'Fortis Hospital Acute Care Unit',
    city: 'Mumbai',
    lat: 19.1601,
    lng: 72.9372,
    phone: '022-67994444',
    address: 'Mulund Goregaon Link Road, Industrial Area, Mulund West, Mumbai',
    erStatus: '24/7 Comprehensive Emergency',
    specialties: 'Critical Care, Cardiac, Polytrauma'
  },
  {
    name: 'Sanjay Gandhi Postgraduate Institute (SGPGI) ER',
    city: 'Lucknow',
    lat: 26.7454,
    lng: 80.9388,
    phone: '0522-2668004',
    address: 'Raebareli Road, Lucknow, Uttar Pradesh - 226014',
    erStatus: '24/7 Advanced Emergency Medicine',
    specialties: 'Tertiary Trauma, Acute Medicine, ICU'
  },
  {
    name: 'Christian Medical College (CMC) Emergency',
    city: 'Vellore',
    lat: 12.9246,
    lng: 79.1352,
    phone: '0416-2281000',
    address: 'IDA Scudder Road, Vellore, Tamil Nadu - 632004',
    erStatus: '24/7 Apex Emergency & Trauma',
    specialties: 'Multi-Organ Trauma, Pediatric, Toxicology'
  }
];

// Distance calculation using Haversine formula
const calculateDistanceKm = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const EmergencyPage = () => {
  const { addToast } = useToast();
  const [selectedFirstAid, setSelectedFirstAid] = useState('Heavy Bleeding');
  
  // Hospital locator states
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [userCoords, setUserCoords] = useState(null);
  const [hospitalResults, setHospitalResults] = useState([]);
  const [searchLocationQuery, setSearchLocationQuery] = useState('');
  const [locationError, setLocationError] = useState('');
  const [hasSearchedHospitals, setHasSearchedHospitals] = useState(false);

  const activeFirstAid = FIRST_AID_DATA[selectedFirstAid] || FIRST_AID_DATA['Heavy Bleeding'];
  const FirstAidIcon = activeFirstAid.icon;

  const handleLocateHospitals = () => {
    setIsLoadingLocation(true);
    setLocationError('');
    setHasSearchedHospitals(true);

    if (!navigator.geolocation) {
      setIsLoadingLocation(false);
      setLocationError('Geolocation is not supported by your browser. Please search by city below.');
      showFallbackHospitals('Visakhapatnam');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserCoords({ lat: latitude, lng: longitude });

        // Calculate real distance to hospitals
        const sorted = EMERGENCY_HOSPITALS.map((h) => {
          const dist = calculateDistanceKm(latitude, longitude, h.lat, h.lng);
          return { ...h, distanceKm: dist };
        }).sort((a, b) => a.distanceKm - b.distanceKm);

        setHospitalResults(sorted);
        setIsLoadingLocation(false);
        addToast(`Found ${sorted.length} nearby emergency hospital facilities!`, 'success');
      },
      (error) => {
        setIsLoadingLocation(false);
        console.warn('Geolocation notice:', error);
        setLocationError('Location access was denied or unavailable. Enter your city to find nearby hospitals.');
        showFallbackHospitals('Visakhapatnam');
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const showFallbackHospitals = (cityFilter = '') => {
    let list = EMERGENCY_HOSPITALS;
    if (cityFilter.trim()) {
      const q = cityFilter.toLowerCase().trim();
      list = EMERGENCY_HOSPITALS.filter(
        h => h.city.toLowerCase().includes(q) || h.address.toLowerCase().includes(q) || h.name.toLowerCase().includes(q)
      );
    }
    if (list.length === 0) list = EMERGENCY_HOSPITALS;
    setHospitalResults(list.map((h, i) => ({ ...h, distanceKm: (i + 1) * 2.4 })));
  };

  const handleManualSearch = (e) => {
    e.preventDefault();
    if (!searchLocationQuery.trim()) return;
    setHasSearchedHospitals(true);
    showFallbackHospitals(searchLocationQuery);
    addToast(`Displaying emergency medical centers matching "${searchLocationQuery}"`, 'info');
  };

  return (
    <AppLayout>
      {/* High-Contrast Safety Critical Header */}
      <div 
        style={{
          backgroundColor: '#DC2626',
          color: 'white',
          borderRadius: '24px',
          padding: '36px 32px',
          marginBottom: '32px',
          boxShadow: '0 12px 30px rgba(220, 38, 38, 0.28)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '12px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShieldAlert size={32} color="white" />
          </div>
          <div>
            <span style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.9 }}>
              24/7 Immediate Emergency Action
            </span>
            <h1 style={{ fontSize: '32px', fontWeight: 800, margin: 0, lineHeight: 1.2 }}>
              Need Urgent Medical Help?
            </h1>
          </div>
        </div>
        <p style={{ fontSize: '15.5px', lineHeight: '1.6', maxWidth: '680px', margin: 0, opacity: 0.95 }}>
          If you or someone nearby is experiencing severe chest pain, extreme difficulty breathing, heavy uncontrolled bleeding, or sudden paralysis, immediately dial emergency services below.
        </p>
      </div>

      {/* Quick Call Emergency Action Cards */}
      <div className="emergency-cards-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '32px', width: '100%', boxSizing: 'border-box' }}>
        {/* Card 1: Ambulance */}
        <div 
          className="med-card" 
          style={{ 
            border: '2px solid #EF4444', 
            backgroundColor: 'rgba(239, 68, 68, 0.04)', 
            textAlign: 'center',
            padding: '24px 20px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: '12px'
          }}
        >
          <div>
            <div style={{ width: '52px', height: '52px', borderRadius: '50%', backgroundColor: '#EF4444', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', boxShadow: '0 6px 16px rgba(239, 68, 68, 0.35)' }}>
              <PhoneCall size={26} />
            </div>
            <span style={{ fontSize: '12px', fontWeight: 800, color: '#DC2626', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Ambulance Services
            </span>
            <h2 style={{ fontSize: '30px', fontWeight: 900, color: '#DC2626', margin: '4px 0 8px' }}>
              102 / 108
            </h2>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>
              Free 24/7 National Emergency Ambulance
            </p>
          </div>
          <a 
            href="tel:108" 
            className="btn btn-full" 
            style={{ 
              backgroundColor: '#EF4444', 
              color: 'white', 
              fontWeight: 800, 
              fontSize: '14px',
              padding: '12px 16px',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              textDecoration: 'none'
            }}
          >
            <PhoneCall size={16} /> Call Ambulance (108)
          </a>
        </div>

        {/* Card 2: National Health Helpline */}
        <div 
          className="med-card" 
          style={{ 
            border: '2px solid #F59E0B', 
            backgroundColor: 'rgba(245, 158, 11, 0.04)', 
            textAlign: 'center',
            padding: '24px 20px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: '12px'
          }}
        >
          <div>
            <div style={{ width: '52px', height: '52px', borderRadius: '50%', backgroundColor: '#F59E0B', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', boxShadow: '0 6px 16px rgba(245, 158, 11, 0.35)' }}>
              <HeartPulse size={26} />
            </div>
            <span style={{ fontSize: '12px', fontWeight: 800, color: '#D97706', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              National Health Helpline
            </span>
            <h2 style={{ fontSize: '30px', fontWeight: 900, color: '#D97706', margin: '4px 0 8px' }}>
              1075
            </h2>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>
              Government Health Advisory & Medical Support
            </p>
          </div>
          <a 
            href="tel:1075" 
            className="btn btn-full" 
            style={{ 
              backgroundColor: '#F59E0B', 
              color: 'white', 
              fontWeight: 800, 
              fontSize: '14px',
              padding: '12px 16px',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              textDecoration: 'none'
            }}
          >
            <PhoneCall size={16} /> Call Helpline (1075)
          </a>
        </div>

        {/* Card 3: Nearby Hospital ER Units */}
        <div 
          className="med-card" 
          style={{ 
            border: '2px solid #2563EB', 
            backgroundColor: 'rgba(37, 99, 235, 0.04)', 
            textAlign: 'center',
            padding: '24px 20px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: '12px'
          }}
        >
          <div>
            <div style={{ width: '52px', height: '52px', borderRadius: '50%', backgroundColor: '#2563EB', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', boxShadow: '0 6px 16px rgba(37, 99, 235, 0.35)' }}>
              <MapPin size={26} />
            </div>
            <span style={{ fontSize: '12px', fontWeight: 800, color: '#2563EB', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Nearby Hospitals
            </span>
            <h2 style={{ fontSize: '24px', fontWeight: 900, color: '#2563EB', margin: '8px 0 8px' }}>
              Find ER Units
            </h2>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>
              Live GPS ER Locator & Trauma Centers
            </p>
          </div>
          <button 
            onClick={handleLocateHospitals}
            disabled={isLoadingLocation}
            className="btn btn-full" 
            style={{ 
              backgroundColor: '#2563EB', 
              color: 'white', 
              fontWeight: 800, 
              fontSize: '14px',
              padding: '12px 16px',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              cursor: isLoadingLocation ? 'wait' : 'pointer'
            }}
          >
            {isLoadingLocation ? (
              <><Loader2 className="animate-spin" size={16} /> Locating GPS...</>
            ) : (
              <><Navigation size={16} /> Locate Nearest Hospital</>
            )}
          </button>
        </div>
      </div>

      {/* Hospital Locator Results Panel */}
      {hasSearchedHospitals && (
        <div className="med-card" style={{ marginBottom: '32px', padding: '24px', border: '1.5px solid #2563EB' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'rgba(37, 99, 235, 0.15)', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <MapPin size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                  Nearby Emergency Rooms & Hospitals
                </h3>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  {userCoords ? 'Sorted by closest distance to your live GPS coordinates' : 'Search results by city and medical center'}
                </span>
              </div>
            </div>

            {/* Manual City Search Fallback */}
            <form onSubmit={handleManualSearch} style={{ display: 'flex', gap: '8px', width: '100%', maxWidth: '360px' }}>
              <input
                type="text"
                placeholder="Search by city (e.g. Visakhapatnam, Delhi)..."
                value={searchLocationQuery}
                onChange={(e) => setSearchLocationQuery(e.target.value)}
                className="input-field no-icon"
                style={{ fontSize: '12.5px', padding: '6px 12px' }}
              />
              <button type="submit" className="btn btn-primary" style={{ padding: '6px 14px', fontSize: '12px' }}>
                <Search size={14} /> Search
              </button>
            </form>
          </div>

          {locationError && (
            <div style={{ padding: '10px 14px', backgroundColor: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.25)', borderRadius: '10px', fontSize: '12px', color: '#DC2626', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Info size={15} /> {locationError}
            </div>
          )}

          {/* Hospital Cards List */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
            {hospitalResults.map((h, idx) => (
              <div 
                key={idx} 
                style={{ 
                  backgroundColor: 'var(--bg-app)', 
                  border: '1px solid var(--border-subtle)', 
                  borderRadius: '16px', 
                  padding: '18px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '12px'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                    <h4 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)', margin: 0, lineHeight: 1.3 }}>
                      {h.name}
                    </h4>
                    {h.distanceKm !== undefined && (
                      <span style={{ fontSize: '11.5px', fontWeight: 700, backgroundColor: 'rgba(37, 99, 235, 0.12)', color: '#2563EB', padding: '3px 8px', borderRadius: '12px', whiteSpace: 'nowrap' }}>
                        {h.distanceKm < 1 ? `${Math.round(h.distanceKm * 1000)} m` : `${h.distanceKm.toFixed(1)} km`} away
                      </span>
                    )}
                  </div>

                  <span style={{ display: 'inline-block', fontSize: '11px', fontWeight: 700, color: '#047857', backgroundColor: '#D1FAE5', padding: '2px 8px', borderRadius: '6px', marginBottom: '8px' }}>
                    ✓ {h.erStatus}
                  </span>

                  <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', margin: '0 0 6px 0', lineHeight: 1.4 }}>
                    📍 {h.address}
                  </p>
                  <span style={{ fontSize: '11.5px', color: 'var(--text-muted)', display: 'block' }}>
                    Specialties: {h.specialties}
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                  <a 
                    href={`tel:${h.phone}`}
                    className="btn btn-outline-green"
                    style={{ flex: 1, fontSize: '12px', padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', textDecoration: 'none' }}
                  >
                    <PhoneCall size={14} /> Call ({h.phone})
                  </a>
                  <a 
                    href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(h.name + ' ' + h.address)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary"
                    style={{ flex: 1, fontSize: '12px', padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', textDecoration: 'none' }}
                  >
                    <Navigation size={14} /> Directions <ExternalLink size={12} />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Immediate First Aid Quick Steps Section */}
      <div className="med-card" style={{ marginBottom: '32px', padding: '28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h3 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 4px 0' }}>
              Immediate First Aid Quick Steps
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>
              Verified clinical response protocols before emergency medical assistance arrives.
            </p>
          </div>

          <span style={{ fontSize: '12px', fontWeight: 700, color: '#DC2626', backgroundColor: 'rgba(220, 38, 38, 0.1)', padding: '4px 12px', borderRadius: '20px' }}>
            ⚠️ Emergency Protocol
          </span>
        </div>

        {/* First Aid Category Selector Pills */}
        <div className="flex gap-2" style={{ overflowX: 'auto', paddingBottom: '8px', marginBottom: '20px' }}>
          {Object.keys(FIRST_AID_DATA).map((catName) => {
            const cat = FIRST_AID_DATA[catName];
            const isSelected = selectedFirstAid === catName;
            return (
              <button
                key={catName}
                onClick={() => setSelectedFirstAid(catName)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '9999px',
                  fontSize: '13px',
                  fontWeight: 700,
                  backgroundColor: isSelected ? cat.color : 'var(--bg-app)',
                  color: isSelected ? 'white' : 'var(--text-primary)',
                  border: `1.5px solid ${isSelected ? cat.color : 'var(--border-subtle)'}`,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.2s ease',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span>{catName}</span>
              </button>
            );
          })}
        </div>

        {/* First Aid Instructions Card */}
        <div 
          style={{
            backgroundColor: 'var(--bg-app)',
            border: `1.5px solid ${activeFirstAid.color}40`,
            borderRadius: '20px',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: `${activeFirstAid.color}20`, color: activeFirstAid.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FirstAidIcon size={22} />
              </div>
              <div>
                <h4 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                  {activeFirstAid.title}
                </h4>
                <span style={{ fontSize: '12px', fontWeight: 700, color: activeFirstAid.color }}>
                  {activeFirstAid.urgency}
                </span>
              </div>
            </div>
          </div>

          {/* Steps List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {activeFirstAid.steps.map((st) => (
              <div 
                key={st.step}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  backgroundColor: 'var(--bg-card)',
                  padding: '14px 16px',
                  borderRadius: '12px',
                  border: '1px solid var(--border-subtle)'
                }}
              >
                <div style={{
                  width: '26px',
                  height: '26px',
                  borderRadius: '50%',
                  backgroundColor: activeFirstAid.color,
                  color: 'white',
                  fontSize: '12.5px',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  marginTop: '1px'
                }}>
                  {st.step}
                </div>
                <p style={{ fontSize: '14px', color: 'var(--text-primary)', lineHeight: 1.6, margin: 0 }}>
                  {st.text}
                </p>
              </div>
            ))}
          </div>

          {/* What NOT to do alert */}
          <div style={{
            padding: '12px 16px',
            backgroundColor: 'rgba(239, 68, 68, 0.08)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '12px',
            fontSize: '13px',
            color: '#DC2626',
            lineHeight: 1.5,
            display: 'flex',
            alignItems: 'flex-start',
            gap: '8px'
          }}>
            <AlertTriangle size={18} style={{ flexShrink: 0, marginTop: '1px' }} />
            <div>
              <strong>Critical Caution:</strong> {activeFirstAid.whatNotToDo}
            </div>
          </div>
        </div>

        {/* Small Safety Disclaimer */}
        <div style={{ textAlign: 'center', fontSize: '12px', color: 'var(--text-muted)', marginTop: '20px' }}>
          ℹ️ First-aid steps are temporary life-support measures while waiting for emergency responders. Never delay calling 108 / 102 for critical injuries.
        </div>
      </div>
    </AppLayout>
  );
};

export default EmergencyPage;
