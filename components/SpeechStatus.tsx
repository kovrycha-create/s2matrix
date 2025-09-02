
import React from 'react';

interface SpeechStatusProps {
  message: string;
  isVisible: boolean;
  isError?: boolean;
}

const SpeechStatus: React.FC<SpeechStatusProps> = ({ message, isVisible, isError }) => {
  if (!isVisible) return null;

  return (
    <div className={`
      fixed top-4 left-4 z-50 max-w-sm p-3 rounded-md text-sm shadow-lg
      transition-all duration-300
      border
      ${isError 
        ? 'bg-red-900/70 border-red-500/50 text-red-200' 
        : 'bg-black/70 border-green-500/30 text-green-300'
      }
      backdrop-blur-sm
    `}>
      {message}
    </div>
  );
};

export default SpeechStatus;
