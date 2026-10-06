import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  X, Globe, Clock, Volume2, Play, Pause, Square, 
  Loader2, ShieldAlert, CheckCircle2, AlertTriangle, Sparkles,
  BookOpen, ExternalLink, ArrowRight, Stethoscope, Heart
} from 'lucide-react';
import LoadingSpinner from '../common/LoadingSpinner';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

const ArticleReaderModal = ({ article, isOpen, onClose }) => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [isTranslating, setIsTranslating] = useState(false);
  const [translatedArticle, setTranslatedArticle] = useState(null);

  // Audio / Voice Reader State
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [voiceStatusMsg, setVoiceStatusMsg] = useState('');
  const [currentChunk, setCurrentChunk] = useState(0);
  const [totalChunks, setTotalChunks] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isCompletedAudio, setIsCompletedAudio] = useState(false);

  const audioRef = useRef(null);
  const timerRef = useRef(null);
  const chunksRef = useRef([]);
  const currentChunkIndexRef = useRef(0);
  const isPlayingRef = useRef(false);
  const isPausedRef = useRef(false);
  const currentSessionIdRef = useRef(0);
  const translationCacheRef = useRef({});
  const playbackRateRef = useRef(1.0);

  const handleSpeedChange = (speed) => {
    setPlaybackRate(speed);
    playbackRateRef.current = speed;
    if (audioRef.current) {
      try {
        audioRef.current.playbackRate = speed;
      } catch (e) {}
    }
  };

  // Reset when article changes or closes
  useEffect(() => {
    if (isOpen && article) {
      setSelectedLanguage('English');
      setTranslatedArticle(null);
      stopAudioPlayback();
      setIsCompletedAudio(false);
    } else {
      stopAudioPlayback();
    }
  }, [isOpen, article]);

  // Handle translation when language changes
  useEffect(() => {
    if (!isOpen || !article) return;

    stopAudioPlayback();
    setIsCompletedAudio(false);

    if (selectedLanguage === 'English') {
      setTranslatedArticle(null);
      setIsTranslating(false);
      return;
    }

    const cacheKey = `${selectedLanguage}__${article.id || article.title}`;
    if (translationCacheRef.current[cacheKey]) {
      setTranslatedArticle(translationCacheRef.current[cacheKey]);
      setIsTranslating(false);
      return;
    }

    setIsTranslating(true);

    api.post('/api/ai/translate-article/', {
      title: article.title,
      summary: article.snippet || article.intro || '',
      key_points: article.keyPoints || [],
      content: article.simpleExplanation || article.content || '',
      language: selectedLanguage
    }).then((res) => {
      if (res.data) {
        translationCacheRef.current[cacheKey] = res.data;
        setTranslatedArticle(res.data);
      }
    }).catch((err) => {
      console.warn('Translation notice:', err);
      addToast(`Unable to translate article to ${selectedLanguage}. Showing original English.`, 'warning');
    }).finally(() => {
      setIsTranslating(false);
    });
  }, [selectedLanguage, article, isOpen]);

  // Derived current content based on translation
  const currentTitle = translatedArticle?.title || article?.title || '';
  const currentSummary = translatedArticle?.summary || article?.snippet || article?.intro || '';
  const currentKeyPoints = translatedArticle?.key_points || article?.keyPoints || [];
  const currentContent = translatedArticle?.content || article?.simpleExplanation || article?.content || '';

  // Language mapping for speech engine
  const getLanguageCode = (lang) => {
    const maps = {
      'English': 'en-IN',
      'Hindi': 'hi-IN',
      'Telugu': 'te-IN',
      'Tamil': 'ta-IN',
      'Kannada': 'kn-IN',
      'Malayalam': 'ml-IN',
      'Bengali': 'bn-IN',
      'Marathi': 'mr-IN',
      'Gujarati': 'gu-IN',
      'Punjabi': 'pa-IN',
      'Urdu': 'ur-IN'
    };
    return maps[lang] || 'en-IN';
  };

  // Text chunking for uninterrupted full speech
  const prepareArticleSpeechChunks = () => {
    const textBlocks = [
      currentTitle,
      currentSummary,
      currentKeyPoints.length > 0 ? `Key summary points: ${currentKeyPoints.join('. ')}` : '',
      currentContent,
      article?.whenToSeekHelp ? `When to seek professional help: ${article.whenToSeekHelp}` : ''
    ].filter(Boolean).join('. ');

    let cleaned = textBlocks
      .replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '')
      .replace(/[*#_~`•]/g, ' ')
      .replace(/["{}]/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    if (!cleaned) return [];

    const sentenceDelimiters = /([.!?।\n]+[\s]*)/g;
    const rawTokens = cleaned.split(sentenceDelimiters);
    const sentences = [];

    for (let i = 0; i < rawTokens.length; i += 2) {
      const sText = (rawTokens[i] || '') + (rawTokens[i + 1] || '');
      if (sText.trim()) sentences.push(sText.trim());
    }

    if (sentences.length === 0) sentences.push(cleaned);

    const chunks = [];
    let curChunk = '';
    for (const s of sentences) {
      if ((curChunk + ' ' + s).trim().length <= 160) {
        curChunk = (curChunk + ' ' + s).trim();
      } else {
        if (curChunk) chunks.push(curChunk);
        curChunk = s;
      }
    }
    if (curChunk) chunks.push(curChunk);
    return chunks;
  };

  const startAudioTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
  };

  const stopAudioPlayback = () => {
    currentSessionIdRef.current++;
    isPlayingRef.current = false;
    isPausedRef.current = false;

    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    setIsPlaying(false);
    setIsPaused(false);
    setIsLoadingAudio(false);
    currentChunkIndexRef.current = 0;
    setCurrentChunk(0);
  };

  const speakChunkWithSpeechSynthesis = (sessionId, voice) => {
    if (sessionId !== currentSessionIdRef.current || !isPlayingRef.current) return;
    const chunks = chunksRef.current;
    const index = currentChunkIndexRef.current;

    if (index >= chunks.length) {
      stopAudioPlayback();
      setIsCompletedAudio(true);
      setVoiceStatusMsg('✓ Article audio reading completed.');
      return;
    }

    const chunkText = chunks[index];
    setCurrentChunk(index + 1);

    const utterance = new SpeechSynthesisUtterance(chunkText);
    if (voice) {
      utterance.voice = voice;
      utterance.lang = voice.lang;
    } else {
      utterance.lang = getLanguageCode(selectedLanguage);
    }
    utterance.rate = playbackRateRef.current;

    utterance.onstart = () => {
      if (sessionId !== currentSessionIdRef.current) return;
      setIsLoadingAudio(false);
      setIsPlaying(true);
      setIsPaused(false);
      setVoiceStatusMsg(`Reading article in ${selectedLanguage} (${playbackRateRef.current}× speed)...`);
    };

    utterance.onend = () => {
      if (sessionId !== currentSessionIdRef.current) return;
      if (isPlayingRef.current && !isPausedRef.current) {
        currentChunkIndexRef.current++;
        speakChunkWithSpeechSynthesis(sessionId, voice);
      }
    };

    utterance.onerror = () => {
      if (sessionId !== currentSessionIdRef.current) return;
      playChunkWithServerAudio(sessionId);
    };

    window.speechSynthesis.speak(utterance);
  };

  const playChunkWithServerAudio = (sessionId) => {
    if (sessionId !== currentSessionIdRef.current || !isPlayingRef.current) return;
    const chunks = chunksRef.current;
    const index = currentChunkIndexRef.current;

    if (index >= chunks.length) {
      stopAudioPlayback();
      setIsCompletedAudio(true);
      setVoiceStatusMsg('✓ Article audio reading completed.');
      return;
    }

    const chunkText = chunks[index];
    setCurrentChunk(index + 1);

    const targetLangCode = getLanguageCode(selectedLanguage).split('-')[0];
    const ttsUrl = `http://127.0.0.1:8000/api/tts/?text=${encodeURIComponent(chunkText)}&lang=${targetLangCode}`;

    if (audioRef.current) audioRef.current.pause();
    const audio = new Audio(ttsUrl);
    audio.playbackRate = playbackRateRef.current;
    audioRef.current = audio;

    audio.onplay = () => {
      if (sessionId !== currentSessionIdRef.current) return;
      setIsLoadingAudio(false);
      setIsPlaying(true);
      setIsPaused(false);
      setVoiceStatusMsg(`Reading article in ${selectedLanguage} (${playbackRateRef.current}× speed)...`);
    };

    audio.onended = () => {
      if (sessionId !== currentSessionIdRef.current) return;
      if (isPlayingRef.current && !isPausedRef.current) {
        currentChunkIndexRef.current++;
        playChunkWithServerAudio(sessionId);
      }
    };

    audio.onerror = () => {
      if (sessionId !== currentSessionIdRef.current) return;
      setIsLoadingAudio(false);
      currentChunkIndexRef.current++;
      if (currentChunkIndexRef.current < chunks.length) {
        playChunkWithServerAudio(sessionId);
      } else {
        stopAudioPlayback();
      }
    };

    audio.play().catch(() => {
      if (sessionId !== currentSessionIdRef.current) return;
      setIsLoadingAudio(false);
      stopAudioPlayback();
    });
  };

  const handlePlayPauseAudio = () => {
    if (isPlaying && !isPaused) {
      isPlayingRef.current = true;
      isPausedRef.current = true;
      setIsPaused(true);
      if (window.speechSynthesis && window.speechSynthesis.speaking) {
        window.speechSynthesis.pause();
      } else if (audioRef.current) {
        audioRef.current.pause();
      }
      if (timerRef.current) clearInterval(timerRef.current);
      setVoiceStatusMsg(`Paused`);
      return;
    }

    if (isPlaying && isPaused) {
      isPlayingRef.current = true;
      isPausedRef.current = false;
      setIsPaused(false);
      startAudioTimer();

      if (window.speechSynthesis && window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
        setVoiceStatusMsg(`Resumed reading in ${selectedLanguage}...`);
      } else if (audioRef.current) {
        audioRef.current.play();
        setVoiceStatusMsg(`Resumed reading in ${selectedLanguage}...`);
      } else {
        const sessionId = currentSessionIdRef.current;
        const targetLangCode = getLanguageCode(selectedLanguage);
        const voices = window.speechSynthesis ? window.speechSynthesis.getVoices() : [];
        const matchingVoice = voices.find(
          (v) => v.lang === targetLangCode || v.lang.startsWith(targetLangCode.split('-')[0])
        );
        if (matchingVoice) speakChunkWithSpeechSynthesis(sessionId, matchingVoice);
        else playChunkWithServerAudio(sessionId);
      }
      return;
    }

    // Start fresh playback
    const chunks = prepareArticleSpeechChunks();
    if (chunks.length === 0) {
      addToast('No article text available to read.', 'warning');
      return;
    }

    chunksRef.current = chunks;
    setTotalChunks(chunks.length);
    currentChunkIndexRef.current = 0;
    setCurrentChunk(1);
    setElapsedSeconds(0);
    setIsCompletedAudio(false);

    const sessionId = ++currentSessionIdRef.current;
    isPlayingRef.current = true;
    isPausedRef.current = false;
    setIsLoadingAudio(true);
    startAudioTimer();

    const targetLangCode = getLanguageCode(selectedLanguage);

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const startSpeech = () => {
        const voices = window.speechSynthesis.getVoices();
        const matchingVoice = voices.find(
          (v) => v.lang === targetLangCode || v.lang.startsWith(targetLangCode.split('-')[0])
        );
        if (matchingVoice) speakChunkWithSpeechSynthesis(sessionId, matchingVoice);
        else playChunkWithServerAudio(sessionId);
      };

      if (window.speechSynthesis.getVoices().length > 0) {
        startSpeech();
      } else {
        window.speechSynthesis.onvoiceschanged = startSpeech;
        setTimeout(startSpeech, 250);
      }
    } else {
      playChunkWithServerAudio(sessionId);
    }
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (!isOpen || !article) return null;

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.7)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2500,
        padding: '20px'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        className="med-card" 
        style={{
          width: '100%',
          maxWidth: '860px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          padding: '0',
          overflow: 'hidden',
          borderRadius: '24px',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.3)',
          border: '1.5px solid var(--border-subtle)',
          backgroundColor: 'var(--bg-card)'
        }}
      >
        {/* Top Header Bar */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '18px 24px',
          borderBottom: '1px solid var(--border-subtle)',
          backgroundColor: 'var(--bg-card)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span 
              className="badge-status" 
              style={{
                backgroundColor: `${article.color || 'var(--primary-green)'}18`,
                color: article.color || 'var(--primary-green)',
                fontWeight: 800,
                fontSize: '12px',
                padding: '4px 12px',
                borderRadius: '20px',
                textTransform: 'uppercase',
                letterSpacing: '0.4px'
              }}
            >
              {article.category}
            </span>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <Clock size={13} /> {article.readTime}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* Language Selector Dropdown */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: 'var(--bg-app)', padding: '3px 8px', borderRadius: '16px', border: '1px solid var(--border-subtle)' }}>
              <Globe size={14} color="var(--primary-green)" />
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                disabled={isTranslating}
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

            {/* Close Button */}
            <button 
              onClick={onClose}
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                backgroundColor: 'var(--bg-app)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-secondary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              title="Close reader"
            >
              <X size={17} />
            </button>
          </div>
        </div>

        {/* Audio Player Toolbar */}
        <div style={{
          padding: '10px 24px',
          backgroundColor: 'var(--light-mint)',
          borderBottom: '1px solid var(--mint-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '10px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={handlePlayPauseAudio}
              disabled={isLoadingAudio || isTranslating}
              style={{
                padding: '6px 14px',
                fontSize: '12px',
                fontWeight: 800,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                borderRadius: '12px',
                backgroundColor: isPlaying && !isPaused ? '#EF4444' : 'var(--primary-green)',
                color: 'white',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              {isLoadingAudio ? (
                <LoadingSpinner size={14} color="white" />
              ) : isPlaying && !isPaused ? (
                <Pause size={14} />
              ) : (
                <Play size={14} />
              )}
              <span>
                {isLoadingAudio 
                  ? 'Preparing Audio...' 
                  : isPlaying && !isPaused 
                  ? 'Pause Audio' 
                  : isPaused 
                  ? 'Resume' 
                  : isCompletedAudio 
                  ? `Listen Again (${selectedLanguage})` 
                  : `Listen in ${selectedLanguage}`}
              </span>
            </button>

            {isPlaying && (
              <button
                onClick={stopAudioPlayback}
                style={{
                  padding: '6px 10px',
                  fontSize: '11.5px',
                  fontWeight: 700,
                  color: '#DC2626',
                  backgroundColor: 'white',
                  border: '1px solid #FCA5A5',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <Square size={11} fill="#DC2626" />
                <span>Stop</span>
              </button>
            )}

            {/* Speed Pills */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '2px', backgroundColor: 'white', padding: '2px 4px', borderRadius: '8px', border: '1px solid var(--mint-border)' }}>
              <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)', padding: '0 4px' }}>Speed:</span>
              {[1.0, 1.5, 2.0].map((speed) => (
                <button
                  key={speed}
                  onClick={() => handleSpeedChange(speed)}
                  style={{
                    padding: '2px 6px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: 700,
                    border: 'none',
                    cursor: 'pointer',
                    backgroundColor: playbackRate === speed ? 'var(--primary-green)' : 'transparent',
                    color: playbackRate === speed ? 'white' : 'var(--text-secondary)'
                  }}
                >
                  {speed}×
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11.5px', color: 'var(--dark-green)', fontWeight: 700 }}>
            {isPlaying ? (
              <span>{formatTime(elapsedSeconds)} elapsed ({playbackRate}×)</span>
            ) : isCompletedAudio ? (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <CheckCircle2 size={13} /> Completed
              </span>
            ) : (
              <span>Voice Ready</span>
            )}
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '2px', height: '12px' }}>
              <span style={{ width: '3px', height: isPlaying && !isPaused ? '12px' : '4px', backgroundColor: 'var(--primary-green)', borderRadius: '2px' }}></span>
              <span style={{ width: '3px', height: isPlaying && !isPaused ? '8px' : '4px', backgroundColor: 'var(--primary-green)', borderRadius: '2px' }}></span>
              <span style={{ width: '3px', height: isPlaying && !isPaused ? '12px' : '4px', backgroundColor: 'var(--primary-green)', borderRadius: '2px' }}></span>
            </div>
          </div>
        </div>

        {/* Scrollable Article Body */}
        <div style={{
          padding: '28px 32px',
          overflowY: 'auto',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: '22px'
        }}>
          {isTranslating ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 0', gap: '14px', color: 'var(--primary-green)' }}>
              <LoadingSpinner size={34} color="var(--primary-green)" strokeWidth={3} />
              <p style={{ fontSize: '15px', fontWeight: 700 }}>Translating article into {selectedLanguage}...</p>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Preserving medical accuracy and clinical definitions</span>
            </div>
          ) : (
            <>
              {/* Title & Short Summary */}
              <div>
                <h1 style={{
                  fontSize: '24px',
                  fontWeight: 900,
                  color: 'var(--text-primary)',
                  lineHeight: '1.3',
                  marginBottom: '10px'
                }}>
                  {currentTitle}
                </h1>
                <p style={{
                  fontSize: '15px',
                  color: 'var(--text-secondary)',
                  lineHeight: '1.6',
                  margin: 0,
                  fontStyle: 'italic',
                  borderLeft: '4px solid var(--primary-green)',
                  paddingLeft: '14px'
                }}>
                  {currentSummary}
                </p>
              </div>

              {/* Key Summary Takeaways Card */}
              {currentKeyPoints && currentKeyPoints.length > 0 && (
                <div style={{
                  backgroundColor: 'var(--light-mint)',
                  border: '1.5px solid var(--mint-border)',
                  padding: '20px 24px',
                  borderRadius: '16px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                    <Sparkles size={18} color="var(--primary-green)" />
                    <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--dark-green)', margin: 0 }}>
                      Key Summary Takeaways
                    </h3>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {currentKeyPoints.map((pt, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--primary-green)', marginTop: '8px', flexShrink: 0 }} />
                        <span style={{ fontSize: '13.5px', color: 'var(--text-primary)', lineHeight: '1.6', fontWeight: 500 }}>
                          {pt}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Detailed Health Guidance */}
              <div style={{ backgroundColor: 'var(--bg-app)', padding: '20px 24px', borderRadius: '16px', border: '1px solid var(--border-subtle)' }}>
                <div className="flex items-center gap-2" style={{ marginBottom: '12px' }}>
                  <BookOpen size={18} color="var(--primary-green)" />
                  <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                    Detailed Health Guidance
                  </h3>
                </div>
                <p style={{ fontSize: '14px', color: 'var(--text-primary)', lineHeight: '1.8', margin: 0, whiteSpace: 'pre-line' }}>
                  {currentContent}
                </p>
              </div>

              {/* When to Seek Professional Help */}
              {article.whenToSeekHelp && (
                <div style={{
                  backgroundColor: 'rgba(239, 68, 68, 0.06)',
                  border: '1.5px solid rgba(239, 68, 68, 0.25)',
                  padding: '18px 22px',
                  borderRadius: '16px'
                }}>
                  <div className="flex items-center gap-2" style={{ marginBottom: '8px' }}>
                    <AlertTriangle size={17} color="#DC2626" />
                    <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#DC2626', margin: 0 }}>
                      When to Seek Professional Medical Care
                    </h4>
                  </div>
                  <p style={{ fontSize: '13px', color: 'var(--text-primary)', lineHeight: '1.6', margin: 0 }}>
                    {article.whenToSeekHelp}
                  </p>
                </div>
              )}

              {/* Educational Disclaimer */}
              <div style={{
                padding: '12px 16px',
                backgroundColor: 'var(--bg-app)',
                borderRadius: '12px',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                fontSize: '11.5px',
                color: 'var(--text-muted)',
                lineHeight: '1.5'
              }}>
                <ShieldAlert size={16} color="var(--primary-green)" style={{ flexShrink: 0 }} />
                <span>
                  <strong>Educational Note:</strong> AI-generated medical education. Always consult your prescribing doctor regarding diagnosis, dosage, or health questions.
                </span>
              </div>
            </>
          )}
        </div>

        {/* Modal Bottom Footer */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '14px 24px',
          borderTop: '1px solid var(--border-subtle)',
          backgroundColor: 'var(--bg-card)'
        }}>
          <button
            onClick={() => {
              onClose();
              navigate(`/health-education/${article.id}`);
            }}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--primary-green)',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px'
            }}
          >
            Open Full Article Page <ArrowRight size={14} />
          </button>

          <button 
            onClick={onClose}
            className="btn btn-primary"
            style={{ padding: '8px 22px', fontSize: '13px', borderRadius: '10px' }}
          >
            Close Reader
          </button>
        </div>
      </div>
    </div>
  );
};

export default ArticleReaderModal;
