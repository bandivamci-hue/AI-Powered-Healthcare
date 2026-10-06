import React, { useState, useRef, useEffect } from 'react';
import AppLayout from '../components/layout/AppLayout';
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
  AlertCircle
} from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { streamAiChat } from '../services/aiChatService';
import { speechController } from '../services/speechController';
import MarkdownContent from '../components/ui/MarkdownContent';

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

const AiAssistantPage = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [messages, setMessages] = useState([
    {
      id: 'welcome-msg',
      sender: 'ai',
      text: 'Hello! I am your MediCare AI Healthcare Assistant powered by Gemini. You can ask me questions about your doctor prescriptions, medication schedules, side effects, or medical terms in your preferred language. Text will stream progressively and can be read aloud in your local language.',
      time: '09:00 AM',
      isStreaming: false
    }
  ]);
  const [input, setInput] = useState('');
  const [language, setLanguage] = useState(user?.preferredLanguage || 'English');
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    if (user?.preferredLanguage) {
      setLanguage(user.preferredLanguage);
    }
  }, [user?.preferredLanguage]);

  const messagesContainerRef = useRef(null);
  const recognitionRef = useRef(null);
  const abortControllerRef = useRef(null);
  const userScrolledUpRef = useRef(false);

  const samplePrompts = [
    'What is Paracetamol 500mg used for?',
    'What does PRN mean in a prescription?',
    'What is the difference between a tablet and a capsule?',
    'Why is hydration important?'
  ];

  // Subscribe to speech controller state
  useEffect(() => {
    const unsubscribe = speechController.subscribe(({ isPlaying }) => {
      setIsSpeaking(isPlaying);
    });
    return () => {
      unsubscribe();
      speechController.stop();
    };
  }, []);

  // Smart auto-scroll: auto-scroll to bottom only if user has not scrolled up
  const handleScroll = () => {
    if (!messagesContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
    userScrolledUpRef.current = !isNearBottom;
  };

  useEffect(() => {
    if (!userScrolledUpRef.current && messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleStopVoice = () => {
    speechController.stop();
    addToast('Voice output stopped.', 'info');
  };

  const handleSend = async (textToSend) => {
    const query = (textToSend || input).trim();
    if (!query || isLoading) return;

    // Stop any existing speech playback
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

    // User message and assistant placeholder message are created IMMEDIATELY
    setMessages((prev) => [...prev, userMsg, assistantMsg]);
    if (!textToSend) setInput('');
    setIsLoading(true);
    userScrolledUpRef.current = false;

    // Conversational memory: pass history of past messages (excluding welcome msg)
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

          // Trigger EXACTLY ONE TTS operation for the complete final response
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
      addToast('Speech recognition is not supported in this browser. Please type your question.', 'warning');
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

        recognition.onerror = (event) => {
          console.warn('Speech recognition notice:', event.error);
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
    <AppLayout>
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>
          How can I help you understand your health today?
        </h1>
        <p style={{ fontSize: '15px', color: 'var(--text-muted)' }}>
          Ask about a medical document, medicine instruction, or general health information. Responses stream in real-time with spoken voice output.
        </p>
      </div>

      {/* Main Chat Container */}
      <div className="med-card" style={{ padding: '0', display: 'flex', flexDirection: 'column', height: '620px', overflow: 'hidden' }}>
        {/* Chat Header */}
        <div style={{
          padding: '16px 24px',
          borderBottom: '1px solid var(--border-subtle)',
          backgroundColor: 'var(--bg-app)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div className="flex items-center gap-3">
            <div style={{ width: '38px', height: '38px', borderRadius: '50%', backgroundColor: 'var(--light-mint)', color: 'var(--primary-green)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Bot size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>MediCare AI Assistant</h3>
              <span className="flex items-center gap-1" style={{ fontSize: '12px', color: '#10B981' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10B981', display: 'inline-block' }}></span>
                Powered by Gemini • Real-Time Streaming
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3" style={{ fontSize: '13px' }}>
            {isSpeaking && (
              <button
                onClick={handleStopVoice}
                className="btn btn-outline"
                style={{ padding: '6px 12px', fontSize: '12px', color: '#EF4444', borderColor: '#EF4444', display: 'flex', alignItems: 'center', gap: '4px' }}
                title="Stop speaking"
              >
                <VolumeX size={14} /> Stop Voice
              </button>
            )}

            <div className="flex items-center gap-2">
              <Globe size={16} color="var(--text-muted)" />
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                style={{ border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '6px 12px', background: 'var(--bg-card)', color: 'var(--text-primary)', fontWeight: 500 }}
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
                <option value="Odia">Odia (ଓଡ଼ିଆ)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Message Log */}
        <div 
          ref={messagesContainerRef}
          onScroll={handleScroll}
          style={{ flex: 1, padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px' }}
        >
          {messages.map((msg) => (
            <div
              key={msg.id}
              style={{
                display: 'flex',
                gap: '12px',
                justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start'
              }}
            >
              {msg.sender === 'ai' && (
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: msg.isError ? '#FEE2E2' : 'var(--light-mint)', color: msg.isError ? '#EF4444' : 'var(--primary-green)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {msg.isError ? <AlertCircle size={18} /> : <Bot size={18} />}
                </div>
              )}

              <div style={{
                maxWidth: '75%',
                backgroundColor: msg.sender === 'user' ? 'var(--primary-green)' : msg.isError ? '#FEF2F2' : 'var(--bg-app)',
                color: msg.sender === 'user' ? 'white' : msg.isError ? '#991B1B' : 'var(--text-primary)',
                padding: '14px 18px',
                borderRadius: '16px',
                border: msg.sender === 'ai' ? (msg.isError ? '1px solid #FECACA' : '1px solid var(--border-subtle)') : 'none',
                boxShadow: 'var(--shadow-card)'
              }}>
                {msg.sender === 'user' ? (
                  <p style={{ fontSize: '14px', lineHeight: '1.6', margin: 0 }}>{msg.text}</p>
                ) : msg.text ? (
                  <MarkdownContent content={msg.text} />
                ) : (
                  <div className="ai-loading-container">
                    <div className="ai-loading-spinner">
                      <Loader2 size={15} className="animate-spin" />
                    </div>
                    <div className="ai-loading-text">
                      <span>Gemini AI is generating response</span>
                      <span className="ai-typing-dots">
                        <span></span>
                        <span></span>
                        <span></span>
                      </span>
                    </div>
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px', fontSize: '11px', opacity: 0.85 }}>
                  <span>{msg.time}</span>
                  {msg.sender === 'ai' && msg.text && !msg.isStreaming && !msg.isError && (
                    <button
                      onClick={() => speechController.speak(msg.text, language, msg.id)}
                      title="Listen via Text to Speech"
                      style={{ color: 'var(--primary-green)', cursor: 'pointer', border: 'none', background: 'none', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}
                    >
                      <Volume2 size={15} /> Listen
                    </button>
                  )}
                </div>
              </div>

              {msg.sender === 'user' && (
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#E2E8F0', color: '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <User size={18} />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Quick Sample Prompts */}
        <div style={{ padding: '8px 24px', backgroundColor: 'var(--bg-app)', borderTop: '1px solid var(--border-subtle)', display: 'flex', gap: '8px', overflowX: 'auto' }}>
          {samplePrompts.map((prompt, i) => (
            <button
              key={i}
              onClick={() => handleSend(prompt)}
              disabled={isLoading}
              style={{
                fontSize: '12px',
                padding: '6px 12px',
                borderRadius: '9999px',
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

        {/* Input Bar */}
        <div style={{ padding: '16px 24px', backgroundColor: 'var(--bg-card)', borderTop: '1px solid var(--border-subtle)', display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button
            onClick={toggleRecord}
            disabled={isLoading}
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              backgroundColor: isRecording ? '#EF4444' : 'var(--light-mint)',
              color: isRecording ? 'white' : 'var(--primary-green)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              border: 'none',
              transition: 'all 0.2s ease'
            }}
            title="Ask using microphone"
          >
            <Mic size={20} className={isRecording ? 'animate-pulse' : ''} />
          </button>

          <input
            type="text"
            className="input-field no-icon"
            placeholder={`Ask a question in ${language}...`}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            disabled={isLoading}
            style={{ flex: 1 }}
          />

          <button 
            onClick={() => handleSend()} 
            disabled={isLoading || !input.trim()}
            className="btn btn-primary" 
            style={{ padding: '12px 20px', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />} 
            Send
          </button>
        </div>
      </div>

      {/* Safety Disclaimer Banner */}
      <div style={{ marginTop: '16px', textAlign: 'center', fontSize: '13px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
        <ShieldCheck size={16} color="var(--primary-green)" /> MediCare AI provides informational support powered by Gemini and does not replace professional medical advice, diagnosis, or treatment.
      </div>
    </AppLayout>
  );
};

export default AiAssistantPage;
