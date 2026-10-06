import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import PublicNavbar from '../components/layout/PublicNavbar';
import Footer from '../components/layout/Footer';
import { 
  Camera, 
  Upload, 
  Sparkles, 
  ShieldCheck, 
  Clock, 
  FileText, 
  Globe, 
  Mic, 
  BookOpen, 
  AlertCircle, 
  CheckCircle, 
  ArrowRight,
  Heart,
  UserCheck,
  MapPin,
  PhoneCall,
  Activity,
  HeartPulse,
  Pill,
  ExternalLink,
  ShieldAlert,
  Building2,
  Landmark,
  FileCheck,
  Mail,
  Send,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Users,
  CheckCircle2
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';

const LandingPage = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { addToast } = useToast();

  // Contact form state
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMessage, setContactMessage] = useState('');

  // FAQ accordion state
  const [openFaq, setOpenFaq] = useState(null);

  const handleContactSubmit = (e) => {
    e.preventDefault();
    if (!contactName.trim() || !contactEmail.trim() || !contactMessage.trim()) {
      addToast('Please fill out all contact fields.', 'warning');
      return;
    }
    addToast('Thank you! Your message has been received. Our team will get in touch.', 'success');
    setContactName('');
    setContactEmail('');
    setContactMessage('');
  };

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  // Glass card style for smooth integration over background image
  const glassCardStyle = {
    backgroundColor: isDark ? 'rgba(17, 24, 39, 0.75)' : 'rgba(255, 255, 255, 0.8)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(255, 255, 255, 0.9)',
    borderRadius: '20px',
    boxShadow: isDark ? '0 10px 30px rgba(0, 0, 0, 0.4)' : '0 10px 30px rgba(0, 0, 0, 0.04)',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease'
  };

  const FAQS = [
    {
      q: 'How does MediCare understand handwritten doctor prescriptions?',
      a: 'MediCare uses high-precision Gemini Vision OCR models specifically tuned for medical handwriting, printed clinic slips, and hospital discharge summaries to extract medicine names, dosages, and administration frequencies accurately.'
    },
    {
      q: 'Is MediCare available in regional Indian languages?',
      a: 'Yes! MediCare supports 10+ Indian languages including Hindi, Telugu, Tamil, Kannada, Malayalam, Bengali, Marathi, Gujarati, Punjabi, and English, with full text translation and natural voice read-aloud features.'
    },
    {
      q: 'How does the Emergency GPS Hospital Discovery work?',
      a: 'When you click "Find Nearby Hospitals", the system queries Google Places API (New) using your current GPS coordinates to locate real, verified 24/7 hospitals and emergency rooms with real calculated distances and turn-by-turn navigation.'
    },
    {
      q: 'Is my health data secure and private?',
      a: 'Absolutely. All uploaded prescriptions and medical profile records are stored securely in isolated patient accounts with strict access controls and zero public exposure.'
    }
  ];

  return (
    <div className="landing-page" style={{ width: '100%', overflowX: 'hidden', scrollBehavior: 'smooth', backgroundAttachment: 'fixed' }}>
      <PublicNavbar />

      {/* 1. HERO SECTION */}
      <section className="hero-section" id="home" style={{ background: 'transparent' }}>
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', zIndex: 1 }}>
          <div className="badge-pill badge-ai" style={{ width: 'fit-content', marginBottom: '16px' }}>
            <Sparkles size={14} /> AI-POWERED HEALTHCARE ASSISTANT
          </div>

          <h1 className="hero-title" style={{ color: 'var(--text-primary)', lineHeight: '1.2' }}>
            Your Health.<br />
            <span style={{ color: 'var(--primary-green)' }}>Simplified by AI.</span>
          </h1>

          <p className="hero-subtext" style={{ color: 'var(--text-secondary)', fontSize: '16px', lineHeight: '1.7', marginTop: '14px', marginBottom: '24px' }}>
            Understand prescriptions. Manage medicines. Get healthcare guidance. Find nearby emergency facilities.
          </p>

          <div className="hero-actions" style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
            <Link to="/register" className="btn btn-primary btn-lg" style={{ padding: '14px 30px', fontSize: '15px', fontWeight: 800, borderRadius: '14px' }}>
              Get Started <ArrowRight size={18} />
            </Link>
            <a href="#how-it-works" className="btn btn-outline btn-lg" style={{ padding: '14px 26px', fontSize: '15px', fontWeight: 700, borderRadius: '14px', backgroundColor: isDark ? 'rgba(17, 24, 39, 0.6)' : 'rgba(255, 255, 255, 0.7)' }}>
              How It Works
            </a>
          </div>

          <div className="hero-security-note" style={{ color: 'var(--text-muted)', marginTop: '20px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
            <CheckCircle size={18} color="#10B981" /> 
            <span>Secure, private, and encrypted health data management.</span>
          </div>
        </div>

        {/* Right Side Healthcare Product Visual Mockup */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative', zIndex: 1 }}>
          <div 
            className="phone-mockup-card"
            style={{
              ...glassCardStyle,
              width: '100%',
              maxWidth: '360px',
              borderRadius: '28px',
              padding: '24px',
              position: 'relative',
              boxSizing: 'border-box'
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <div>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Good Morning!</span>
                <h4 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>Hello, Patient 👋</h4>
              </div>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'var(--light-mint)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Clock size={18} color="var(--primary-green)" />
              </div>
            </div>

            {/* Today's Medicines Card */}
            <div 
              style={{ 
                backgroundColor: 'var(--light-mint)', 
                borderRadius: '16px', 
                padding: '16px', 
                marginBottom: '14px', 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                border: '1px solid var(--mint-border)' 
              }}
            >
              <div>
                <h5 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--primary-green)', margin: 0 }}>Today's Schedule</h5>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>2 of 3 doses taken</span>
              </div>
              <div style={{ width: '42px', height: '42px', borderRadius: '50%', border: '3.5px solid var(--primary-green)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '12px', color: 'var(--primary-green)' }}>
                66%
              </div>
            </div>

            {/* Dose Item 1 */}
            <div 
              style={{ 
                backgroundColor: isDark ? 'rgba(30, 41, 59, 0.6)' : 'rgba(255, 255, 255, 0.6)', 
                borderRadius: '14px', 
                padding: '12px 14px', 
                marginBottom: '10px', 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                border: '1px solid var(--border-subtle)' 
              }}
            >
              <div>
                <h6 style={{ fontSize: '13.5px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>Tab. Betaloc 100mg</h6>
                <p style={{ fontSize: '11.5px', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>1 tablet • BID • Morning</p>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>08:00 AM</span>
              </div>
              <span className="badge-status badge-taken" style={{ fontSize: '11px' }}>✓ Taken</span>
            </div>

            {/* Dose Item 2 (Upcoming) */}
            <div 
              style={{ 
                backgroundColor: isDark ? 'rgba(30, 41, 59, 0.6)' : 'rgba(255, 255, 255, 0.6)', 
                borderRadius: '14px', 
                padding: '12px 14px', 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                border: '1px solid var(--border-subtle)' 
              }}
            >
              <div>
                <h6 style={{ fontSize: '13.5px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>Tab. Cimetidine 50mg</h6>
                <p style={{ fontSize: '11.5px', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>2 tablets • HS • Night</p>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>09:00 PM</span>
              </div>
              <span className="badge-status badge-pending" style={{ fontSize: '11px' }}>Upcoming</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. HOW IT WORKS SECTION */}
      <section id="how-it-works" style={{ padding: '80px 20px', background: 'transparent' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '50px' }}>
            <div className="badge-pill badge-ai" style={{ margin: '0 auto 12px' }}>
              <Clock size={14} /> SIMPLE 4-STEP WORKFLOW
            </div>
            <h2 style={{ fontSize: '32px', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '12px' }}>
              How MediCare Works
            </h2>
            <p style={{ fontSize: '15px', color: 'var(--text-secondary)', maxWidth: '640px', margin: '0 auto' }}>
              From prescription photo to clear daily reminders in under 30 seconds.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '24px' }}>
            {/* Step 1 */}
            <div style={{ ...glassCardStyle, padding: '28px', position: 'relative' }}>
              <div style={{ position: 'absolute', top: '16px', right: '16px', fontSize: '28px', fontWeight: 900, color: 'var(--primary-green)', opacity: 0.25 }}>
                01
              </div>
              <div style={{ width: '46px', height: '46px', borderRadius: '12px', backgroundColor: 'var(--light-mint)', color: 'var(--primary-green)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                <Camera size={24} />
              </div>
              <h4 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>
                1. Upload Prescription
              </h4>
              <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                Snap a photo or upload an image of your paper prescription, clinical slip, or medical report.
              </p>
            </div>

            {/* Step 2 */}
            <div style={{ ...glassCardStyle, padding: '28px', position: 'relative' }}>
              <div style={{ position: 'absolute', top: '16px', right: '16px', fontSize: '28px', fontWeight: 900, color: '#2563EB', opacity: 0.25 }}>
                02
              </div>
              <div style={{ width: '46px', height: '46px', borderRadius: '12px', backgroundColor: 'rgba(37, 99, 235, 0.12)', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                <Sparkles size={24} />
              </div>
              <h4 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>
                2. AI OCR Extraction
              </h4>
              <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                AI vision reads handwriting and extracts authentic medicine names, strengths, timings, and usage instructions.
              </p>
            </div>

            {/* Step 3 */}
            <div style={{ ...glassCardStyle, padding: '28px', position: 'relative' }}>
              <div style={{ position: 'absolute', top: '16px', right: '16px', fontSize: '28px', fontWeight: 900, color: '#D97706', opacity: 0.25 }}>
                03
              </div>
              <div style={{ width: '46px', height: '46px', borderRadius: '12px', backgroundColor: 'rgba(217, 119, 6, 0.12)', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                <Pill size={24} />
              </div>
              <h4 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>
                3. Daily Schedules
              </h4>
              <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                Automatically organizes doses into Morning, Afternoon, Evening, and Night routines with reminders.
              </p>
            </div>

            {/* Step 4 */}
            <div style={{ ...glassCardStyle, padding: '28px', position: 'relative' }}>
              <div style={{ position: 'absolute', top: '16px', right: '16px', fontSize: '28px', fontWeight: 900, color: '#7C3AED', opacity: 0.25 }}>
                04
              </div>
              <div style={{ width: '46px', height: '46px', borderRadius: '12px', backgroundColor: 'rgba(124, 58, 237, 0.12)', color: '#7C3AED', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                <Globe size={24} />
              </div>
              <h4 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>
                4. Guidance in Your Language
              </h4>
              <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                Listen or read educational medicine information in your regional language with speed-controlled voice assistance.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. CORE HEALTHCARE FEATURES VISUALS */}
      <section className="features-section" id="features" style={{ padding: '80px 20px', maxWidth: '1200px', margin: '0 auto', background: 'transparent' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <div className="badge-pill badge-ai" style={{ margin: '0 auto 12px' }}>
            <Activity size={14} /> COMPLETE DIGITAL HEALTH PLATFORM
          </div>
          <h2 style={{ fontSize: '32px', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '12px' }}>
            Transforming Complex Healthcare into Clear Steps
          </h2>
          <p style={{ fontSize: '15px', color: 'var(--text-secondary)', maxWidth: '640px', margin: '0 auto' }}>
            Designed for patients and families to understand doctor prescriptions, manage medicine routines, and access emergency support.
          </p>
        </div>

        {/* 4 Feature Visual Cards Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))', gap: '24px' }}>
          {/* Card 1: AI Prescription Understanding */}
          <div style={{ ...glassCardStyle, padding: '28px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderTop: '4px solid var(--primary-green)' }}>
            <div>
              <div style={{ width: '48px', height: '48px', borderRadius: '14px', backgroundColor: 'var(--light-mint)', color: 'var(--primary-green)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '18px' }}>
                <Camera size={24} />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '10px' }}>
                AI Prescription Understanding
              </h3>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                Upload paper prescriptions or doctor notes. AI vision extracts authentic medicine names, strengths, dosage frequencies, and care guidance.
              </p>
            </div>
            <div style={{ marginTop: '20px', paddingTop: '14px', borderTop: '1px solid var(--border-subtle)' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--primary-green)' }}>✓ OCR Vision + Educational Guidance</span>
            </div>
          </div>

          {/* Card 2: Medication Management */}
          <div style={{ ...glassCardStyle, padding: '28px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderTop: '4px solid #2563EB' }}>
            <div>
              <div style={{ width: '48px', height: '48px', borderRadius: '14px', backgroundColor: 'rgba(37, 99, 235, 0.12)', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '18px' }}>
                <Pill size={24} />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '10px' }}>
                Medication Management
              </h3>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                Structured daily timelines organized by Morning, Afternoon, Evening, and Night. Mark doses as taken and stay consistent with adherence tracking.
              </p>
            </div>
            <div style={{ marginTop: '20px', paddingTop: '14px', borderTop: '1px solid var(--border-subtle)' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#2563EB' }}>✓ Smart Schedules & Reminders</span>
            </div>
          </div>

          {/* Card 3: Emergency Assistance */}
          <div style={{ ...glassCardStyle, padding: '28px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderTop: '4px solid #DC2626' }}>
            <div>
              <div style={{ width: '48px', height: '48px', borderRadius: '14px', backgroundColor: 'rgba(220, 38, 38, 0.12)', color: '#DC2626', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '18px' }}>
                <HeartPulse size={24} />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '10px' }}>
                Emergency & Hospital Discovery
              </h3>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                Instant GPS nearby hospital discovery powered by Google Places. 1-tap touch dialers for 108/102/112 and verified first-aid protocols.
              </p>
            </div>
            <div style={{ marginTop: '20px', paddingTop: '14px', borderTop: '1px solid var(--border-subtle)' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#DC2626' }}>✓ Live GPS Hospital Discovery</span>
            </div>
          </div>

          {/* Card 4: Regional Language Support */}
          <div style={{ ...glassCardStyle, padding: '28px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderTop: '4px solid #D97706' }}>
            <div>
              <div style={{ width: '48px', height: '48px', borderRadius: '14px', backgroundColor: 'rgba(217, 119, 6, 0.12)', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '18px' }}>
                <Globe size={24} />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '10px' }}>
                Regional Language Support
              </h3>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                Healthcare guidance and voice read-aloud available in Hindi, Telugu, Tamil, Kannada, Malayalam, Bengali, Marathi, and Gujarati.
              </p>
            </div>
            <div style={{ marginTop: '20px', paddingTop: '14px', borderTop: '1px solid var(--border-subtle)' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#D97706' }}>✓ 10+ Indian Languages & Audio</span>
            </div>
          </div>
        </div>
      </section>

      {/* 4. INDIA'S DIGITAL HEALTHCARE ECOSYSTEM (GOVERNMENT INITIATIVES) */}
      <section style={{ padding: '70px 20px', background: 'transparent' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <div className="badge-pill" style={{ backgroundColor: 'rgba(37, 99, 235, 0.12)', color: '#2563EB', margin: '0 auto 12px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <span>🇮🇳</span>
              <strong>India's Digital Healthcare Ecosystem</strong>
            </div>
            <h2 style={{ fontSize: '28px', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '10px' }}>
              National Health Initiatives & Digital Infrastructure
            </h2>
            <p style={{ fontSize: '14.5px', color: 'var(--text-secondary)', maxWidth: '680px', margin: '0 auto' }}>
              Empowering citizens with secure digital health records, nationwide facility registries, and universal healthcare assurance.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))', gap: '20px' }}>
            {/* Initiative 1: ABDM */}
            <div style={{ ...glassCardStyle, padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '10px', backgroundColor: 'rgba(37, 99, 235, 0.1)', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Landmark size={20} />
                  </div>
                  <div>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#2563EB', textTransform: 'uppercase' }}>National Mission</span>
                    <h4 style={{ fontSize: '15.5px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>ABDM</h4>
                  </div>
                </div>
                <h5 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
                  Ayushman Bharat Digital Mission
                </h5>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
                  Aims to build an interoperable digital health ecosystem supporting seamless digital health records, registries, and citizen healthcare access across India.
                </p>
              </div>
              <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid var(--border-subtle)' }}>
                <a 
                  href="https://abdm.gov.in/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--primary-green)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  Learn More <ExternalLink size={13} />
                </a>
              </div>
            </div>

            {/* Initiative 2: ABHA */}
            <div style={{ ...glassCardStyle, padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '10px', backgroundColor: 'rgba(16, 185, 129, 0.1)', color: 'var(--primary-green)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FileCheck size={20} />
                  </div>
                  <div>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--primary-green)', textTransform: 'uppercase' }}>Digital Identity</span>
                    <h4 style={{ fontSize: '15.5px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>ABHA</h4>
                  </div>
                </div>
                <h5 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
                  Ayushman Bharat Health Account
                </h5>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
                  Provides citizens with a unique 14-digit digital health account/identifier to link, access, and share longitudinal medical records securely.
                </p>
              </div>
              <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid var(--border-subtle)' }}>
                <a 
                  href="https://abha.abdm.gov.in/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--primary-green)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  Learn More <ExternalLink size={13} />
                </a>
              </div>
            </div>

            {/* Initiative 3: PM-JAY */}
            <div style={{ ...glassCardStyle, padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '10px', backgroundColor: 'rgba(217, 119, 6, 0.1)', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ShieldCheck size={20} />
                  </div>
                  <div>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#D97706', textTransform: 'uppercase' }}>Health Assurance</span>
                    <h4 style={{ fontSize: '15.5px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>PM-JAY</h4>
                  </div>
                </div>
                <h5 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
                  Pradhan Mantri Jan Arogya Yojana
                </h5>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
                  The flagship government-funded health assurance scheme providing secondary and tertiary hospitalization cover for eligible beneficiary families.
                </p>
              </div>
              <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid var(--border-subtle)' }}>
                <a 
                  href="https://nha.gov.in/PM-JAY" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--primary-green)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  Learn More <ExternalLink size={13} />
                </a>
              </div>
            </div>

            {/* Initiative 4: HFR */}
            <div style={{ ...glassCardStyle, padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '10px', backgroundColor: 'rgba(124, 58, 237, 0.1)', color: '#7C3AED', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Building2 size={20} />
                  </div>
                  <div>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#7C3AED', textTransform: 'uppercase' }}>Facility Registry</span>
                    <h4 style={{ fontSize: '15.5px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>HFR</h4>
                  </div>
                </div>
                <h5 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
                  Health Facility Registry
                </h5>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
                  A comprehensive national repository of registered hospitals, clinics, diagnostic centers, and pharmacies across modern and traditional medicine.
                </p>
              </div>
              <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid var(--border-subtle)' }}>
                <a 
                  href="https://hfr.abdm.gov.in/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--primary-green)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  Learn More <ExternalLink size={13} />
                </a>
              </div>
            </div>
          </div>

          <div style={{ marginTop: '24px', textAlign: 'center' }}>
            <span style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
              Note: Government Health Initiatives are official programs of the National Health Authority (NHA), Government of India. MediCare is an independent digital health assistant.
            </span>
          </div>
        </div>
      </section>

      {/* 5. ABOUT US / PLATFORM MISSION SECTION */}
      <section id="about" style={{ padding: '80px 20px', maxWidth: '1200px', margin: '0 auto', background: 'transparent' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '40px', alignItems: 'center' }}>
          <div>
            <div className="badge-pill badge-ai" style={{ marginBottom: '14px' }}>
              <Users size={14} /> ABOUT MEDICARE
            </div>
            <h2 style={{ fontSize: '32px', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '16px', lineHeight: 1.3 }}>
              Empowering Patients with Intelligent, Accessible Healthcare
            </h2>
            <p style={{ fontSize: '15px', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '16px' }}>
              MediCare was created with a straightforward mission: eliminate medication confusion and bridge the language barrier in healthcare delivery.
            </p>
            <p style={{ fontSize: '14.5px', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '24px' }}>
              Whether you are managing chronic therapy, organizing medications for elderly parents, or looking for immediate emergency facilities, MediCare transforms complex clinical jargon into actionable, localized guidance.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div style={{ ...glassCardStyle, padding: '18px', borderRadius: '16px' }}>
                <h4 style={{ fontSize: '26px', fontWeight: 900, color: 'var(--primary-green)', margin: '0 0 4px 0' }}>10+</h4>
                <span style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>Indian Languages Supported</span>
              </div>
              <div style={{ ...glassCardStyle, padding: '18px', borderRadius: '16px' }}>
                <h4 style={{ fontSize: '26px', fontWeight: 900, color: '#2563EB', margin: '0 0 4px 0' }}>24/7</h4>
                <span style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>GPS Emergency Hospital Discovery</span>
              </div>
            </div>
          </div>

          <div style={{ ...glassCardStyle, padding: '32px', border: '1.5px solid var(--mint-border)' }}>
            <h3 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '18px' }}>
              Our Patient Safety Commitment
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <CheckCircle2 size={18} color="var(--primary-green)" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span style={{ fontSize: '13.5px', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                  <strong>Educational & Informational:</strong> All generated explanations complement your doctor's official advice without prescribing drugs.
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <CheckCircle2 size={18} color="var(--primary-green)" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span style={{ fontSize: '13.5px', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                  <strong>Data Sovereignty:</strong> Encrypted health records accessible exclusively by the authenticated user.
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <CheckCircle2 size={18} color="var(--primary-green)" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span style={{ fontSize: '13.5px', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                  <strong>Geospatial Accuracy:</strong> Live Google Places API integration ensures reliable nearby emergency center finding.
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. WHY CHOOSE MEDICARE (TRUST SECTION) */}
      <section style={{ padding: '70px 20px', background: 'transparent' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <h2 style={{ fontSize: '28px', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '10px' }}>
              Why Choose MediCare?
            </h2>
            <p style={{ fontSize: '15px', color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto' }}>
              Patient-centered digital technology built for accessibility, clarity, and safety.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
            <div style={{ ...glassCardStyle, padding: '22px', display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
              <CheckCircle size={22} color="var(--primary-green)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <h4 style={{ fontSize: '15.5px', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 4px 0' }}>Understand Complex Prescriptions</h4>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>Translate doctor handwriting and medical terms into plain, understandable instructions.</p>
              </div>
            </div>

            <div style={{ ...glassCardStyle, padding: '22px', display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
              <CheckCircle size={22} color="var(--primary-green)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <h4 style={{ fontSize: '15.5px', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 4px 0' }}>Manage Medicine Schedules</h4>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>Keep track of daily doses, meal timings, and receive timely reminder alerts.</p>
              </div>
            </div>

            <div style={{ ...glassCardStyle, padding: '22px', display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
              <CheckCircle size={22} color="var(--primary-green)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <h4 style={{ fontSize: '15.5px', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 4px 0' }}>Multilingual Healthcare Support</h4>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>Read or listen to medication guidelines in your preferred regional Indian language.</p>
              </div>
            </div>

            <div style={{ ...glassCardStyle, padding: '22px', display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
              <CheckCircle size={22} color="var(--primary-green)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <h4 style={{ fontSize: '15.5px', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 4px 0' }}>AI Clinical Educational Assistance</h4>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>Explore medicine uses, mechanisms of action, and essential precautions safely.</p>
              </div>
            </div>

            <div style={{ ...glassCardStyle, padding: '22px', display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
              <CheckCircle size={22} color="var(--primary-green)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <h4 style={{ fontSize: '15.5px', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 4px 0' }}>Emergency Hospital Discovery</h4>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>Discover real 24/7 hospitals and emergency rooms with GPS navigation and direct call links.</p>
              </div>
            </div>

            <div style={{ ...glassCardStyle, padding: '22px', display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
              <CheckCircle size={22} color="var(--primary-green)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <h4 style={{ fontSize: '15.5px', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 4px 0' }}>Secure Health Information</h4>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>Your uploaded prescriptions and profile records are private and protected.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. CONTACT & FREQUENTLY ASKED QUESTIONS SECTION */}
      <section id="contact" style={{ padding: '80px 20px', maxWidth: '1200px', margin: '0 auto', background: 'transparent' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <div className="badge-pill badge-ai" style={{ margin: '0 auto 12px' }}>
            <Mail size={14} /> GET IN TOUCH & FAQ
          </div>
          <h2 style={{ fontSize: '32px', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '12px' }}>
            Frequently Asked Questions & Support
          </h2>
          <p style={{ fontSize: '15px', color: 'var(--text-secondary)', maxWidth: '640px', margin: '0 auto' }}>
            Have questions about MediCare features or need technical assistance? We are here to help.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '36px' }}>
          {/* FAQ Column */}
          <div>
            <h3 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <HelpCircle size={20} color="var(--primary-green)" /> Common Questions
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {FAQS.map((faq, idx) => {
                const isOpen = openFaq === idx;
                return (
                  <div 
                    key={idx}
                    style={{
                      ...glassCardStyle,
                      padding: '18px 22px',
                      cursor: 'pointer',
                      border: isOpen ? '1.5px solid var(--primary-green)' : glassCardStyle.border
                    }}
                    onClick={() => toggleFaq(idx)}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px' }}>
                      <h4 style={{ fontSize: '14.5px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                        {faq.q}
                      </h4>
                      <button style={{ background: 'none', border: 'none', color: 'var(--primary-green)', cursor: 'pointer', padding: 0 }}>
                        {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                      </button>
                    </div>
                    {isOpen && (
                      <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: 1.6, marginTop: '12px', marginBottom: 0, paddingTop: '10px', borderTop: '1px solid var(--border-subtle)' }}>
                        {faq.a}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Contact Form Column */}
          <div style={{ ...glassCardStyle, padding: '32px', border: '1.5px solid var(--mint-border)' }}>
            <h3 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MessageSquare size={20} color="var(--primary-green)" /> Send Us a Message
            </h3>
            <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
              Questions about integrating healthcare facilities or patient assistance? Leave a message below.
            </p>

            <form onSubmit={handleContactSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '6px' }}>
                  Your Name
                </label>
                <input 
                  type="text"
                  placeholder="e.g. Ramesh Kumar"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  className="input-field no-icon"
                  style={{ width: '100%', padding: '10px 14px', fontSize: '13.5px', backgroundColor: isDark ? 'rgba(30, 41, 59, 0.7)' : 'rgba(255, 255, 255, 0.8)' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '6px' }}>
                  Email Address
                </label>
                <input 
                  type="email"
                  placeholder="ramesh@example.com"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="input-field no-icon"
                  style={{ width: '100%', padding: '10px 14px', fontSize: '13.5px', backgroundColor: isDark ? 'rgba(30, 41, 59, 0.7)' : 'rgba(255, 255, 255, 0.8)' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '6px' }}>
                  Your Message
                </label>
                <textarea 
                  rows={4}
                  placeholder="How can we assist you?"
                  value={contactMessage}
                  onChange={(e) => setContactMessage(e.target.value)}
                  className="input-field no-icon"
                  style={{ width: '100%', padding: '10px 14px', fontSize: '13.5px', resize: 'vertical', backgroundColor: isDark ? 'rgba(30, 41, 59, 0.7)' : 'rgba(255, 255, 255, 0.8)' }}
                />
              </div>

              <button 
                type="submit" 
                className="btn btn-primary"
                style={{ padding: '12px 20px', fontSize: '14px', fontWeight: 800, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '6px' }}
              >
                <Send size={16} /> Send Message
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* 8. EMERGENCY CALL TO ACTION SECTION */}
      <section style={{ padding: '60px 20px', background: 'transparent' }}>
        <div 
          style={{
            ...glassCardStyle,
            maxWidth: '1000px',
            margin: '0 auto',
            padding: '36px 32px',
            border: '2px solid #DC2626',
            borderRadius: '24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '24px',
            boxShadow: '0 20px 40px -15px rgba(220, 38, 38, 0.15)'
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <HeartPulse size={24} color="#DC2626" />
              <span style={{ fontSize: '13px', fontWeight: 800, color: '#DC2626', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Emergency Healthcare Support
              </span>
            </div>
            <h3 style={{ fontSize: '24px', fontWeight: 900, color: 'var(--text-primary)', margin: '0 0 8px 0' }}>
              Need emergency help?
            </h3>
            <p style={{ fontSize: '14.5px', color: 'var(--text-secondary)', margin: 0, maxWidth: '540px' }}>
              Find hospitals near your current location instantly with real GPS distance and turn-by-turn navigation.
            </p>
          </div>

          <Link 
            to="/health-center?tab=emergency"
            className="btn btn-primary"
            style={{
              backgroundColor: '#DC2626',
              padding: '14px 28px',
              fontSize: '15px',
              fontWeight: 800,
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              textDecoration: 'none',
              boxShadow: '0 8px 20px rgba(220, 38, 38, 0.25)'
            }}
          >
            <MapPin size={18} /> Find Nearby Hospitals
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default LandingPage;