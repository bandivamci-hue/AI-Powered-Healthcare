// High-Performance Streaming AI Service for MediCare
// Connects to Django SSE endpoint /api/ai/stream/ for progressive ChatGPT-like streaming.

export const streamAiChat = async ({
  query,
  language = 'English',
  history = [],
  onChunk = () => {},
  onComplete = () => {},
  onError = () => {}
}) => {
  const controller = new AbortController();

  try {
    const token = localStorage.getItem('access_token') || localStorage.getItem('token') || localStorage.getItem('accessToken');
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'text/event-stream'
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch('http://127.0.0.1:8000/api/ai/stream/', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        query: query,
        message: query,
        language: language,
        history: history,
        conversation_history: history
      }),
      signal: controller.signal
    });

    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let accumulatedText = '';
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || ''; // Keep incomplete line in buffer

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || !trimmed.startsWith('data:')) continue;

        const jsonStr = trimmed.replace(/^data:\s*/, '').trim();
        if (!jsonStr) continue;

        try {
          const parsed = JSON.parse(jsonStr);

          if (parsed.error) {
            onError(parsed.error);
            return controller;
          }

          if (parsed.done) {
            onComplete(accumulatedText);
            return controller;
          }

          if (parsed.text) {
            accumulatedText += parsed.text;
            onChunk(accumulatedText, parsed.text);
          }
        } catch (parseErr) {
          console.warn('SSE Chunk JSON Parse notice:', parseErr);
        }
      }
    }

    if (accumulatedText) {
      onComplete(accumulatedText);
    } else {
      onError('No response received from AI service.');
    }

  } catch (err) {
    if (err.name === 'AbortError') {
      console.log('AI streaming aborted by user.');
    } else {
      console.error('AI Stream Connection Error:', err);
      onError(err.message || 'Sorry, the AI service is temporarily unavailable. Please try again.');
    }
  }

  return controller;
};

export default streamAiChat;
