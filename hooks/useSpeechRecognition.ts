import { useState, useRef, useEffect, useCallback } from 'react';

// FIX: Add type definitions for the Web Speech API to resolve TS errors.
// Type definitions for the Web Speech API
interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface SpeechRecognitionEvent extends Event {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  readonly isFinal: boolean;
  readonly length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  readonly transcript: string;
  readonly confidence: number;
}

// Augment the Window interface
declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognition;
    webkitSpeechRecognition?: new () => SpeechRecognition;
  }
}

interface SpeechRecognitionHook {
  isListening: boolean;
  transcript: string;
  statusMessage: string;
  error: string | null;
  startListening: () => void;
  stopListening: () => void;
}

export const useSpeechRecognition = (): SpeechRecognitionHook => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [statusMessage, setStatusMessage] = useState('Ready to listen...');
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const lastProcessedText = useRef('');

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError('Speech recognition is not supported in this browser.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      setStatusMessage('Listening...');
      setError(null);
    };

    recognition.onend = () => {
      setIsListening(false);
      setStatusMessage('Ready to listen...');
    };
    
    recognition.onerror = (event) => {
      // These are common, non-critical errors. We can ignore them and let the onend event handle state.
      if (event.error === 'no-speech' || event.error === 'audio-capture') {
        console.warn(`Speech recognition inactive: ${event.error}`);
        // Let the onend event handle UI state. stopListening() will be called implicitly.
        return;
      }

      console.error('Speech recognition error:', event.error);
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        setError('Microphone access denied. Please allow microphone permissions in your browser settings.');
      } else {
        setError(`Error: ${event.error}`);
      }
      setIsListening(false);
    };

    recognition.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }
      
      const newContent = finalTranscript || interimTranscript;
      
      if (newContent.toLowerCase().includes(lastProcessedText.current.toLowerCase())) {
        const updatedTranscript = newContent.substring(lastProcessedText.current.length).trim();
        if (updatedTranscript) setTranscript(updatedTranscript);
      } else {
        setTranscript(newContent.trim());
      }

      if (finalTranscript) {
        lastProcessedText.current += finalTranscript;
        setStatusMessage(`Recognized: ${finalTranscript.trim()}`);
      } else {
        setStatusMessage(`Hearing: ${interimTranscript}`);
      }
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const startListening = useCallback(() => {
    if (recognitionRef.current && !isListening) {
      try {
        lastProcessedText.current = '';
        setTranscript('');
        recognitionRef.current.start();
      } catch (err) {
        console.error("Error starting recognition: ", err);
        setError("Could not start listening. Please try again.");
      }
    }
  }, [isListening]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  }, [isListening]);

  return { isListening, transcript, statusMessage, error, startListening, stopListening };
};