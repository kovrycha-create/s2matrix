
import React, { useState, useEffect, useCallback } from 'react';
import { MatrixSettings, DisplayMode } from './types';
import { DEFAULT_SETTINGS } from './constants';
import { useSpeechRecognition } from './hooks/useSpeechRecognition';
import { useAudioProcessor } from './hooks/useAudioProcessor';
import usePersistentState from './hooks/usePersistentState';
import MatrixCanvas from './components/MatrixCanvas';
import Controls from './components/Controls';
import SettingsPanel from './components/SettingsPanel';
import SpeechStatus from './components/SpeechStatus';
import WelcomeModal from './components/WelcomeModal';

const App: React.FC = () => {
  const [settings, setSettings] = usePersistentState<MatrixSettings>('matrix-settings', DEFAULT_SETTINGS);
  const [isSettingsVisible, setIsSettingsVisible] = useState(false);
  const [isControlsVisible, setIsControlsVisible] = useState(true);
  const [showWelcome, setShowWelcome] = useState(true);
  const [mousePosition, setMousePosition] = useState<{ x: number, y: number } | null>(null);

  const {
    isListening,
    transcript,
    statusMessage,
    startListening,
    stopListening,
    error: speechError,
  } = useSpeechRecognition();

  const { 
    volume, 
    startProcessing, 
    stopProcessing, 
    isProcessing,
    error: audioError 
  } = useAudioProcessor();
  
  const handleStart = () => {
    if (showWelcome) setShowWelcome(false);
    startListening();
    if (settings.enableVolumeReactivity) {
      startProcessing();
    }
  };

  const handleStop = useCallback(() => {
    stopListening();
    stopProcessing();
  }, [stopListening, stopProcessing]);
  
  const handleResetSettings = useCallback(() => {
    if(window.confirm('Are you sure you want to reset all settings to their default values?')) {
        setSettings(DEFAULT_SETTINGS);
    }
  }, [setSettings]);

  const cycleMode = useCallback(() => {
    setSettings(prev => {
      const modes = Object.values(DisplayMode);
      const currentIndex = modes.indexOf(prev.mode);
      const nextIndex = (currentIndex + 1) % modes.length;
      return { ...prev, mode: modes[nextIndex] };
    });
  }, [setSettings]);

  useEffect(() => {
    document.body.style.backgroundColor = settings.bgColor;
  }, [settings.bgColor]);

  // Sync volume processing with listening state and settings
  useEffect(() => {
    if (isListening) {
      if (settings.enableVolumeReactivity && !isProcessing) {
        startProcessing();
      } else if (!settings.enableVolumeReactivity && isProcessing) {
        stopProcessing();
      }
    }
  }, [settings.enableVolumeReactivity, isListening, isProcessing, startProcessing, stopProcessing]);
  
  // Track mouse position
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
        setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === 'INPUT') return;

      switch (e.key.toLowerCase()) {
        case 's':
          e.preventDefault();
          setIsSettingsVisible(prev => !prev);
          break;
        case 'h':
           e.preventDefault();
           setSettings(prev => ({...prev, showSpeechStatus: !prev.showSpeechStatus}));
           break;
        case 'm':
          e.preventDefault();
          cycleMode();
          break;
        case ' ':
          e.preventDefault();
          if(isListening) handleStop(); else handleStart();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isListening, cycleMode, handleStop, setSettings]);
  
  const displayError = speechError || audioError;

  return (
    <div className="font-mono text-[#00ff00]">
      {showWelcome && <WelcomeModal onStart={handleStart} />}

      <MatrixCanvas 
        settings={settings} 
        text={transcript} 
        volume={volume} 
        mousePosition={mousePosition} 
      />
      
      <SpeechStatus 
        message={displayError || statusMessage} 
        isVisible={settings.showSpeechStatus} 
        isError={!!displayError}
      />
      
      <Controls
        isListening={isListening}
        onStart={handleStart}
        onStop={handleStop}
        onToggleSettings={() => setIsSettingsVisible(!isSettingsVisible)}
        onCycleMode={cycleMode}
        currentMode={settings.mode}
        isControlsVisible={isControlsVisible}
        onToggleControlsVisibility={() => setIsControlsVisible(prev => !prev)}
      />

      <SettingsPanel
        settings={settings}
        setSettings={setSettings}
        isVisible={isSettingsVisible}
        onClose={() => setIsSettingsVisible(false)}
        onReset={handleResetSettings}
      />
    </div>
  );
};

export default App;
