
import React from 'react';
import { DisplayMode } from '../types';
import { MicrophoneIcon, StopIcon, SettingsIcon, ModeIcon } from './icons/Icons';

interface ControlsProps {
  isListening: boolean;
  onStart: () => void;
  onStop: () => void;
  onToggleSettings: () => void;
  onCycleMode: () => void;
  currentMode: DisplayMode;
}

const ControlButton: React.FC<{ onClick: () => void; children: React.ReactNode; isActive?: boolean; title: string }> = ({ onClick, children, isActive, title }) => (
  <button
    onClick={onClick}
    title={title}
    className={`
      flex items-center justify-center p-3 rounded-full transition-all duration-300 ease-in-out
      border border-green-500/50 backdrop-blur-sm 
      ${isActive 
        ? 'bg-green-500/50 text-white shadow-[0_0_15px_rgba(0,255,0,0.6)]' 
        : 'bg-black/50 text-green-400 hover:bg-green-500/30 hover:text-white hover:shadow-[0_0_10px_rgba(0,255,0,0.4)]'
      }
    `}
  >
    {children}
  </button>
);


const Controls: React.FC<ControlsProps> = ({ isListening, onStart, onStop, onToggleSettings, onCycleMode, currentMode }) => {
  const modeText = currentMode.charAt(0).toUpperCase() + currentMode.slice(1);
  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50">
      <div className="flex items-center gap-3 p-2 bg-black/40 border border-green-500/30 rounded-full shadow-lg backdrop-blur-md">
        <ControlButton onClick={onToggleSettings} title="Settings (S)">
          <SettingsIcon />
        </ControlButton>
        
        <ControlButton onClick={onCycleMode} title={`Cycle Mode (M) - Current: ${modeText}`}>
            <div className="flex items-center gap-2 px-2">
                <ModeIcon />
                <span className="text-sm font-bold tracking-wider">{modeText}</span>
            </div>
        </ControlButton>

        {!isListening ? (
          <ControlButton onClick={onStart} isActive={true} title="Start Listening (Spacebar)">
            <MicrophoneIcon />
          </ControlButton>
        ) : (
          <ControlButton onClick={onStop} isActive={true} title="Stop Listening (Spacebar)">
            <StopIcon />
          </ControlButton>
        )}
      </div>
    </div>
  );
};

export default Controls;
