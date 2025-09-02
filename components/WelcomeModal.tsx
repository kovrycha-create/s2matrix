
import React from 'react';
import { MicrophoneIcon } from './icons/Icons';

interface WelcomeModalProps {
    onStart: () => void;
}

const WelcomeModal: React.FC<WelcomeModalProps> = ({ onStart }) => {
    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-2xl text-center bg-black/50 border border-green-500/30 rounded-lg shadow-[0_0_30px_rgba(0,255,0,0.2)] p-8 flex flex-col items-center">
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 animate-pulse">Speech Matrix</h1>
                <p className="text-green-300 mb-6 max-w-lg">
                    Welcome to a world where your voice becomes the code. Press the button below and start speaking. Your words will flow down the screen in a cascade of digital rain.
                </p>
                <div className="bg-green-900/50 border border-green-500/50 rounded p-4 text-sm text-left mb-8 max-w-md">
                    <h3 className="font-bold text-green-200 mb-2">Shortcuts:</h3>
                    <ul className="list-inside list-disc text-green-400 space-y-1">
                        <li><kbd className="font-sans font-bold">Spacebar</kbd>: Start / Stop Listening</li>
                        <li><kbd className="font-sans font-bold">M</kbd>: Cycle Display Mode</li>
                        <li><kbd className="font-sans font-bold">S</kbd>: Toggle Settings Panel</li>
                        <li><kbd className="font-sans font-bold">H</kbd>: Toggle Speech Status</li>
                    </ul>
                </div>
                <button
                    onClick={onStart}
                    className="flex items-center gap-3 px-8 py-4 bg-green-500 text-black font-bold text-lg rounded-lg shadow-lg hover:bg-green-400 hover:shadow-green-400/50 transition-all duration-300 animate-bounce"
                >
                    <MicrophoneIcon className="w-6 h-6"/>
                    Begin Transmission
                </button>
                <p className="text-xs text-green-600 mt-6">
                    Note: This application requires microphone access. Your browser will prompt you for permission.
                </p>
            </div>
        </div>
    );
};

export default WelcomeModal;
