
import { useState, useRef, useCallback } from 'react';

interface AudioProcessorHook {
  volume: number;
  startProcessing: () => Promise<void>;
  stopProcessing: () => void;
  isProcessing: boolean;
  error: string | null;
}

export const useAudioProcessor = (): AudioProcessorHook => {
    const [volume, setVolume] = useState(0);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const animationFrameRef = useRef<number | null>(null);
    const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);

    const processAudio = useCallback(() => {
        if (analyserRef.current) {
            const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
            analyserRef.current.getByteTimeDomainData(dataArray);
            
            let sumSquares = 0.0;
            for (const amplitude of dataArray) {
                const normalized = (amplitude - 128) / 128; // -1 to 1
                sumSquares += normalized * normalized;
            }
            
            const rms = Math.sqrt(sumSquares / dataArray.length);
            setVolume(rms);
        }
        animationFrameRef.current = requestAnimationFrame(processAudio);
    }, []);

    const startProcessing = useCallback(async () => {
        if (isProcessing || (window as any).__audioProcessorActive) return;
        (window as any).__audioProcessorActive = true;
        setError(null);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;

            const context = new (window.AudioContext || (window as any).webkitAudioContext)();
            audioContextRef.current = context;
            
            const source = context.createMediaStreamSource(stream);
            sourceRef.current = source;
            const analyser = context.createAnalyser();
            analyser.fftSize = 256;
            
            source.connect(analyser);
            analyserRef.current = analyser;

            setIsProcessing(true);
            animationFrameRef.current = requestAnimationFrame(processAudio);
        } catch (err) {
            console.error("Error starting audio processing:", err);
            setError("Microphone access denied for volume analysis. Please allow microphone permissions.");
            setIsProcessing(false);
            (window as any).__audioProcessorActive = false;
        }
    }, [isProcessing, processAudio]);

    const stopProcessing = useCallback(() => {
        if (!isProcessing && !(window as any).__audioProcessorActive) return;
        (window as any).__audioProcessorActive = false;
        
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
            animationFrameRef.current = null;
        }
        
        sourceRef.current?.disconnect();
        streamRef.current?.getTracks().forEach(track => track.stop());
        streamRef.current = null;
        sourceRef.current = null;

        if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
           audioContextRef.current.close();
        }
        audioContextRef.current = null;

        setVolume(0);
        setIsProcessing(false);
    }, [isProcessing]);

    return { volume, startProcessing, stopProcessing, isProcessing, error };
};
