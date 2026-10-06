import React, { useState } from 'react';
import AppLayout from '../components/layout/AppLayout';
import { FileQuestion, Sparkles, AlertCircle, HelpCircle, CheckCircle, Volume2 } from 'lucide-react';
import { useToast } from '../context/ToastContext';

const MedicalExplainPage = () => {
  const { addToast } = useToast();
  const [inputText, setInputText] = useState('Patient diagnosed with acute upper respiratory tract infection. Rx: Tab Amoxicillin 500mg TID pc for 5 days. Monitor for dyspnea or high pyrexia.');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);

  const handleExplain = () => {
    if (!inputText.trim()) return;
    setIsAnalyzing(true);

    setTimeout(() => {
      setResult({
        whatItMeans: 'You have a short-term infection affecting your nose, throat, or airways (like a common severe cold or bronchitis). The doctor has prescribed an antibiotic called Amoxicillin to clear the infection.',
        importantInfo: 'Take 1 tablet of Amoxicillin 3 times a day (TID) after meals (pc) for 5 days. Be sure to finish all 5 days of medication even if you feel completely better sooner.',
        termsExplained: [
          { term: 'Acute', meaning: 'Started recently and lasts for a short period of time.' },
          { term: 'Respiratory Tract Infection', meaning: 'Infection of the breathing passages (lungs, throat, nose).' },
          { term: 'TID (Ter in die)', meaning: 'Take 3 times a day.' },
          { term: 'pc (Post cibum)', meaning: 'Take after eating food.' },
          { term: 'Pyrexia', meaning: 'Fever or raised body temperature.' }
        ],
        questionsForDoctor: [
          'What side effects (like mild stomach upset) should I watch out for?',
          'Should I call the clinic if my fever does not decrease after 48 hours?',
          'Are there any foods or vitamins I should avoid while taking this antibiotic?'
        ]
      });
      setIsAnalyzing(false);
      addToast('Medical explanation generated successfully!', 'success');
    }, 900);
  };

  return (
    <AppLayout>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>
          Medical Information Simplifier
        </h1>
        <p style={{ fontSize: '15px', color: 'var(--text-muted)' }}>
          Paste difficult medical jargon, discharge summaries, or prescription codes to translate them into plain English.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '28px' }}>
        {/* INPUT PANEL */}
        <div className="med-card">
          <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px', color: 'var(--text-primary)' }}>
            Medical Notes / Prescription Snippet
          </h3>

          <textarea
            className="input-field no-icon"
            rows={8}
            placeholder="Paste doctor notes, prescription text, or medical report terminology here..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            style={{ width: '100%', marginBottom: '20px', resize: 'vertical' }}
          ></textarea>

          <button
            onClick={handleExplain}
            className="btn btn-primary btn-full btn-lg"
            disabled={isAnalyzing}
          >
            <Sparkles size={20} /> {isAnalyzing ? 'Simplifying Medical Terms...' : 'Explain in Simple Language'}
          </button>
        </div>

        {/* OUTPUT PANEL */}
        <div>
          {result ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Section 1: What this means */}
              <div className="med-card" style={{ borderLeft: '4px solid var(--primary-green)' }}>
                <h4 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--primary-green)', marginBottom: '8px' }}>
                  What this means
                </h4>
                <p style={{ fontSize: '14px', color: 'var(--text-primary)', lineHeight: '1.6' }}>
                  {result.whatItMeans}
                </p>
              </div>

              {/* Section 2: Important Information */}
              <div className="med-card" style={{ borderLeft: '4px solid var(--blue-text)', backgroundColor: 'var(--blue-soft-bg)' }}>
                <h4 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--blue-text)', marginBottom: '8px' }}>
                  Important Information & Timing
                </h4>
                <p style={{ fontSize: '14px', color: 'var(--text-primary)', lineHeight: '1.6' }}>
                  {result.importantInfo}
                </p>
              </div>

              {/* Section 3: Terms Explained */}
              <div className="med-card">
                <h4 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '12px', color: 'var(--text-primary)' }}>
                  Medical Terms Glossary
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {result.termsExplained.map((t, idx) => (
                    <div key={idx} style={{ padding: '8px 12px', backgroundColor: 'var(--bg-app)', borderRadius: '8px' }}>
                      <strong style={{ color: 'var(--primary-green)', fontSize: '13px' }}>{t.term}:</strong>{' '}
                      <span style={{ fontSize: '13px', color: 'var(--text-primary)' }}>{t.meaning}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Section 4: What to discuss with doctor */}
              <div className="med-card" style={{ backgroundColor: 'var(--yellow-soft-bg)', border: '1px solid var(--yellow-icon-bg)' }}>
                <h4 style={{ fontSize: '16px', fontWeight: 700, color: '#92400E', marginBottom: '8px' }}>
                  What to discuss with your healthcare professional
                </h4>
                <ul style={{ paddingLeft: '20px', fontSize: '13px', color: '#78350F', lineHeight: '1.6' }}>
                  {result.questionsForDoctor.map((q, i) => (
                    <li key={i}>{q}</li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <div className="med-card" style={{ textAlign: 'center', padding: '60px 24px' }}>
              <FileQuestion size={48} color="var(--primary-green)" style={{ margin: '0 auto 16px' }} />
              <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>Simplified Breakdown Will Appear Here</h3>
              <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
                Click "Explain in Simple Language" to convert medical abbreviations into understandable terms.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Safety Notice */}
      <div style={{ marginTop: '32px', backgroundColor: 'var(--bg-card)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-subtle)', textAlign: 'center', fontSize: '13px', color: 'var(--text-muted)' }}>
        AI-generated explanation. Please verify important medical instructions with your healthcare professional.
      </div>
    </AppLayout>
  );
};

export default MedicalExplainPage;
