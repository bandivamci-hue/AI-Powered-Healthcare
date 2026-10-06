import React, { useState } from 'react';
import AppLayout from '../components/layout/AppLayout';
import { Search, Activity, AlertTriangle, ShieldCheck, HelpCircle } from 'lucide-react';

const SymptomsPage = () => {
  const [selectedSymptom, setSelectedSymptom] = useState('Fever');
  const [searchTerm, setSearchTerm] = useState('');

  const commonSymptoms = ['Fever', 'Headache', 'Cough', 'Fatigue', 'Stomach Pain', 'Body Pain', 'Nausea'];

  const symptomData = {
    Fever: {
      title: 'Fever (Elevated Temperature)',
      disclaimerText: 'This symptom can have many causes, most commonly viral or bacterial infections.',
      whatItMeans: 'Fever is your body natural defense mechanism to help fight off infections. It is not an illness itself, but a sign that your immune system is active.',
      causes: ['Viral infections (Flu, Cold)', 'Bacterial infections', 'Heat exhaustion', 'Inflammatory conditions'],
      selfCare: ['Drink plenty of fluids (water, oral rehydration solutions).', 'Get adequate bed rest.', 'Wear lightweight, breathable clothing.'],
      whenToSeekCare: ['Fever above 103°F (39.4°C) that does not respond to fever reducers.', 'Fever lasting more than 3 consecutive days.', 'Accompanied by stiff neck, shortness of breath, or severe headache.'],
      questionsForDoctor: ['Could this fever be caused by my recent prescription?', 'What is the safe maximum dose of fever medication for me?']
    },
    Headache: {
      title: 'Headache',
      disclaimerText: 'This symptom can have many causes ranging from stress to dehydration.',
      whatItMeans: 'Headaches involve pain in the head or upper neck. Most headaches are non-serious tension or sinus headaches.',
      causes: ['Dehydration or missed meals', 'Stress or eye strain', 'Lack of sleep', 'Sinus congestion'],
      selfCare: ['Rest in a quiet, dark room.', 'Drink a large glass of water.', 'Apply a cool compress to your forehead.'],
      whenToSeekCare: ['Sudden, severe headache like a "thunderclap".', 'Headache accompanied by fever, confusion, or weakness on one side.', 'Headache following a head injury.'],
      questionsForDoctor: ['Could my current medications be causing medication overuse headaches?']
    },
    Cough: {
      title: 'Cough',
      disclaimerText: 'This symptom can have many causes including allergies or upper respiratory infections.',
      whatItMeans: 'Coughing is a reflex that keeps your throat and airways clear of irritants or mucus.',
      causes: ['Common cold or seasonal flu', 'Allergies or dust exposure', 'Acid reflux'],
      selfCare: ['Stay hydrated with warm water or herbal tea with honey.', 'Use a steam inhaler or warm shower.'],
      whenToSeekCare: ['Coughing up blood or thick pinkish sputum.', 'Difficulty breathing or wheezing.', 'Cough persisting for more than 3 weeks.'],
      questionsForDoctor: ['Is my cough productive or dry, and does it require an expectorant?']
    }
  };

  const currentInfo = symptomData[selectedSymptom] || symptomData['Fever'];

  return (
    <AppLayout>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>
          Understand Your Symptoms
        </h1>
        <p style={{ fontSize: '15px', color: 'var(--text-muted)' }}>
          Educational guide to understand common symptoms, self-care, and when to consult a doctor.
        </p>
      </div>

      {/* Non-Diagnosis Disclaimer Alert */}
      <div style={{
        backgroundColor: 'var(--yellow-soft-bg)',
        border: '1px solid var(--yellow-icon-bg)',
        borderRadius: '12px',
        padding: '14px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '28px',
        fontSize: '13px',
        color: '#78350F'
      }}>
        <AlertTriangle size={20} color="#D97706" />
        <span><strong>Educational Purpose Only:</strong> MediCare AI provides symptom education and information. It does not provide medical diagnosis.</span>
      </div>

      {/* Quick Filter Pills */}
      <div className="flex gap-2" style={{ marginBottom: '24px', overflowX: 'auto', paddingBottom: '4px' }}>
        {commonSymptoms.map((symptom) => (
          <button
            key={symptom}
            onClick={() => setSelectedSymptom(symptom)}
            style={{
              padding: '10px 20px',
              borderRadius: '9999px',
              fontWeight: 600,
              fontSize: '14px',
              backgroundColor: selectedSymptom === symptom ? 'var(--primary-green)' : 'var(--bg-card)',
              color: selectedSymptom === symptom ? 'white' : 'var(--text-primary)',
              border: '1px solid var(--border-subtle)',
              cursor: 'pointer'
            }}
          >
            {symptom}
          </button>
        ))}
      </div>

      {/* Educational Symptom Card Container */}
      <div className="med-card" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div>
          <div className="flex items-center gap-2" style={{ marginBottom: '6px' }}>
            <Activity size={24} color="var(--primary-green)" />
            <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)' }}>{currentInfo.title}</h2>
          </div>
          <p style={{ fontSize: '14px', color: 'var(--primary-green)', fontWeight: 600 }}>
            ℹ️ {currentInfo.disclaimerText}
          </p>
        </div>

        {/* Section 1: What it may mean */}
        <div style={{ backgroundColor: 'var(--bg-app)', padding: '16px', borderRadius: '12px' }}>
          <h4 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '6px', color: 'var(--text-primary)' }}>What it may mean</h4>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>{currentInfo.whatItMeans}</p>
        </div>

        {/* Section 2: Common causes */}
        <div>
          <h4 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '8px', color: 'var(--text-primary)' }}>Common causes</h4>
          <ul style={{ paddingLeft: '20px', fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
            {currentInfo.causes.map((c, i) => <li key={i}>{c}</li>)}
          </ul>
        </div>

        {/* Section 3: General self-care */}
        <div>
          <h4 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '8px', color: 'var(--text-primary)' }}>General self-care information</h4>
          <ul style={{ paddingLeft: '20px', fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
            {currentInfo.selfCare.map((sc, i) => <li key={i}>{sc}</li>)}
          </ul>
        </div>

        {/* Section 4: When to seek medical care */}
        <div style={{ backgroundColor: '#FEF2F2', border: '1px solid #FCA5A5', padding: '16px', borderRadius: '12px' }}>
          <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#991B1B', marginBottom: '8px' }}>When to seek urgent medical care</h4>
          <ul style={{ paddingLeft: '20px', fontSize: '13px', color: '#991B1B', lineHeight: '1.6' }}>
            {currentInfo.whenToSeekCare.map((wc, i) => <li key={i}>{wc}</li>)}
          </ul>
        </div>
      </div>
    </AppLayout>
  );
};

export default SymptomsPage;
