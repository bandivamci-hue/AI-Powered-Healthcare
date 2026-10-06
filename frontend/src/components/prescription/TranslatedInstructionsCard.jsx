import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  Globe, 
  Loader2, 
  ShieldAlert, 
  ChevronDown, 
  ChevronUp, 
  Pill, 
  Activity, 
  AlertTriangle, 
  CheckCircle2, 
  BookOpen,
  Layers
} from 'lucide-react';
import LoadingSpinner from '../common/LoadingSpinner';
import api from '../../services/api';

const TranslatedInstructionsCard = ({ medicines = [], rawText = '', selectedLanguage, onLanguageChange, onGuidanceChange }) => {
  const [guidanceData, setGuidanceData] = useState(null);
  const [displayedGuidance, setDisplayedGuidance] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [expandedCards, setExpandedCards] = useState({});
  const [viewMode, setViewMode] = useState('cards'); // 'cards' | 'text'

  const cacheRef = useRef({});
  const activeRequestIdRef = useRef(0);

  // Stable key representing current medicines
  const medicinesKey = (medicines || []).map((m) => `${m.name || ''}_${m.dose || ''}`).join('|');

  useEffect(() => {
    if (!medicines || medicines.length === 0) {
      setGuidanceData(null);
      setDisplayedGuidance('');
      setIsTranslating(false);
      return;
    }

    const cacheKey = `${selectedLanguage}__${medicinesKey}`;

    // 1. Instant Cache Hit (0ms)
    if (cacheRef.current[cacheKey]) {
      const cached = cacheRef.current[cacheKey];
      setGuidanceData(cached);
      setDisplayedGuidance(cached.formatted_text || '');
      setIsTranslating(false);
      if (onGuidanceChange) {
        onGuidanceChange(cached.formatted_text || '');
      }
      return;
    }

    // 2. Fetch from high-speed backend Gemini API
    const requestId = ++activeRequestIdRef.current;
    setIsTranslating(true);

    api.post('/api/ai/medicine-guidance/', {
      medicines: medicines,
      raw_ocr_text: rawText,
      language: selectedLanguage
    }).then((res) => {
      if (requestId === activeRequestIdRef.current) {
        const data = res.data;
        cacheRef.current[cacheKey] = data;
        setGuidanceData(data);
        const fullText = data.formatted_text || (data.medicines || []).map((m, i) => `💊 ${i + 1}. ${m.medicine_name}: ${m.description || m.common_use}`).join('\n\n');
        setDisplayedGuidance(fullText);
        setIsTranslating(false);

        // Auto expand all cards initially
        const initialExpanded = {};
        (data.medicines || []).forEach((_, idx) => {
          initialExpanded[idx] = true;
        });
        setExpandedCards(initialExpanded);

        if (onGuidanceChange) {
          onGuidanceChange(fullText);
        }
      }
    }).catch((err) => {
      console.warn('[Guidance API Error]:', err);
      if (requestId === activeRequestIdRef.current) {
        setIsTranslating(false);
      }
    });
  }, [selectedLanguage, medicinesKey, rawText]);

  const toggleCard = (idx) => {
    setExpandedCards((prev) => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  const medicineList = guidanceData?.medicines || medicines.map((m) => ({
    medicine_name: m.name || 'Prescribed Medicine',
    common_use: 'Follow prescribing physician guidance',
    how_it_generally_works: 'Clinical therapy as directed by doctor',
    side_effects: 'Follow pharmacist and doctor instructions',
    important_precautions: 'Take with water and do not alter prescribed dosage'
  }));

  return (
    <div className="med-card" style={{ padding: '24px', border: '1.5px solid var(--mint-border)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Header & Language Selector Badge */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div className="flex items-center gap-2">
          <Sparkles size={20} color="var(--primary-green)" />
          <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
            Medicine Educational Guidance
          </h3>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div style={{ display: 'flex', backgroundColor: 'var(--bg-app)', padding: '2px', borderRadius: '14px', border: '1px solid var(--border-subtle)' }}>
            <button
              onClick={() => setViewMode('cards')}
              style={{
                padding: '4px 10px',
                borderRadius: '10px',
                fontSize: '11.5px',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                backgroundColor: viewMode === 'cards' ? 'var(--primary-green)' : 'transparent',
                color: viewMode === 'cards' ? 'white' : 'var(--text-secondary)'
              }}
            >
              Cards
            </button>
            <button
              onClick={() => setViewMode('text')}
              style={{
                padding: '4px 10px',
                borderRadius: '10px',
                fontSize: '11.5px',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                backgroundColor: viewMode === 'text' ? 'var(--primary-green)' : 'transparent',
                color: viewMode === 'text' ? 'white' : 'var(--text-secondary)'
              }}
            >
              Full Text
            </button>
          </div>

          <div className="flex items-center gap-1">
            <Globe size={14} color="var(--primary-green)" />
            <select
              value={selectedLanguage}
              onChange={(e) => onLanguageChange(e.target.value)}
              className="input-field no-icon"
              style={{
                padding: '5px 10px',
                fontSize: '12px',
                fontWeight: 700,
                borderRadius: '16px',
                backgroundColor: 'var(--light-mint)',
                color: 'var(--primary-green)',
                borderColor: 'var(--mint-border)',
                cursor: 'pointer'
              }}
            >
              <option value="English">🇬🇧 English</option>
              <option value="Hindi">🇮🇳 Hindi (हिंदी)</option>
              <option value="Telugu">🇮🇳 Telugu (తెలుగు)</option>
              <option value="Tamil">🇮🇳 Tamil (தமிழ்)</option>
              <option value="Kannada">🇮🇳 Kannada (ಕನ್ನಡ)</option>
              <option value="Malayalam">🇮🇳 Malayalam (മലയാളം)</option>
              <option value="Bengali">🇮🇳 Bengali (বাংলা)</option>
              <option value="Marathi">🇮🇳 Marathi (मराठी)</option>
              <option value="Gujarati">🇮🇳 Gujarati (ગુજરાતી)</option>
              <option value="Punjabi">🇮🇳 Punjabi (ਪੰਜਾਬੀ)</option>
              <option value="Urdu">🇵🇰 Urdu (اردو)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Content Area */}
      {isTranslating ? (
        <div style={{
          backgroundColor: 'var(--light-mint)',
          borderRadius: 'var(--radius-md)',
          padding: '40px 20px',
          textAlign: 'center',
          color: 'var(--primary-green)',
          fontWeight: 700,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '12px'
        }}>
          <LoadingSpinner size={30} color="var(--primary-green)" strokeWidth={3} />
          <span>Generating medicine-specific educational guidance in {selectedLanguage}...</span>
        </div>
      ) : viewMode === 'cards' ? (
        /* INDIVIDUAL MEDICINE GUIDANCE CARDS */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {medicineList.map((med, idx) => {
            const isExpanded = expandedCards[idx] !== false;
            const name = med.medicine_name || `Medicine ${idx + 1}`;
            return (
              <div
                key={idx}
                style={{
                  backgroundColor: 'var(--bg-app)',
                  borderRadius: '14px',
                  border: '1.5px solid var(--mint-border)',
                  overflow: 'hidden',
                  transition: 'all 0.2s ease'
                }}
              >
                {/* Expandable Card Header */}
                <div
                  onClick={() => toggleCard(idx)}
                  style={{
                    padding: '14px 18px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer',
                    backgroundColor: isExpanded ? 'var(--light-mint)' : 'var(--bg-card)',
                    borderBottom: isExpanded ? '1px solid var(--mint-border)' : 'none'
                  }}
                >
                  <div className="flex items-center gap-2.5">
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--primary-green)',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <Pill size={16} />
                    </div>
                    <div>
                      <h4 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                        {name}
                      </h4>
                      {med.common_use && (
                        <span style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                          {med.common_use}
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--primary-green)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </button>
                </div>

                {/* Expanded Details Body */}
                {isExpanded && (
                  <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px', lineHeight: '1.6' }}>
                    {/* Common Uses */}
                    {med.common_use && (
                      <div>
                        <strong style={{ color: 'var(--primary-green)', display: 'block', marginBottom: '2px', fontSize: '12.5px', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                          • Common Uses
                        </strong>
                        <p style={{ margin: 0, color: 'var(--text-primary)' }}>{med.common_use}</p>
                      </div>
                    )}

                    {/* How It Works */}
                    {med.how_it_generally_works && (
                      <div>
                        <strong style={{ color: '#2563EB', display: 'block', marginBottom: '2px', fontSize: '12.5px', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                          • How It Generally Works
                        </strong>
                        <p style={{ margin: 0, color: 'var(--text-primary)' }}>{med.how_it_generally_works}</p>
                      </div>
                    )}

                    {/* Common Side Effects */}
                    {med.side_effects && (
                      <div>
                        <strong style={{ color: '#D97706', display: 'block', marginBottom: '2px', fontSize: '12.5px', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                          • Potential Common Side Effects
                        </strong>
                        <p style={{ margin: 0, color: 'var(--text-primary)' }}>{med.side_effects}</p>
                      </div>
                    )}

                    {/* Important Precautions */}
                    {med.important_precautions && (
                      <div>
                        <strong style={{ color: '#DC2626', display: 'block', marginBottom: '2px', fontSize: '12.5px', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                          • Important Precautions
                        </strong>
                        <p style={{ margin: 0, color: 'var(--text-primary)' }}>{med.important_precautions}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        /* FULL TEXT VIEW */
        <div style={{
          backgroundColor: 'var(--light-mint)',
          borderRadius: 'var(--radius-md)',
          padding: '18px',
          border: '1px solid var(--mint-border)',
          fontSize: '13px',
          lineHeight: '1.8',
          color: 'var(--text-primary)',
          fontWeight: 500,
          minHeight: '240px',
          maxHeight: '400px',
          overflowY: 'auto',
          whiteSpace: 'pre-wrap'
        }}>
          {displayedGuidance || 'No guidance generated.'}
        </div>
      )}

      {/* Healthcare Safety Disclaimer */}
      <div style={{
        padding: '10px 14px',
        backgroundColor: 'var(--yellow-soft-bg)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid rgba(245, 158, 11, 0.3)',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '8px',
        fontSize: '11px',
        color: 'var(--yellow-text)',
        lineHeight: '1.5'
      }}>
        <ShieldAlert size={15} style={{ flexShrink: 0, marginTop: '2px' }} />
        <span>
          AI-generated educational information. Always follow your doctor's official prescription instructions and verify unclear information with a healthcare professional.
        </span>
      </div>
    </div>
  );
};

export default TranslatedInstructionsCard;
