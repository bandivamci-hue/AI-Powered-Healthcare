import React, { useState, useEffect, useRef } from 'react';
import { Volume2, Play, Pause, Square, AlertCircle, RefreshCw } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

const speechLangMap = {
  English: 'en-IN',
  Hindi: 'hi-IN',
  Telugu: 'te-IN',
  Tamil: 'ta-IN',
  Kannada: 'kn-IN',
  Malayalam: 'ml-IN',
  Bengali: 'bn-IN',
  Marathi: 'mr-IN',
  Gujarati: 'gu-IN',
  Punjabi: 'pa-IN',
  Urdu: 'ur-IN'
};

const isoLangMap = {
  English: 'en',
  Hindi: 'hi',
  Telugu: 'te',
  Tamil: 'ta',
  Kannada: 'kn',
  Malayalam: 'ml',
  Bengali: 'bn',
  Marathi: 'mr',
  Gujarati: 'gu',
  Punjabi: 'pa',
  Urdu: 'ur'
};

const VoiceReader = ({ text = '', selectedLanguage = 'English', isTranslating = false }) => {
  const { addToast } = useToast();
  const [playbackStatus, setPlaybackStatus] = useState('stopped'); // 'stopped', 'playing', 'paused'
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [voiceNotice, setVoiceNotice] = useState('');

  const audioRef = useRef(null);
  const audioUrlRef = useRef(null);
  const ttsAbortControllerRef = useRef(null);
  const utteranceRef = useRef(null);
  const playbackRateRef = useRef(1.0);

  // Reset voice reader whenever selected language changes
  useEffect(() => {
    handleStop();
    setVoiceNotice('');
  }, [selectedLanguage]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      handleStop();
    };
  }, []);

  const handleSpeedChange = (speed) => {
    setPlaybackRate(speed);
    playbackRateRef.current = speed;
    if (audioRef.current) {
      try {
        audioRef.current.playbackRate = speed;
      } catch (e) {}
    }
  };

  const handleStop = () => {
    // 1. Abort active network requests
    if (ttsAbortControllerRef.current) {
      ttsAbortControllerRef.current.abort();
      ttsAbortControllerRef.current = null;
    }

    // 2. Revoke blob URLs
    if (audioUrlRef.current) {
      URL.revokeObjectURL(audioUrlRef.current);
      audioUrlRef.current = null;
    }

    // 3. Stop HTML5 audio playback
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current.removeAttribute('src');
      audioRef.current.load();
      audioRef.current = null;
    }

    // 4. Cancel Web Speech API
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    setPlaybackStatus('stopped');
  };

  const handlePlay = async () => {
    if (!text || !text.trim() || isTranslating) {
      addToast('Guidance text is currently translating. Please wait...', 'info');
      return;
    }

    // If currently paused, resume playback!
    if (playbackStatus === 'paused') {
      if ('speechSynthesis' in window && window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
        setPlaybackStatus('playing');
        return;
      }
      if (audioRef.current && audioRef.current.paused) {
        audioRef.current.play();
        setPlaybackStatus('playing');
        return;
      }
    }

    handleStop();

    const targetLangCode = speechLangMap[selectedLanguage] || 'en-IN';
    const isoCode = isoLangMap[selectedLanguage] || 'en';

    // Filter text so voice reader speaks ONLY medicine guidance (never document headers or filenames)
    const cleanGuidanceText = text.replace(/\[RAW_TEXT\][\s\S]*?\[MEDICINES\]/g, '').trim();

    // 1. Query Browser Web Speech API for matching native voice
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();

      const voices = window.speechSynthesis.getVoices();
      const matchingVoice = voices.find(v => 
        v.lang.toLowerCase() === targetLangCode.toLowerCase() || 
        v.lang.toLowerCase().startsWith(isoCode)
      );

      if (matchingVoice) {
        setVoiceNotice(`Using browser voice (${matchingVoice.name})`);
        const utterance = new SpeechSynthesisUtterance(cleanGuidanceText);
        utterance.lang = targetLangCode;
        utterance.voice = matchingVoice;
        utterance.rate = playbackRateRef.current;
        utteranceRef.current = utterance;

        utterance.onstart = () => setPlaybackStatus('playing');
        utterance.onend = () => setPlaybackStatus('stopped');
        utterance.onerror = () => fallbackServerTts(cleanGuidanceText, isoCode);

        window.speechSynthesis.speak(utterance);
        return;
      }
    }

    // 2. If native browser voice for Indian language is unavailable, use Server TTS
    setVoiceNotice(`${selectedLanguage} browser voice unavailable. Using server TTS engine.`);
    fallbackServerTts(cleanGuidanceText, isoCode);
  };

  const fallbackServerTts = async (cleanText, isoCode) => {
    const controller = new AbortController();
    ttsAbortControllerRef.current = controller;

    try {
      const proxyUrl = `http://127.0.0.1:8000/api/tts/?text=${encodeURIComponent(cleanText)}&lang=${isoCode}`;
      const response = await fetch(proxyUrl, { signal: controller.signal });

      if (!response.ok) throw new Error('TTS proxy endpoint unavailable');
      const audioBlob = await response.blob();
      if (!audioBlob.size) throw new Error('Empty audio response');

      if (audioUrlRef.current) {
        URL.revokeObjectURL(audioUrlRef.current);
      }

      const audioUrl = URL.createObjectURL(audioBlob);
      audioUrlRef.current = audioUrl;

      const audio = new Audio(audioUrl);
      audio.playbackRate = playbackRateRef.current;
      audioRef.current = audio;

      audio.onplay = () => setPlaybackStatus('playing');
      audio.onended = () => setPlaybackStatus('stopped');
      audio.onerror = () => setPlaybackStatus('stopped');

      await audio.play();
    } catch (err) {
      if (err?.name === 'AbortError') return;
      setPlaybackStatus('stopped');
      setVoiceNotice(`Voice playback unavailable for ${selectedLanguage} on this device.`);
    }
  };

  const handlePause = () => {
    if ('speechSynthesis' in window && window.speechSynthesis.speaking) {
      window.speechSynthesis.pause();
      setPlaybackStatus('paused');
    } else if (audioRef.current && !audioRef.current.paused) {
      audioRef.current.pause();
      setPlaybackStatus('paused');
    }
  };

  return (
    <div style={{
      backgroundColor: 'var(--bg-app)',
      borderRadius: 'var(--radius-lg)',
      padding: '18px 20px',
      border: '1px solid var(--border-subtle)',
      marginTop: '20px'
    }}>
      {/* Header & Status Indicator */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
        <div className="flex items-center gap-2">
          <Volume2 size={20} color="var(--primary-green)" />
          <h4 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
            Multilingual Voice Reader
          </h4>
          <span className="badge-status badge-extracted" style={{ fontSize: '11px', padding: '2px 8px' }}>
            {selectedLanguage}
          </span>
        </div>

        {/* Playback Speed Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: 'var(--bg-card)', padding: '3px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
          <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', padding: '0 4px' }}>Speed:</span>
          {[1.0, 1.5, 2.0].map((speed) => (
            <button
              key={speed}
              onClick={() => handleSpeedChange(speed)}
              style={{
                padding: '2px 7px',
                borderRadius: '5px',
                fontSize: '11px',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                backgroundColor: playbackRate === speed ? 'var(--primary-green)' : 'transparent',
                color: playbackRate === speed ? 'white' : 'var(--text-secondary)',
                transition: 'all 0.2s ease'
              }}
            >
              {speed}×
            </button>
          ))}
        </div>
      </div>

      {/* Voice Controls Row */}
      <div className="flex gap-2" style={{ marginBottom: voiceNotice ? '10px' : 0 }}>
        {playbackStatus !== 'playing' ? (
          <button
            onClick={handlePlay}
            disabled={isTranslating || !text}
            className="btn btn-primary"
            style={{ flex: 1, padding: '10px', fontSize: '13px', opacity: (isTranslating || !text) ? 0.6 : 1 }}
          >
            <Play size={16} /> {playbackStatus === 'paused' ? 'Resume' : `Play Guidance Audio (${playbackRate}×)`}
          </button>
        ) : (
          <button
            onClick={handlePause}
            className="btn btn-outline-green"
            style={{ flex: 1, padding: '10px', fontSize: '13px' }}
          >
            <Pause size={16} /> Pause
          </button>
        )}

        <button
          onClick={handleStop}
          disabled={playbackStatus === 'stopped'}
          className="btn btn-outline"
          style={{ padding: '10px 16px', fontSize: '13px', color: '#DC2626', borderColor: '#FCA5A5', opacity: playbackStatus === 'stopped' ? 0.5 : 1 }}
        >
          <Square size={16} /> Stop
        </button>
      </div>

      {/* Voice Engine Status Message */}
      {voiceNotice && (
        <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <AlertCircle size={13} color="var(--primary-green)" /> {voiceNotice}
        </div>
      )}
    </div>
  );
};

export default VoiceReader;
