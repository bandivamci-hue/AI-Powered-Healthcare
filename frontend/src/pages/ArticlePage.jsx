import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';
import { 
  Clock, 
  ArrowLeft, 
  ShieldAlert, 
  Sparkles, 
  BookOpen, 
  Pill, 
  Activity, 
  Heart, 
  HelpCircle, 
  AlertTriangle, 
  CheckCircle2, 
  Volume2, 
  VolumeX, 
  Globe, 
  Loader2,
  ChevronRight,
  ShieldCheck,
  Stethoscope,
  Info
} from 'lucide-react';
import { HEALTH_ARTICLES } from './HealthEducationPage';
import { speechController } from '../services/speechController';
import { useToast } from '../context/ToastContext';
import api from '../services/api';

const ArticlePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const article = HEALTH_ARTICLES.find(a => a.id === id) || HEALTH_ARTICLES[0];

  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [isTranslating, setIsTranslating] = useState(false);
  const [translatedData, setTranslatedData] = useState(null);
  const [isPlayingVoice, setIsPlayingVoice] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);

  // Subscribe to speech controller
  useEffect(() => {
    const unsubscribe = speechController.subscribe(({ isPlaying, textId }) => {
      setIsPlayingVoice(isPlaying && textId === `article-${article.id}`);
    });
    return () => {
      speechController.stop();
      unsubscribe();
    };
  }, [article.id]);

  // Translation handling
  useEffect(() => {
    if (selectedLanguage === 'English') {
      setTranslatedData(null);
      setIsTranslating(false);
      return;
    }

    setIsTranslating(true);
    api.post('/api/ai/translate-article/', {
      title: article.title,
      summary: article.snippet || article.intro,
      key_points: article.keyPoints || [],
      content: article.simpleExplanation || '',
      language: selectedLanguage
    }).then((res) => {
      setTranslatedData(res.data);
      setIsTranslating(false);
    }).catch((err) => {
      console.warn('[Translation Error]:', err);
      setIsTranslating(false);
    });
  }, [selectedLanguage, article]);

  const handlePlayVoice = () => {
    if (isPlayingVoice) {
      speechController.stop();
    } else {
      const titleToRead = translatedData?.title || article.title;
      const summaryToRead = translatedData?.summary || article.snippet || article.intro;
      const contentToRead = translatedData?.content || article.simpleExplanation;
      const fullText = `${titleToRead}. Summary: ${summaryToRead}. Details: ${contentToRead}`;
      speechController.speak(fullText, selectedLanguage, `article-${article.id}`);
    }
  };

  const handleSpeedChange = (speed) => {
    setPlaybackSpeed(speed);
    speechController.setPlaybackRate(speed);
  };

  const displayTitle = translatedData?.title || article.title;
  const displaySummary = translatedData?.summary || article.snippet || article.intro;
  const displayContent = translatedData?.content || article.simpleExplanation;
  const displayKeyPoints = translatedData?.key_points || article.keyPoints || [];

  return (
    <AppLayout>
      {/* Back Navigation Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <Link 
          to="/health-center?tab=education" 
          className="flex items-center gap-2" 
          style={{ color: 'var(--primary-green)', fontSize: '13.5px', fontWeight: 700, textDecoration: 'none' }}
        >
          <ArrowLeft size={16} /> Back to Health Center
        </Link>

        {/* Top Actions: Language Selector & Audio Speed Bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {/* Audio Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: 'var(--bg-card)', padding: '4px 8px', borderRadius: '20px', border: '1px solid var(--border-subtle)' }}>
            <button
              onClick={handlePlayVoice}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                padding: '5px 12px',
                borderRadius: '16px',
                fontSize: '12px',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                backgroundColor: isPlayingVoice ? '#EF4444' : 'var(--primary-green)',
                color: 'white'
              }}
            >
              {isPlayingVoice ? <VolumeX size={14} /> : <Volume2 size={14} />}
              <span>{isPlayingVoice ? 'Stop Reading' : 'Listen Article'}</span>
            </button>

            {/* Speed Pills */}
            <div style={{ display: 'flex', gap: '3px' }}>
              {[1.0, 1.5, 2.0].map((s) => (
                <button
                  key={s}
                  onClick={() => handleSpeedChange(s)}
                  style={{
                    padding: '2px 7px',
                    borderRadius: '10px',
                    fontSize: '11px',
                    fontWeight: 700,
                    border: 'none',
                    cursor: 'pointer',
                    backgroundColor: playbackSpeed === s ? 'var(--primary-green)' : 'transparent',
                    color: playbackSpeed === s ? 'white' : 'var(--text-secondary)'
                  }}
                >
                  {s}×
                </button>
              ))}
            </div>
          </div>

          {/* Multilingual Selector */}
          <div className="flex items-center gap-1.5" style={{ backgroundColor: 'var(--bg-card)', padding: '4px 10px', borderRadius: '20px', border: '1px solid var(--border-subtle)' }}>
            <Globe size={14} color="var(--primary-green)" />
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="input-field no-icon"
              style={{
                padding: '2px 6px',
                fontSize: '12px',
                fontWeight: 700,
                border: 'none',
                backgroundColor: 'transparent',
                color: 'var(--text-primary)',
                cursor: 'pointer'
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
            </select>
          </div>
        </div>
      </div>

      {/* Main Medical Article Container */}
      <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Article Hero Banner Card */}
        <div className="med-card" style={{ padding: '36px 32px', borderTop: `5px solid ${article.color || 'var(--primary-green)'}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <span 
              style={{ 
                backgroundColor: `${article.color || 'var(--primary-green)'}18`, 
                color: article.color || 'var(--primary-green)',
                fontWeight: 800,
                fontSize: '12px',
                padding: '4px 12px',
                borderRadius: '20px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}
            >
              {article.category}
            </span>

            <span style={{ fontSize: '12.5px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Clock size={14} /> {article.readTime}
            </span>
          </div>

          <h1 style={{ fontSize: '28px', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '14px', lineHeight: 1.3 }}>
            {displayTitle}
          </h1>

          <p style={{ fontSize: '15.5px', color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0, borderLeft: '4px solid var(--primary-green)', paddingLeft: '16px', fontStyle: 'italic' }}>
            {displaySummary}
          </p>

          {isTranslating && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '16px', color: 'var(--primary-green)', fontSize: '13px', fontWeight: 600 }}>
              <Loader2 size={16} className="animate-spin" /> Translating article into {selectedLanguage}...
            </div>
          )}
        </div>

        {/* Key Takeaways & Summary Points */}
        {displayKeyPoints && displayKeyPoints.length > 0 && (
          <div className="med-card" style={{ padding: '24px 28px', backgroundColor: 'var(--light-mint)', border: '1.5px solid var(--mint-border)' }}>
            <div className="flex items-center gap-2" style={{ marginBottom: '14px' }}>
              <CheckCircle2 size={20} color="var(--primary-green)" />
              <h3 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--dark-green)', margin: 0 }}>
                Essential Clinical Takeaways
              </h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {displayKeyPoints.map((pt, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--primary-green)', display: 'inline-block', marginTop: '8px', flexShrink: 0 }} />
                  <span style={{ fontSize: '14px', color: 'var(--text-primary)', lineHeight: 1.6, fontWeight: 500 }}>
                    {pt}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Section 1: Overview & What is it */}
        <div className="med-card" style={{ padding: '28px' }}>
          <div className="flex items-center gap-2.5" style={{ marginBottom: '14px' }}>
            <div style={{ width: '34px', height: '34px', borderRadius: '10px', backgroundColor: 'var(--light-mint)', color: 'var(--primary-green)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <BookOpen size={18} />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              Overview & Clinical Explanation
            </h3>
          </div>

          <p style={{ fontSize: '14.5px', color: 'var(--text-primary)', lineHeight: 1.8, margin: 0 }}>
            {displayContent}
          </p>
        </div>

        {/* Section 2: Important Precautions & Action Guide */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
          {/* Card: Safe Practice */}
          <div className="med-card" style={{ padding: '24px', borderLeft: '4px solid var(--primary-green)' }}>
            <div className="flex items-center gap-2" style={{ marginBottom: '10px' }}>
              <ShieldCheck size={18} color="var(--primary-green)" />
              <h4 style={{ fontSize: '15.5px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                Safe Medicine Practice
              </h4>
            </div>
            <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
              Always complete the full prescribed course of treatment. Store medicines in a cool, dry place away from direct sunlight, and verify proper dosage timings with your pharmacist.
            </p>
          </div>

          {/* Card: Red Flags */}
          {article.whenToSeekHelp && (
            <div className="med-card" style={{ padding: '24px', borderLeft: '4px solid #DC2626', backgroundColor: 'rgba(239, 68, 68, 0.03)' }}>
              <div className="flex items-center gap-2" style={{ marginBottom: '10px' }}>
                <AlertTriangle size={18} color="#DC2626" />
                <h4 style={{ fontSize: '15.5px', fontWeight: 800, color: '#DC2626', margin: 0 }}>
                  When to Seek Medical Attention
                </h4>
              </div>
              <p style={{ fontSize: '13.5px', color: 'var(--text-primary)', lineHeight: 1.6, margin: 0 }}>
                {article.whenToSeekHelp}
              </p>
            </div>
          )}
        </div>

        {/* Healthcare Educational Disclaimer Footer */}
        <div className="med-card" style={{ padding: '16px 20px', backgroundColor: 'var(--bg-app)', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <ShieldAlert size={20} color="var(--primary-green)" style={{ flexShrink: 0 }} />
          <span style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
            <strong>MediCare Educational Advisory:</strong> This clinical article is for patient educational purposes only. Always consult your prescribing physician or certified healthcare provider regarding specific medical conditions, diagnosis, or changes to treatment.
          </span>
        </div>
      </div>
    </AppLayout>
  );
};

export default ArticlePage;
