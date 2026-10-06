import React, { useState } from 'react';
import AppLayout from '../components/layout/AppLayout';
import { Languages, Volume2, Copy, ArrowRight, CheckCircle, ShieldCheck } from 'lucide-react';
import { useToast } from '../context/ToastContext';

const TranslationPage = () => {
  const { addToast } = useToast();
  const [sourceLang, setSourceLang] = useState('English');
  const [targetLang, setTargetLang] = useState('Hindi');
  const [sourceText, setSourceText] = useState('Take 1 capsule of Amoxicillin 500mg twice daily after breakfast and dinner for 5 days. Drink plenty of water.');
  const [translatedText, setTranslatedText] = useState('5 दिनों के लिए नाश्ते और रात के खाने के बाद रोजाना दो बार अमोक्सिसिलिन 500mg का 1 कैप्सूल लें। खूब पानी पिएं।');
  const [isTranslating, setIsTranslating] = useState(false);

  const handleTranslate = () => {
    if (!sourceText.trim()) return;
    setIsTranslating(true);

    setTimeout(() => {
      if (targetLang === 'Hindi') {
        setTranslatedText('5 दिनों के लिए नाश्ते और रात के खाने के बाद रोजाना दो बार अमोक्सिसिलिन 500mg का 1 कैप्सूल लें। खूब पानी पिएं।');
      } else if (targetLang === 'Telugu') {
        setTranslatedText('5 రోజుల పాటు అల్పాహారం మరియు రాత్రి భోజనం తర్వాత రోజుకు రెండుసార్లు ఎమోక్సిసిలిన్ 500mg యొక్క 1 కాప్సూల్ తీసుకోండి. పుష్కలంగా నీరు త్రాగాలి.');
      } else if (targetLang === 'Tamil') {
        setTranslatedText('5 நாட்களுக்கு காலை உணவு மற்றும் இரவு உணவிற்குப் பிறகு தினமும் இரண்டு முறை அமோக்சிசிலின் 500 מ"ג 1 காப்ஸ்யூல் எடுத்துக் கொள்ளவும்.');
      } else {
        setTranslatedText(`[${targetLang} Translation]: Take 1 capsule of Amoxicillin 500mg twice daily after meals.`);
      }
      setIsTranslating(false);
      addToast(`Translated successfully to ${targetLang}!`, 'success');
    }, 700);
  };

  const handleSpeak = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      window.speechSynthesis.speak(utterance);
      addToast('Playing speech synthesis audio...', 'info');
    }
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    addToast('Copied text to clipboard!', 'success');
  };

  return (
    <AppLayout>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>
          Understand Healthcare in Your Language
        </h1>
        <p style={{ fontSize: '15px', color: 'var(--text-muted)' }}>
          Translate medical prescriptions, doctor instructions, and dosage guidelines into regional Indian languages.
        </p>
      </div>

      {/* Language Controls */}
      <div className="med-card" style={{ padding: '16px 24px', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div className="flex items-center gap-3">
          <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)' }}>From:</label>
          <select
            value={sourceLang}
            onChange={(e) => setSourceLang(e.target.value)}
            style={{ border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '8px 16px', background: 'var(--bg-card)', color: 'var(--text-primary)', fontWeight: 600 }}
          >
            <option value="English">English</option>
            <option value="Hindi">Hindi (हिंदी)</option>
          </select>
        </div>

        <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'var(--light-mint)', color: 'var(--primary-green)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <ArrowRight size={20} />
        </div>

        <div className="flex items-center gap-3">
          <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)' }}>To Target Language:</label>
          <select
            value={targetLang}
            onChange={(e) => setTargetLang(e.target.value)}
            style={{ border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '8px 16px', background: 'var(--bg-card)', color: 'var(--primary-green)', fontWeight: 700 }}
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
      </div>

      {/* Two Panel Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '28px', marginBottom: '24px' }}>
        {/* Left Panel */}
        <div className="med-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>Original Information ({sourceLang})</h3>
            <button onClick={() => handleCopy(sourceText)} style={{ fontSize: '12px', color: 'var(--primary-green)', cursor: 'pointer', border: 'none', background: 'none' }} className="flex items-center gap-1">
              <Copy size={14} /> Copy
            </button>
          </div>
          <textarea
            className="input-field no-icon"
            rows={8}
            value={sourceText}
            onChange={(e) => setSourceText(e.target.value)}
            placeholder="Type or paste medical text here..."
            style={{ width: '100%', marginBottom: '16px', resize: 'vertical' }}
          ></textarea>
          <button onClick={handleTranslate} className="btn btn-primary btn-full" disabled={isTranslating}>
            <Languages size={18} /> {isTranslating ? 'Translating...' : 'Translate Information'}
          </button>
        </div>

        {/* Right Panel */}
        <div className="med-card" style={{ backgroundColor: 'var(--mint-bg)', border: '1px solid var(--mint-border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--dark-green)' }}>Translated Information ({targetLang})</h3>
            <div className="flex gap-2">
              <button onClick={() => handleSpeak(translatedText)} style={{ fontSize: '12px', color: 'var(--dark-green)', cursor: 'pointer', border: 'none', background: 'none' }} className="flex items-center gap-1">
                <Volume2 size={16} /> Listen
              </button>
              <button onClick={() => handleCopy(translatedText)} style={{ fontSize: '12px', color: 'var(--dark-green)', cursor: 'pointer', border: 'none', background: 'none' }} className="flex items-center gap-1">
                <Copy size={16} /> Copy
              </button>
            </div>
          </div>
          <div style={{
            minHeight: '180px',
            backgroundColor: 'var(--bg-card)',
            borderRadius: '12px',
            padding: '16px',
            fontSize: '16px',
            lineHeight: '1.7',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-subtle)'
          }}>
            {translatedText}
          </div>
        </div>
      </div>

      <div style={{ textStyle: 'center', textAlign: 'center', fontSize: '13px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
        <ShieldCheck size={16} color="var(--primary-green)" /> MediCare AI translation is designed to assist understanding and is not medically certified. Always verify key instructions with your physician.
      </div>
    </AppLayout>
  );
};

export default TranslationPage;
