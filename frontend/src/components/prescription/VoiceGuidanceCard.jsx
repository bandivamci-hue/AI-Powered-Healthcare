import React, { useState, useEffect, useRef } from 'react';
import { Volume2, Play, Pause, Square, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

const VoiceGuidanceCard = ({ text = '', guidanceText = '', selectedLanguage = 'English' }) => {
  const { addToast } = useToast();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1.0); // 1.0, 1.5, 2.0
  const [voiceStatusMsg, setVoiceStatusMsg] = useState('');
  const [currentChunk, setCurrentChunk] = useState(0);
  const [totalChunks, setTotalChunks] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  const audioRef = useRef(null);
  const timerRef = useRef(null);
  const chunksRef = useRef([]);
  const currentChunkIndexRef = useRef(0);
  const isPlayingRef = useRef(false);
  const isPausedRef = useRef(false);
  const currentSessionIdRef = useRef(0);
  const playbackRateRef = useRef(1.0);

  const activeText = text || guidanceText || '';

  // Clean text and split into natural spoken chunks without length loss
  const prepareSpeechChunks = (inputText) => {
    if (!inputText || !inputText.trim()) return [];

    let cleaned = inputText
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
      const sentenceText = (rawTokens[i] || '') + (rawTokens[i + 1] || '');
      if (sentenceText.trim()) {
        sentences.push(sentenceText.trim());
      }
    }

    if (sentences.length === 0) {
      sentences.push(cleaned);
    }

    const chunks = [];
    let currentChunkText = '';

    for (const sent of sentences) {
      if ((currentChunkText + ' ' + sent).trim().length <= 160) {
        currentChunkText = (currentChunkText + ' ' + sent).trim();
      } else {
        if (currentChunkText) {
          chunks.push(currentChunkText);
        }
        if (sent.length > 160) {
          const words = sent.split(' ');
          let tempWordChunk = '';
          for (const w of words) {
            if ((tempWordChunk + ' ' + w).trim().length <= 150) {
              tempWordChunk = (tempWordChunk + ' ' + w).trim();
            } else {
              if (tempWordChunk) chunks.push(tempWordChunk);
              tempWordChunk = w;
            }
          }
          if (tempWordChunk) currentChunkText = tempWordChunk;
          else currentChunkText = '';
        } else {
          currentChunkText = sent;
        }
      }
    }

    if (currentChunkText) {
      chunks.push(currentChunkText);
    }

    return chunks;
  };

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

  useEffect(() => {
    stopPlayback();
    setIsCompleted(false);
  }, [selectedLanguage, activeText]);

  const handleSpeedChange = (speed) => {
    setPlaybackRate(speed);
    playbackRateRef.current = speed;
    if (audioRef.current) {
      try {
        audioRef.current.playbackRate = speed;
      } catch (e) {}
    }
  };

  const startTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
  };

  const stopPlayback = () => {
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
    setIsLoading(false);
    currentChunkIndexRef.current = 0;
    setCurrentChunk(0);
  };

  const speakChunkWithSpeechSynthesis = (sessionId, voice) => {
    if (sessionId !== currentSessionIdRef.current || !isPlayingRef.current) return;

    const chunks = chunksRef.current;
    const index = currentChunkIndexRef.current;

    if (index >= chunks.length) {
      stopPlayback();
      setIsCompleted(true);
      setVoiceStatusMsg('✓ Complete guidance reading finished.');
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
      setIsLoading(false);
      setIsPlaying(true);
      setIsPaused(false);
      setVoiceStatusMsg(`Reading in ${selectedLanguage} (${playbackRateRef.current}× speed, Part ${index + 1} of ${chunks.length})...`);
    };

    utterance.onend = () => {
      if (sessionId !== currentSessionIdRef.current) return;
      if (isPlayingRef.current && !isPausedRef.current) {
        currentChunkIndexRef.current++;
        speakChunkWithSpeechSynthesis(sessionId, voice);
      }
    };

    utterance.onerror = (e) => {
      console.warn('[SpeechSynthesis Notice] Utterance fallback:', e);
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
      stopPlayback();
      setIsCompleted(true);
      setVoiceStatusMsg('✓ Complete guidance reading finished.');
      return;
    }

    const chunkText = chunks[index];
    setCurrentChunk(index + 1);

    const targetLangCode = getLanguageCode(selectedLanguage).split('-')[0];
    const ttsUrl = `http://127.0.0.1:8000/api/tts/?text=${encodeURIComponent(chunkText)}&lang=${targetLangCode}`;

    if (audioRef.current) {
      audioRef.current.pause();
    }

    const audio = new Audio(ttsUrl);
    audio.playbackRate = playbackRateRef.current;
    audioRef.current = audio;

    audio.onplay = () => {
      if (sessionId !== currentSessionIdRef.current) return;
      setIsLoading(false);
      setIsPlaying(true);
      setIsPaused(false);
      setVoiceStatusMsg(`Reading in ${selectedLanguage} (${playbackRateRef.current}× speed, Part ${index + 1} of ${chunks.length})...`);
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
      setIsLoading(false);
      currentChunkIndexRef.current++;
      if (currentChunkIndexRef.current < chunks.length) {
        playChunkWithServerAudio(sessionId);
      } else {
        stopPlayback();
      }
    };

    audio.play().catch(() => {
      if (sessionId !== currentSessionIdRef.current) return;
      setIsLoading(false);
      stopPlayback();
    });
  };

  const handlePlayPause = () => {
    // 1. Pause
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
      setVoiceStatusMsg(`Paused (Part ${currentChunk} of ${totalChunks})`);
      return;
    }

    // 2. Resume
    if (isPlaying && isPaused) {
      isPlayingRef.current = true;
      isPausedRef.current = false;
      setIsPaused(false);
      startTimer();

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
        if (matchingVoice) {
          speakChunkWithSpeechSynthesis(sessionId, matchingVoice);
        } else {
          playChunkWithServerAudio(sessionId);
        }
      }
      return;
    }

    // 3. Start Fresh Playback from Beginning
    if (!activeText.trim()) {
      addToast('No prescription guidance text available to read.', 'warning');
      return;
    }

    const chunks = prepareSpeechChunks(activeText);
    if (chunks.length === 0) {
      addToast('No text available to read.', 'warning');
      return;
    }

    chunksRef.current = chunks;
    setTotalChunks(chunks.length);
    currentChunkIndexRef.current = 0;
    setCurrentChunk(1);
    setElapsedSeconds(0);
    setIsCompleted(false);

    const sessionId = ++currentSessionIdRef.current;
    isPlayingRef.current = true;
    isPausedRef.current = false;
    setIsLoading(true);
    startTimer();

    const targetLangCode = getLanguageCode(selectedLanguage);

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();

      const startSpeech = () => {
        const voices = window.speechSynthesis.getVoices();
        const matchingVoice = voices.find(
          (v) => v.lang === targetLangCode || v.lang.startsWith(targetLangCode.split('-')[0])
        );

        if (matchingVoice) {
          speakChunkWithSpeechSynthesis(sessionId, matchingVoice);
        } else {
          playChunkWithServerAudio(sessionId);
        }
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

  return (
    <div className="med-card" style={{ padding: '20px', border: '1.5px solid var(--mint-border)', display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <div className="flex items-center gap-2" style={{ marginBottom: '2px' }}>
            <Volume2 size={18} color="var(--primary-green)" />
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              Voice Guidance
            </h3>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>
            Listen to complete prescription instructions without truncation.
          </p>
        </div>

        {/* Playback Speed Controls (1x, 1.5x, 2x) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: 'var(--bg-app)', padding: '3px', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
          <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', padding: '0 4px' }}>Speed:</span>
          {[1.0, 1.5, 2.0].map((speed) => (
            <button
              key={speed}
              onClick={() => handleSpeedChange(speed)}
              style={{
                padding: '3px 8px',
                borderRadius: '6px',
                fontSize: '11.5px',
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

      {/* Audio Control Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: 'var(--light-mint)',
        padding: '12px 16px',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--mint-border)',
        flexWrap: 'wrap',
        gap: '10px'
      }}>
        {/* Play/Pause/Stop Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={handlePlayPause}
            disabled={isLoading || !activeText.trim()}
            className="btn btn-outline-green"
            style={{
              padding: '6px 16px',
              fontSize: '12px',
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--bg-card)',
              borderColor: 'var(--primary-green)',
              color: 'var(--primary-green)',
              cursor: (!activeText.trim() || isLoading) ? 'not-allowed' : 'pointer'
            }}
          >
            {isLoading ? (
              <Loader2 className="animate-spin" size={15} />
            ) : isPlaying && !isPaused ? (
              <Pause size={15} />
            ) : (
              <Play size={15} />
            )}
            <span>
              {isLoading
                ? 'Preparing audio...'
                : isPlaying && !isPaused
                ? 'Pause'
                : isPaused
                ? 'Resume'
                : isCompleted
                ? `Listen Again (${selectedLanguage})`
                : `Listen in ${selectedLanguage}`}
            </span>
          </button>

          {isPlaying && (
            <button
              onClick={stopPlayback}
              className="btn btn-outline"
              style={{
                padding: '6px 12px',
                fontSize: '12px',
                fontWeight: 600,
                color: '#EF4444',
                borderColor: '#FCA5A5',
                backgroundColor: 'var(--bg-card)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <Square size={12} fill="#EF4444" />
              <span>Stop</span>
            </button>
          )}
        </div>

        {/* Dynamic Timeline & Progress Indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12px', color: 'var(--primary-green)', fontWeight: 700 }}>
          {isPlaying ? (
            <span>
              {formatTime(elapsedSeconds)} elapsed • Part {currentChunk}/{totalChunks} ({playbackRate}×)
            </span>
          ) : isCompleted ? (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'var(--primary-green)' }}>
              <CheckCircle2 size={14} /> Full guidance read ({formatTime(elapsedSeconds)})
            </span>
          ) : (
            <span>Ready ({totalChunks || prepareSpeechChunks(activeText).length} parts)</span>
          )}

          {/* Equalizer animation bars */}
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '3px', height: '14px' }}>
            <span style={{ width: '3px', height: isPlaying && !isPaused ? '14px' : '4px', backgroundColor: 'var(--primary-green)', borderRadius: '2px', transition: 'height 0.2s ease' }}></span>
            <span style={{ width: '3px', height: isPlaying && !isPaused ? '8px' : '4px', backgroundColor: 'var(--primary-green)', borderRadius: '2px', transition: 'height 0.2s ease' }}></span>
            <span style={{ width: '3px', height: isPlaying && !isPaused ? '14px' : '4px', backgroundColor: 'var(--primary-green)', borderRadius: '2px', transition: 'height 0.2s ease' }}></span>
            <span style={{ width: '3px', height: isPlaying && !isPaused ? '8px' : '4px', backgroundColor: 'var(--primary-green)', borderRadius: '2px', transition: 'height 0.2s ease' }}></span>
          </div>
        </div>
      </div>

      {/* Subtext Voice Status */}
      {voiceStatusMsg && (
        <div style={{ fontSize: '11px', color: isCompleted ? 'var(--dark-green)' : 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
          {isCompleted ? <CheckCircle2 size={13} color="var(--primary-green)" /> : <AlertCircle size={13} color="var(--primary-green)" />}
          <span>{voiceStatusMsg}</span>
        </div>
      )}
    </div>
  );
};

export default VoiceGuidanceCard;
