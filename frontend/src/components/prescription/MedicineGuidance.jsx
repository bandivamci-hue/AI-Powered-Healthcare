import React, { useState, useEffect } from 'react';
import { Sparkles, ShieldAlert, Loader2, Globe } from 'lucide-react';
import { aiService } from '../../services/aiService';

const MedicineGuidance = ({ medicines = [], selectedLanguage, onLanguageChange, onGuidanceChange }) => {
  const [displayedGuidance, setDisplayedGuidance] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setIsTranslating(true);

    aiService.generateGuidance(medicines, selectedLanguage).then((guidanceText) => {
      if (isMounted) {
        setDisplayedGuidance(guidanceText);
        setIsTranslating(false);
        if (onGuidanceChange) {
          onGuidanceChange(guidanceText);
        }
      }
    });

    return () => {
      isMounted = false;
    };
  }, [selectedLanguage, medicines]);

  return (
    <div className="med-card" style={{ padding: '20px', border: '1.5px solid var(--mint-border)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
      <div>
        {/* Header & Multilingual Language Selector Dropdown */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div className="flex items-center gap-2">
            <Sparkles size={18} color="var(--primary-green)" />
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              Dynamic Medicine Guidance
            </h3>
          </div>

          <div className="flex items-center gap-1">
            <Globe size={14} color="var(--text-muted)" />
            <select
              value={selectedLanguage}
              onChange={(e) => onLanguageChange(e.target.value)}
              className="input-field no-icon"
              style={{
                width: '155px',
                padding: '4px 8px',
                fontSize: '12px',
                fontWeight: 600,
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-card)'
              }}
            >
              <option value="English">English</option>
              <option value="Hindi">Hindi (हिंदी)</option>
              <option value="Telugu">Telugu (తెలుగు)</option>
              <option value="Tamil">Tamil (தமிழ்)</option>
              <option value="Kannada">Kannada (ಕನ್ನಡ)</option>
              <option value="Malayalam">Malayalam (മലയാളം)</option>
              <option value="Bengali">Bengali (বাংলা)</option>
              <option value="Marathi">Marathi (मराठी)</option>
              <option value="Gujarati">Gujarati (ગુજરાતી)</option>
              <option value="Punjabi">Punjabi (ਪੰਜਾਬੀ)</option>
              <option value="Urdu">Urdu (اردو)</option>
            </select>
          </div>
        </div>

        {/* Dynamic Translated Educational Guidance Box */}
        <div style={{
          backgroundColor: 'var(--light-mint)',
          borderRadius: 'var(--radius-md)',
          padding: '16px',
          border: '1px solid var(--mint-border)',
          fontSize: '13px',
          lineHeight: '1.8',
          color: 'var(--dark-green)',
          fontWeight: 500,
          minHeight: '220px',
          maxHeight: '280px',
          overflowY: 'auto',
          whiteSpace: 'pre-wrap'
        }}>
          {isTranslating ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '180px', gap: '8px', color: 'var(--dark-green)', fontWeight: 600 }}>
              <Loader2 className="animate-spin" size={18} /> Generating guidance in {selectedLanguage}...
            </div>
          ) : (
            displayedGuidance || 'Upload a prescription to view medicine care guidance.'
          )}
        </div>

        {/* Healthcare Safety Disclaimer */}
        <div style={{
          marginTop: '14px',
          padding: '10px 14px',
          backgroundColor: 'rgba(245, 158, 11, 0.08)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid rgba(245, 158, 11, 0.2)',
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
    </div>
  );
};

export default MedicineGuidance;
