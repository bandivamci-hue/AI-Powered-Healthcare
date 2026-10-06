import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';
import ProcessingStatus from '../components/prescription/ProcessingStatus';
import YourPrescriptionCard from '../components/prescription/YourPrescriptionCard';
import TranslatedInstructionsCard from '../components/prescription/TranslatedInstructionsCard';
import VoiceGuidanceCard from '../components/prescription/VoiceGuidanceCard';
import MedicineBreakdown from '../components/prescription/MedicineBreakdown';
import ResultsActions from '../components/prescription/ResultsActions';
import { prescriptionService } from '../services/prescriptionService';
import { aiService } from '../services/aiService';
import { useToast } from '../context/ToastContext';

const ScanResultsPage = () => {
  const location = useLocation();
  const { addToast } = useToast();
  const initialDoc = location.state?.document;

  const [doc, setDoc] = useState(initialDoc);
  const [rawText, setRawText] = useState('');
  const [medicines, setMedicines] = useState([]);
  const [imageUrl, setImageUrl] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [guidanceText, setGuidanceText] = useState('');
  const [isReprocessing, setIsReprocessing] = useState(false);

  // Fetch updated document details if necessary (e.g. on direct navigation or refresh)
  useEffect(() => {
    if (doc && doc.id && !doc.ai_summary) {
      prescriptionService.getDocumentById(doc.id).then((fetchedDoc) => {
        if (fetchedDoc && fetchedDoc.ai_summary) {
          setDoc(fetchedDoc);
        }
      });
    }
  }, [doc]);

  // Parse document summary into true verbatim Raw OCR Text & Structured Medicines
  useEffect(() => {
    if (doc) {
      if (doc.imageUrl || doc.file) {
        const img = doc.imageUrl || (typeof doc.file === 'string' ? (doc.file.startsWith('http') ? doc.file : `http://127.0.0.1:8000${doc.file}`) : URL.createObjectURL(doc.file));
        setImageUrl(img);
      }

      if (doc.ai_summary) {
        const fullSummary = doc.ai_summary;

        // 1. Extract Genuine Raw OCR Text transcribed from image
        let detectedRawText = fullSummary;
        if (fullSummary.includes('[RAW_OCR_TEXT]')) {
          const parts = fullSummary.split('[RAW_OCR_TEXT]');
          detectedRawText = (parts[1] || parts[0]).split('[MEDICINES]')[0].trim();
        } else if (fullSummary.includes('[RAW_TEXT]')) {
          const parts = fullSummary.split('[RAW_TEXT]');
          detectedRawText = (parts[1] || parts[0]).split('[MEDICINES]')[0].trim();
        } else if (fullSummary.includes('[MEDICINES]')) {
          detectedRawText = fullSummary.split('[MEDICINES]')[0].trim();
        }
        setRawText(detectedRawText);

        // 2. Extract Structured Medicine Array
        if (fullSummary.includes('[MEDICINES]')) {
          const medSection = fullSummary.split('[MEDICINES]')[1] || '';
          const lines = medSection.split('\n').filter((l) => l.trim().length > 0);

          const parsed = lines.map((line, idx) => {
            const parts = line.split('|').map((p) => p.trim());
            const nameStrength = parts[0] || `Medication ${idx + 1}`;
            const form = parts[1] || (nameStrength.toLowerCase().includes('cap') ? 'Capsule' : 'Tablet');
            const dose = parts[2] || '1 tablet';
            const frequency = parts[3] || 'Once daily';
            const timing = parts[4] || 'After meals';
            const duration = parts[5] || '5 days';

            return {
              id: idx + 1,
              name: nameStrength,
              form: form,
              dose: dose,
              frequency: frequency,
              timing: timing,
              duration: duration,
              needsVerification: false
            };
          });

          if (parsed.length > 0) {
            setMedicines(parsed);
          }
        }
      }
    }
  }, [doc]);

  // Handle re-extracting structured medicines when user manually edits raw text
  const handleTranslateClick = async () => {
    if (!rawText.trim()) {
      addToast('Please enter prescription text to translate.', 'warning');
      return;
    }

    setIsReprocessing(true);
    addToast('Re-extracting medicines and updating guidance...', 'info');

    try {
      const data = await aiService.reExtractFromRawText(rawText, selectedLanguage);
      if (data && data.medicines && data.medicines.length > 0) {
        setMedicines(data.medicines);
        addToast(`Extracted ${data.medicines.length} medicines from edited text!`, 'success');
      } else {
        addToast('Updated raw text for translation.', 'info');
      }
    } catch (err) {
      console.warn('[Translate Notice] Local reprocess fallback:', err);
    } finally {
      setIsReprocessing(false);
    }
  };

  return (
    <AppLayout>
      {/* Top Header & Breadcrumb Status */}
      <ProcessingStatus totalMedicines={medicines.length} />

      {/* Main 2-Column Desktop Grid Layout */}
      <div className="target-results-grid" style={{ marginBottom: '28px' }}>
        {/* LEFT COLUMN — Your Prescription Card (Image, Status, Manual Input, Translate Button) */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <YourPrescriptionCard
            imageUrl={imageUrl}
            rawText={rawText}
            onRawTextChange={(val) => setRawText(val)}
            onTranslateClick={handleTranslateClick}
            medicinesCount={medicines.length}
            isReprocessing={isReprocessing}
          />
        </div>

        {/* RIGHT COLUMN — Translated Instructions Card + Voice Guidance Card directly below */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Top Card: Translated Instructions */}
          <TranslatedInstructionsCard
            medicines={medicines}
            rawText={rawText}
            selectedLanguage={selectedLanguage}
            onLanguageChange={(lang) => setSelectedLanguage(lang)}
            onGuidanceChange={(gText) => setGuidanceText(gText)}
          />

          {/* Bottom Card: Voice Guidance */}
          <VoiceGuidanceCard
            text={guidanceText || rawText}
            selectedLanguage={selectedLanguage}
          />
        </div>
      </div>

      {/* Extracted Medicines Breakdown Cards */}
      <MedicineBreakdown medicines={medicines} />

      {/* Safety Confirmation & Action Bar */}
      <ResultsActions doc={doc} medicines={medicines} rawText={rawText} />

      {/* Responsive CSS Grid Styles */}
      <style>{`
        .target-results-grid {
          display: grid;
          grid-template-columns: 380px 1fr;
          gap: 24px;
          align-items: start;
        }

        @media (max-width: 1100px) {
          .target-results-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </AppLayout>
  );
};

export default ScanResultsPage;
