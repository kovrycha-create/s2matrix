
import React from 'react';

const iconProps = {
  className: "w-5 h-5",
  strokeWidth: 2,
};

export const MicrophoneIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...iconProps} {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
    <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
    <line x1="12" y1="19" x2="12" y2="23"></line>
  </svg>
);

export const StopIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...iconProps} {...props} viewBox="0 0 24 24" fill="currentColor" stroke="currentColor">
    <rect x="6" y="6" width="12" height="12"></rect>
  </svg>
);

export const SettingsIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...iconProps} {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <circle cx="12" cy="12" r="3"></circle>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
  </svg>
);

export const ModeIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...iconProps} {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
        <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
        <path d="M3 21v-5h5"/>
        <path d="M21 3v5h-5"/>
    </svg>
);

export const CloseIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...iconProps} {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
);

export const ChevronDownIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...iconProps} {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path d="m6 9 6 6 6-6"/>
    </svg>
);

export const ChevronUpIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...iconProps} {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path d="m18 15-6-6-6 6"/>
    </svg>
);

export const ResetIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...iconProps} {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path d="M21 12a9 9 0 0 0-9-9 .94 .94 0 0 0-1 .7L9 6.3A7 7 0 0 1 21 12z"></path>
        <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path>
        <path d="M3 21v-4h4"></path>
        <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"></path>
        <path d="M21 3v4h-4"></path>
    </svg>
);
