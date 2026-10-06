import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  Send, 
  Mic, 
  Volume2, 
  Globe, 
  ShieldCheck, 
  User, 
  VolumeX,
  Loader2,
  AlertCircle,
  X,
  Minimize2,
  Maximize2,
  Sparkles,
  MessageSquare
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { streamAiChat } from '../../services/aiChatService';
import { speechController } from '../../services/speechController';
import LoadingSpinner from '../common/LoadingSpinner';
import MarkdownContent from '../ui/MarkdownContent';

const LANGUAGE_CODES = {
  'English': 'en-US',
  'Hindi': 'hi-IN',
  'Telugu': 'te-IN',
  'Tamil': 'ta-IN',
  'Kannada': 'kn-IN',
  'Malayalam': 'ml-IN',
  'Bengali': 'bn-IN',
  'Marathi': 'mr-IN',
  'Gujarati': 'gu-IN',
  'Punjabi': 'pa-IN',
  'Odia': 'or-IN'
};

const FloatingAiChatbot = () => {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 'welcome-msg',
      sender: 'ai',
      text: 'Hello! I am your MediCare AI Assistant. How can I assist you with your health, medications, or doctor prescriptions today?',
      time: '09:00 AM',
      isStreaming: false
    }
  ]);
  const [input, setInput] = useState('');
  const [language, setLanguage] = useState(user?.preferredLanguage || 'English');
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);

  const messagesContainerRef = useRef(null);
  const recognitionRef = useRef(null);
  const abortControllerRef = useRef(null);
  const userScrolledUpRef = useRef(false);

  const samplePrompts = [
    'What is Paracetamol used for?',
    'What does PRN mean?',
    'Tips for lowering blood pressure',
    'How to store antibiotics?'
  ];

  useEffect(() => {
    if (user?.preferredLanguage) {
      setLanguage(user.preferredLanguage);
    }
  }, [user?.preferredLanguage]);

  useEffect(() => {
    const unsubscribe = speechController.subscribe(({ isPlaying }) => {
      setIsSpeaking(isPlaying);
    });
    return () => {
      unsubscribe();
    };
  }, []);

  const handleScroll = () => {
    if (!messagesContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 80;
    userScrolledUpRef.current = !isNearBottom;
  };

  useEffect(() => {
    if (!userScrolledUpRef.current && messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleStopVoice = () => {
    speechController.stop();
  };

  const handleSpeedChange = (speed) => {
    setPlaybackSpeed(speed);
    speechController.setPlaybackRate(speed);
  };

  const handleSend = async (textToSend) => {
    const query = (textToSend || input).trim();
    if (!query || isLoading) return;

    speechController.stop();
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const userMsgId = `user-${Date.now()}`;
    const assistantMsgId = `ai-${Date.now() + 1}`;
    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const userMsg = {
      id: userMsgId,
      sender: 'user',
      text: query,
      time: currentTime
    };

    const assistantMsg = {
      id: assistantMsgId,
      sender: 'ai',
      text: '',
      time: currentTime,
      isStreaming: true
    };

    setMessages((prev) => [...prev, userMsg, assistantMsg]);
    if (!textToSend) setInput('');
    setIsLoading(true);
    userScrolledUpRef.current = false;

    const historyPayload = messages
      .filter(m => m.id !== 'welcome-msg' && m.text && !m.isError)
      .slice(-6)
      .map(m => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.text
      }));

    try {
      const abortCtrl = await streamAiChat({
        query,
        language,
        history: historyPayload,
        onChunk: (accumulatedText) => {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantMsgId ? { ...m, text: accumulatedText, isStreaming: true } : m
            )
          );
        },
        onComplete: (fullText) => {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantMsgId ? { ...m, text: fullText, isStreaming: false } : m
            )
          );
          setIsLoading(false);
          // Spoken output for completed response
          speechController.speak(fullText, language, assistantMsgId);
        },
        onError: (err) => {
          console.error('[AI Chat Error]:', err);
          const errorMsg = typeof err === 'string' ? err : 'Sorry, the AI service is temporarily unavailable. Please try again.';
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantMsgId ? { ...m, text: errorMsg, isStreaming: false, isError: true } : m
            )
          );
          setIsLoading(false);
          addToast(errorMsg, 'error');
        }
      });

      abortControllerRef.current = abortCtrl;
    } catch (err) {
      console.error(err);
      setIsLoading(false);
    }
  };

  const toggleRecord = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      addToast('Speech recognition is not supported in this browser.', 'warning');
      return;
    }

    if (isRecording) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsRecording(false);
    } else {
      try {
        speechController.stop();
        const recognition = new SpeechRecognition();
        recognitionRef.current = recognition;
        const bcp47 = LANGUAGE_CODES[language] || 'en-US';
        recognition.lang = bcp47;
        recognition.continuous = false;
        recognition.interimResults = false;

        recognition.onstart = () => {
          setIsRecording(true);
          addToast(`Listening in ${language}... Speak now.`, 'info');
        };

        recognition.onresult = (event) => {
          const transcript = event.results[0][0].transcript;
          if (transcript) {
            setInput(transcript);
            handleSend(transcript);
          }
        };

        recognition.onerror = () => {
          setIsRecording(false);
        };

        recognition.onend = () => {
          setIsRecording(false);
        };

        recognition.start();
      } catch (e) {
        console.error(e);
        setIsRecording(false);
      }
    }
  };

  return (
    <>
      {/* Floating Launcher Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 2500,
            width: '58px',
            height: '58px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #10B981 0%, #047857 100%)',
            color: 'white',
            border: 'none',
            boxShadow: '0 8px 24px rgba(16, 185, 129, 0.45)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            outline: 'none'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.08)';
            e.currentTarget.style.boxShadow = '0 12px 28px rgba(16, 185, 129, 0.6)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 8px 24px rgba(16, 185, 129, 0.45)';
          }}
          title="Open MediCare AI Assistant"
        >
          <Bot size={28} />
          <span style={{
            position: 'absolute',
            top: '-2px',
            right: '-2px',
            width: '14px',
            height: '14px',
            borderRadius: '50%',
            backgroundColor: '#10B981',
            border: '2px solid white'
          }} />
        </button>
      )}

      {/* Expanded Floating Chat Panel */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 2500,
            width: '380px',
            maxWidth: 'calc(100vw - 32px)',
            height: '560px',
            maxHeight: 'calc(100vh - 48px)',
            backgroundColor: 'var(--bg-card)',
            borderRadius: '20px',
            boxShadow: '0 16px 40px rgba(0, 0, 0, 0.25)',
            border: '1.5px solid var(--border-subtle)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            animation: 'slideUp 0.25s ease'
          }}
        >
          {/* Header */}
          <div style={{
            padding: '12px 16px',
            backgroundColor: 'var(--bg-app)',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div className="flex items-center gap-2.5">
              <div style={{
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                backgroundColor: 'var(--light-mint)',
                color: 'var(--primary-green)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Bot size={18} />
              </div>
              <div>
                <h4 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)', margin: 0, lineHeight: 1.2 }}>
                  MediCare AI
                </h4>
                <span style={{ fontSize: '11px', color: '#10B981', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10B981', display: 'inline-block' }} />
                  Gemini Live
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Language Selector */}
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  padding: '3px 6px',
                  borderRadius: '6px',
                  border: '1px solid var(--border-subtle)',
                  backgroundColor: 'var(--bg-card)',
                  color: 'var(--text-primary)',
                  cursor: 'pointer'
                }}
              >
                <option value="English">EN</option>
                <option value="Hindi">HI</option>
                <option value="Telugu">TE</option>
                <option value="Tamil">TA</option>
                <option value="Kannada">KN</option>
                <option value="Malayalam">ML</option>
                <option value="Bengali">BN</option>
                <option value="Marathi">MR</option>
                <option value="Gujarati">GU</option>
              </select>

              {/* Close / Minimize */}
              <button
                onClick={() => {
                  speechController.stop();
                  setIsOpen(false);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center'
                }}
                title="Close chat"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Audio Controls Bar (when speaking) */}
          <div style={{
            padding: '6px 14px',
            backgroundColor: 'var(--light-mint)',
            borderBottom: '1px solid var(--mint-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '11.5px'
          }}>
            <div className="flex items-center gap-2">
              {isSpeaking ? (
                <button
                  onClick={handleStopVoice}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#DC2626',
                    fontSize: '11px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <VolumeX size={13} /> Stop Audio
                </button>
              ) : (
                <span style={{ color: 'var(--text-muted)' }}>Voice Speed:</span>
              )}
            </div>

            {/* Speed Buttons */}
            <div style={{ display: 'flex', gap: '3px' }}>
              {[1.0, 1.5, 2.0].map((s) => (
                <button
                  key={s}
                  onClick={() => handleSpeedChange(s)}
                  style={{
                    padding: '1px 6px',
                    borderRadius: '4px',
                    fontSize: '10.5px',
                    fontWeight: 700,
                    border: 'none',
                    cursor: 'pointer',
                    backgroundColor: playbackSpeed === s ? 'var(--primary-green)' : 'var(--bg-card)',
                    color: playbackSpeed === s ? 'white' : 'var(--text-secondary)'
                  }}
                >
                  {s}×
                </button>
              ))}
            </div>
          </div>

          {/* Messages Stream Body */}
          <div
            ref={messagesContainerRef}
            onScroll={handleScroll}
            style={{
              flex: 1,
              padding: '14px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}
          >
            {messages.map((msg) => (
              <div
                key={msg.id}
                style={{
                  display: 'flex',
                  gap: '8px',
                  justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start'
                }}
              >
                {msg.sender === 'ai' && (
                  <div style={{
                    width: '26px',
                    height: '26px',
                    borderRadius: '50%',
                    backgroundColor: msg.isError ? '#FEE2E2' : 'var(--light-mint)',
                    color: msg.isError ? '#EF4444' : 'var(--primary-green)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    marginTop: '2px'
                  }}>
                    {msg.isError ? <AlertCircle size={14} /> : <Bot size={14} />}
                  </div>
                )}

                <div style={{
                  maxWidth: '82%',
                  backgroundColor: msg.sender === 'user' ? 'var(--primary-green)' : msg.isError ? '#FEF2F2' : 'var(--bg-app)',
                  color: msg.sender === 'user' ? 'white' : msg.isError ? '#991B1B' : 'var(--text-primary)',
                  padding: '10px 14px',
                  borderRadius: '14px',
                  border: msg.sender === 'ai' ? (msg.isError ? '1px solid #FECACA' : '1px solid var(--border-subtle)') : 'none',
                  fontSize: '13px',
                  lineHeight: '1.5'
                }}>
                  {msg.sender === 'user' ? (
                    <p style={{ margin: 0 }}>{msg.text}</p>
                  ) : msg.text ? (
                    <MarkdownContent content={msg.text} />
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--primary-green)', fontSize: '12px' }}>
                      <Loader2 size={13} className="animate-spin" />
                      <span>Generating response...</span>
                    </div>
                  )}

                  {msg.sender === 'ai' && msg.text && !msg.isStreaming && !msg.isError && (
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '6px' }}>
                      <button
                        onClick={() => speechController.speak(msg.text, language, msg.id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--primary-green)',
                          fontSize: '11px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '3px',
                          padding: 0
                        }}
                      >
                        <Volume2 size={13} /> Listen ({playbackSpeed}×)
                      </button>
                    </div>
                  )}
                </div>

                {msg.sender === 'user' && (
                  <div style={{
                    width: '26px',
                    height: '26px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--border-subtle)',
                    color: 'var(--text-secondary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    marginTop: '2px'
                  }}>
                    <User size={14} />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Quick Prompts */}
          <div style={{
            padding: '6px 12px',
            backgroundColor: 'var(--bg-app)',
            borderTop: '1px solid var(--border-subtle)',
            display: 'flex',
            gap: '6px',
            overflowX: 'auto'
          }}>
            {samplePrompts.map((prompt, i) => (
              <button
                key={i}
                onClick={() => handleSend(prompt)}
                disabled={isLoading}
                style={{
                  fontSize: '11px',
                  padding: '4px 8px',
                  borderRadius: '12px',
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-primary)',
                  whiteSpace: 'nowrap',
                  cursor: isLoading ? 'not-allowed' : 'pointer'
                }}
              >
                💡 {prompt}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <div style={{
            padding: '10px 12px',
            backgroundColor: 'var(--bg-card)',
            borderTop: '1px solid var(--border-subtle)',
            display: 'flex',
            gap: '8px',
            alignItems: 'center'
          }}>
            <button
              onClick={toggleRecord}
              disabled={isLoading}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: isRecording ? '#EF4444' : 'var(--light-mint)',
                color: isRecording ? 'white' : 'var(--primary-green)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: 'none',
                cursor: 'pointer',
                flexShrink: 0
              }}
              title="Speak question"
            >
              <Mic size={16} className={isRecording ? 'animate-pulse' : ''} />
            </button>

            <input
              type="text"
              className="input-field no-icon"
              placeholder={`Ask in ${language}...`}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              disabled={isLoading}
              style={{ flex: 1, fontSize: '12.5px', padding: '8px 12px' }}
            />

            <button
              onClick={() => handleSend()}
              disabled={isLoading || !input.trim()}
              className="btn btn-primary"
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                padding: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              {isLoading ? <LoadingSpinner size={16} color="white" /> : <Send size={15} />}
            </button>
          </div>

          {/* Persistent Small Medical Disclaimer */}
          <div style={{
            padding: '5px 12px',
            backgroundColor: 'var(--bg-app)',
            borderTop: '1px solid var(--border-subtle)',
            fontSize: '10px',
            color: 'var(--text-muted)',
            textAlign: 'center',
            lineHeight: '1.3'
          }}>
            AI-generated information is for educational purposes and does not replace professional medical advice.
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
};

export default FloatingAiChatbot;
