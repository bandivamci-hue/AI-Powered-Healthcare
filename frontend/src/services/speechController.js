// Centralized Global Speech Controller for MediCare
// Guarantees: Exactly ONE active voice at any time, zero overlapping utterances,
// messageId-based idempotency against React re-renders, full multi-paragraph speech without truncation,
// and dynamic playback speed controls (1x, 1.5x, 2x).

const LANGUAGE_CONFIG = {
  'English': { code: 'en', bcp47: 'en-US' },
  'Hindi': { code: 'hi', bcp47: 'hi-IN' },
  'Telugu': { code: 'te', bcp47: 'te-IN' },
  'Tamil': { code: 'ta', bcp47: 'ta-IN' },
  'Kannada': { code: 'kn', bcp47: 'kn-IN' },
  'Malayalam': { code: 'ml', bcp47: 'ml-IN' },
  'Bengali': { code: 'bn', bcp47: 'bn-IN' },
  'Marathi': { code: 'mr', bcp47: 'mr-IN' },
  'Gujarati': { code: 'gu', bcp47: 'gu-IN' },
  'Punjabi': { code: 'pa', bcp47: 'pa-IN' },
  'Odia': { code: 'or', bcp47: 'or-IN' }
};

class SpeechController {
  constructor() {
    this.activeMessageId = null;
    this.spokenMessageIds = new Set();
    this.isCancelled = false;
    this.isPlaying = false;
    this.playbackRate = 1.0; // Default speed 1x (supports 1.0, 1.5, 2.0)
    this.currentAudioElement = null;
    this.onStateChangeCallbacks = new Set();
  }

  subscribe(callback) {
    this.onStateChangeCallbacks.add(callback);
    return () => this.onStateChangeCallbacks.delete(callback);
  }

  _notify(isPlaying, messageId = this.activeMessageId) {
    this.isPlaying = isPlaying;
    this.onStateChangeCallbacks.forEach((cb) => {
      try {
        cb({ isPlaying, messageId, playbackRate: this.playbackRate });
      } catch (e) {
        console.error('SpeechController state callback error:', e);
      }
    });
  }

  setPlaybackRate(rate) {
    const numRate = parseFloat(rate) || 1.0;
    this.playbackRate = Math.min(Math.max(numRate, 0.5), 2.5);
    if (this.currentAudioElement) {
      try {
        this.currentAudioElement.playbackRate = this.playbackRate;
      } catch (e) {}
    }
    this._notify(this.isPlaying, this.activeMessageId);
  }

  getPlaybackRate() {
    return this.playbackRate;
  }

  // Prepares plain text for voice synthesis without changing the visible UI markdown
  cleanTextForSpeech(text) {
    if (!text) return '';
    return text
      // Remove code blocks
      .replace(/```[\s\S]*?```/g, '')
      // Remove inline code
      .replace(/`([^`]+)`/g, '$1')
      // Remove markdown bold / italic
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      .replace(/\*([^*]+)\*/g, '$1')
      .replace(/__([^_]+)__/g, '$1')
      .replace(/_([^_]+)_/g, '$1')
      // Remove markdown headers
      .replace(/^#{1,6}\s+/gm, '')
      // Remove markdown lists and bullets
      .replace(/^\s*[-*+]\s+/gm, '')
      .replace(/^\s*\d+\.\s+/gm, '')
      // Remove blockquotes
      .replace(/^>\s+/gm, '')
      // Remove URLs
      .replace(/https?:\/\/\S+/g, '')
      // Normalize whitespace and newlines
      .replace(/\n{2,}/g, '. ')
      .replace(/\n/g, ' ')
      .replace(/\s{2,}/g, ' ')
      .trim();
  }

  // Splits multi-paragraph text into natural sentence chunks for reliable sequential speech delivery
  _splitIntoChunks(text, maxChunkLength = 160) {
    const sentences = text.match(/[^.!?।]+[.!?।]+|[^.!?।]+$/g) || [text];
    const chunks = [];
    let currentChunk = '';

    for (const sentence of sentences) {
      const trimmed = sentence.trim();
      if (!trimmed) continue;

      if ((currentChunk + ' ' + trimmed).length <= maxChunkLength) {
        currentChunk = currentChunk ? `${currentChunk} ${trimmed}` : trimmed;
      } else {
        if (currentChunk) chunks.push(currentChunk);
        if (trimmed.length > maxChunkLength) {
          // Break overly long sentence by commas or words
          const words = trimmed.split(' ');
          let subChunk = '';
          for (const word of words) {
            if ((subChunk + ' ' + word).length <= maxChunkLength) {
              subChunk = subChunk ? `${subChunk} ${word}` : word;
            } else {
              if (subChunk) chunks.push(subChunk);
              subChunk = word;
            }
          }
          if (subChunk) currentChunk = subChunk;
          else currentChunk = '';
        } else {
          currentChunk = trimmed;
        }
      }
    }
    if (currentChunk) chunks.push(currentChunk);
    return chunks.length > 0 ? chunks : [text];
  }

  stop() {
    this.isCancelled = true;
    this.activeMessageId = null;

    if (this.currentAudioElement) {
      try {
        this.currentAudioElement.pause();
        this.currentAudioElement.src = '';
      } catch (e) {}
      this.currentAudioElement = null;
    }

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch (e) {}
    }

    this._notify(false, null);
  }

  pause() {
    if (this.currentAudioElement) {
      this.currentAudioElement.pause();
    } else if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.pause();
    }
    this._notify(false);
  }

  resume() {
    if (this.currentAudioElement) {
      this.currentAudioElement.play();
      this._notify(true);
    } else if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.resume();
      this._notify(true);
    }
  }

  isSpeaking() {
    return this.isPlaying;
  }

  // Idempotent Speak entrypoint: guarantees only ONE voice session
  speak(text, language = 'English', messageId = null, onEnd = null) {
    if (!text || !text.trim()) return;

    // Idempotency check: if already spoken for this messageId, ignore duplicate triggers
    if (messageId && this.spokenMessageIds.has(messageId) && this.activeMessageId === messageId) {
      return;
    }

    // Cancel any previous speech session immediately
    this.stop();

    this.isCancelled = false;
    this.activeMessageId = messageId || `msg-${Date.now()}`;
    if (messageId) {
      this.spokenMessageIds.add(messageId);
    }

    const cleanText = this.cleanTextForSpeech(text);
    if (!cleanText) return;

    const langInfo = LANGUAGE_CONFIG[language] || { code: 'en', bcp47: 'en-US' };
    const chunks = this._splitIntoChunks(cleanText);

    this._notify(true, this.activeMessageId);

    // Try high quality vernacular backend Google TTS first if non-English or regional
    const useBackendTTS = ['te', 'hi', 'ta', 'kn', 'ml', 'bn', 'mr', 'gu'].includes(langInfo.code);

    if (useBackendTTS) {
      this._playBackendTTS(chunks, langInfo.code, onEnd);
    } else {
      this._playBrowserTTS(chunks, langInfo.bcp47, onEnd);
    }
  }

  _playBackendTTS(chunks, langCode, onEnd) {
    let chunkIndex = 0;

    const playNext = () => {
      if (this.isCancelled || chunkIndex >= chunks.length) {
        this._notify(false, null);
        if (!this.isCancelled && onEnd) onEnd();
        return;
      }

      const chunk = chunks[chunkIndex];
      chunkIndex++;

      try {
        const encoded = encodeURIComponent(chunk.slice(0, 195));
        const audioUrl = `http://127.0.0.1:8000/api/tts/?lang=${langCode}&text=${encoded}`;
        const audio = new Audio(audioUrl);
        audio.playbackRate = this.playbackRate;
        this.currentAudioElement = audio;

        audio.onended = () => {
          if (!this.isCancelled) {
            playNext();
          }
        };

        audio.onerror = () => {
          // Fallback to browser SpeechSynthesis for remaining chunks
          const bcp47 = langCode === 'te' ? 'te-IN' : langCode === 'hi' ? 'hi-IN' : langCode === 'ta' ? 'ta-IN' : 'en-US';
          this._playBrowserTTS(chunks.slice(chunkIndex - 1), bcp47, onEnd);
        };

        audio.play().catch(() => {
          const bcp47 = langCode === 'te' ? 'te-IN' : langCode === 'hi' ? 'hi-IN' : langCode === 'ta' ? 'ta-IN' : 'en-US';
          this._playBrowserTTS(chunks.slice(chunkIndex - 1), bcp47, onEnd);
        });
      } catch (err) {
        const bcp47 = langCode === 'te' ? 'te-IN' : langCode === 'hi' ? 'hi-IN' : langCode === 'ta' ? 'ta-IN' : 'en-US';
        this._playBrowserTTS(chunks.slice(chunkIndex - 1), bcp47, onEnd);
      }
    };

    playNext();
  }

  _playBrowserTTS(chunks, bcp47, onEnd) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      this._notify(false, null);
      if (onEnd) onEnd();
      return;
    }

    let chunkIndex = 0;

    const playNext = () => {
      if (this.isCancelled || chunkIndex >= chunks.length) {
        this._notify(false, null);
        if (!this.isCancelled && onEnd) onEnd();
        return;
      }

      const chunk = chunks[chunkIndex];
      chunkIndex++;

      const utterance = new SpeechSynthesisUtterance(chunk);
      utterance.lang = bcp47;
      utterance.rate = this.playbackRate;

      // Select matching voice if available
      const voices = window.speechSynthesis.getVoices();
      const match = voices.find(v => v.lang === bcp47 || v.lang.startsWith(bcp47.slice(0, 2)));
      if (match) {
        utterance.voice = match;
      }

      utterance.onend = () => {
        if (!this.isCancelled) {
          playNext();
        }
      };

      utterance.onerror = (e) => {
        console.warn('SpeechSynthesis utterance notice:', e);
        if (!this.isCancelled) {
          playNext();
        }
      };

      window.speechSynthesis.speak(utterance);
    };

    playNext();
  }
}

export const speechController = new SpeechController();
export default speechController;
