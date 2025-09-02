
import React, { useState } from 'react';
import { MatrixSettings, DisplayMode } from '../types';
import { CloseIcon, ChevronDownIcon, ResetIcon } from './icons/Icons';
import { PRESETS } from '../presets';
import { COLOR_THEMES } from '../themes';
import { CHARACTER_SET_NAMES, DEFAULT_SETTINGS } from '../constants';

interface SettingsPanelProps {
  settings: MatrixSettings;
  setSettings: React.Dispatch<React.SetStateAction<MatrixSettings>>;
  isVisible: boolean;
  onClose: () => void;
  onReset: () => void;
}

const SettingsItem: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div className="mb-4">
    <label className="block text-sm mb-1 text-green-300">{label}</label>
    {children}
  </div>
);

const RangeInput: React.FC<{ value: number; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; min: number; max: number; step?: number; name: string }> = 
({ value, onChange, min, max, step = 1, name}) => (
  <div className="flex items-center gap-2">
    <input
      type="range"
      name={name}
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={onChange}
      className="w-full h-2 bg-green-900/50 rounded-lg appearance-none cursor-pointer accent-green-400"
    />
    <span className="text-xs font-semibold w-10 text-right">{value}</span>
  </div>
);

const ColorInput: React.FC<{value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; name: string}> = ({value, onChange, name}) => (
    <input type="color" name={name} value={value} onChange={onChange} className="w-full h-8 p-0 border-none bg-transparent cursor-pointer" />
);

const Checkbox: React.FC<{name: string; checked: boolean; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; label: string; shortcut?: string}> = ({name, checked, onChange, label, shortcut}) => (
    <label className="flex items-center cursor-pointer">
        <input type="checkbox" name={name} checked={checked} onChange={onChange} className="form-checkbox h-4 w-4 accent-green-400 bg-green-900/50 border-green-500/50 rounded"/>
        <span className="ml-2 text-sm">{label} {shortcut && `(${shortcut})`}</span>
    </label>
);

const CollapsibleSection: React.FC<{title: string; children: React.ReactNode; defaultOpen?: boolean;}> = ({ title, children, defaultOpen = false }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    return (
      <div className="py-2 border-t border-green-500/20">
        <button onClick={() => setIsOpen(!isOpen)} className="w-full flex justify-between items-center py-2 text-left hover:bg-green-500/10 rounded-md px-2 -mx-2">
          <h4 className="text-md font-semibold text-green-300">{title}</h4>
          <ChevronDownIcon className={`w-5 h-5 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
        </button>
        <div className={`grid transition-all duration-500 ease-in-out ${isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
            <div className="overflow-hidden">
                <div className="pt-2 pb-2">
                    {children}
                </div>
            </div>
        </div>
      </div>
    )
};


const SettingsPanel: React.FC<SettingsPanelProps> = ({ settings, setSettings, isVisible, onClose, onReset }) => {
  const handleSettingChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
        const { checked } = e.target as HTMLInputElement;
        setSettings(prev => ({...prev, [name]: checked}));
    } else {
        setSettings(prev => ({ ...prev, [name]: type === 'range' ? parseFloat(value) : value }));
    }
  };

  const handlePresetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const presetName = e.target.value;
    const selectedPreset = PRESETS.find(p => p.name === presetName);
    if (selectedPreset) {
      // Merge preset settings with defaults to create a complete configuration
      const newSettings = { ...DEFAULT_SETTINGS, ...selectedPreset.settings };
      setSettings(newSettings);
    }
  };

  const handleColorThemeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const themeName = e.target.value;
    const selectedTheme = COLOR_THEMES.find(t => t.name === themeName);
    if(selectedTheme) {
        setSettings(prev => ({
            ...prev,
            headColor: selectedTheme.headColor,
            tailColor: selectedTheme.tailColor,
            bgColor: selectedTheme.bgColor,
        }));
    }
  };

  const getCurrentPresetName = () => {
    const matchedPreset = PRESETS.find(preset => {
      const presetAppliedSettings = { ...DEFAULT_SETTINGS, ...preset.settings };
      return Object.keys(settings).every(key => 
        settings[key as keyof MatrixSettings] === presetAppliedSettings[key as keyof MatrixSettings]
      );
    });
    return matchedPreset ? matchedPreset.name : 'custom';
  };

  const getCurrentColorThemeName = () => {
    const matchedTheme = COLOR_THEMES.find(theme => 
        theme.headColor === settings.headColor &&
        theme.tailColor === settings.tailColor &&
        theme.bgColor === settings.bgColor
    );
    return matchedTheme ? matchedTheme.name : 'custom';
  };
  
  const currentPresetName = getCurrentPresetName();
  const currentColorThemeName = getCurrentColorThemeName();


  return (
    <div className={`
      fixed top-0 right-0 h-full w-80 bg-black/80 backdrop-blur-lg border-l border-green-500/30 
      transition-transform duration-300 ease-in-out z-50
      ${isVisible ? 'translate-x-0' : 'translate-x-full'}
    `}>
      <div className="p-4 h-full flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-green-400 tracking-wider">SETTINGS</h3>
          <div className="flex items-center gap-2">
            <button onClick={onReset} title="Reset to Defaults" className="p-1 rounded-full text-green-400 hover:bg-green-500/20 transition-colors">
              <ResetIcon />
            </button>
            <button onClick={onClose} className="p-1 rounded-full text-green-400 hover:bg-green-500/20 transition-colors">
              <CloseIcon />
            </button>
          </div>
        </div>
        
        <div className="flex-grow overflow-y-auto pr-2">
            <CollapsibleSection title="General" defaultOpen={true}>
                 <SettingsItem label="Preset">
                    <select value={currentPresetName} onChange={handlePresetChange} className="w-full p-2 bg-green-900/50 border border-green-500/30 rounded text-green-300 focus:outline-none focus:border-green-400">
                        {currentPresetName === 'custom' && <option value="custom" disabled>Custom</option>}
                        {PRESETS.map(preset => (
                        <option key={preset.name} value={preset.name}>{preset.name}</option>
                        ))}
                    </select>
                </SettingsItem>
                <SettingsItem label="Display Mode">
                    <select name="mode" value={settings.mode} onChange={handleSettingChange} className="w-full p-2 bg-green-900/50 border border-green-500/30 rounded text-green-300 focus:outline-none focus:border-green-400">
                        <option value={DisplayMode.Letters}>Letters</option>
                        <option value={DisplayMode.Words}>Words</option>
                        <option value={DisplayMode.Sentences}>Sentences</option>
                    </select>
                </SettingsItem>
                <SettingsItem label="Font Size">
                    <RangeInput name="fontSize" value={settings.fontSize} onChange={handleSettingChange} min={10} max={40} />
                </SettingsItem>
                <SettingsItem label="Column Randomization %">
                    <RangeInput name="randomization" value={settings.randomization} onChange={handleSettingChange} min={0} max={100} />
                </SettingsItem>
            </CollapsibleSection>
            
            <CollapsibleSection title="Animation">
                <SettingsItem label="Fall Direction">
                    <select name="fallDirection" value={settings.fallDirection} onChange={handleSettingChange} className="w-full p-2 bg-green-900/50 border border-green-500/30 rounded text-green-300 focus:outline-none focus:border-green-400">
                        <option value="down">Down</option>
                        <option value="up">Up</option>
                    </select>
                </SettingsItem>
                <SettingsItem label="Base Fall Speed">
                    <RangeInput name="fallSpeed" value={settings.fallSpeed} onChange={handleSettingChange} min={1} max={20} />
                </SettingsItem>
                <Checkbox name="reverseWordDirection" checked={settings.reverseWordDirection} onChange={handleSettingChange} label="Reverse Word Flow" />
            </CollapsibleSection>
            
            <CollapsibleSection title="Background Rain">
                 <Checkbox name="enableBackgroundRain" checked={settings.enableBackgroundRain} onChange={handleSettingChange} label="Enable Background Rain" />
                <SettingsItem label="Character Set">
                    <select name="characterSet" value={settings.characterSet} onChange={handleSettingChange} className="w-full p-2 bg-green-900/50 border border-green-500/30 rounded text-green-300 focus:outline-none focus:border-green-400">
                      {Object.entries(CHARACTER_SET_NAMES).map(([key, name]) => (
                        <option key={key} value={key}>{name}</option>
                      ))}
                    </select>
                </SettingsItem>
                <SettingsItem label="Base Rain Density">
                    <RangeInput name="rainSpawnRate" value={settings.rainSpawnRate} onChange={handleSettingChange} min={1} max={50} />
                </SettingsItem>
            </CollapsibleSection>
            
            <CollapsibleSection title="Volume Reactivity">
                <Checkbox name="enableVolumeReactivity" checked={settings.enableVolumeReactivity} onChange={handleSettingChange} label="Enable Volume Reactivity" />
                {settings.enableVolumeReactivity && (
                    <div className="pl-6 mt-2 space-y-4">
                        <SettingsItem label="Volume Affects">
                             <select name="volumeAffects" value={settings.volumeAffects} onChange={handleSettingChange} className="w-full p-2 bg-green-900/50 border border-green-500/30 rounded text-green-300 focus:outline-none focus:border-green-400">
                                <option value="speed">Speed</option>
                                <option value="brightness">Brightness</option>
                                <option value="density">Density</option>
                            </select>
                        </SettingsItem>
                        <SettingsItem label="Sensitivity">
                            <RangeInput name="volumeSensitivity" value={settings.volumeSensitivity} onChange={handleSettingChange} min={1} max={100} />
                        </SettingsItem>
                    </div>
                )}
            </CollapsibleSection>

            <CollapsibleSection title="Style & Color">
                <SettingsItem label="Color Theme">
                    <select value={currentColorThemeName} onChange={handleColorThemeChange} className="w-full p-2 bg-green-900/50 border border-green-500/30 rounded text-green-300 focus:outline-none focus:border-green-400">
                        {currentColorThemeName === 'custom' && <option value="custom" disabled>Custom</option>}
                        {COLOR_THEMES.map(theme => (
                            <option key={theme.name} value={theme.name}>{theme.name}</option>
                        ))}
                    </select>
                </SettingsItem>
                <SettingsItem label="Brightness">
                    <RangeInput name="brightness" value={settings.brightness} onChange={handleSettingChange} min={1} max={10} />
                </SettingsItem>
                <SettingsItem label="Fade Out Rate (Ghosting)">
                    <RangeInput name="fadeOutRate" value={settings.fadeOutRate * 100} onChange={e => setSettings(p => ({...p, fadeOutRate: parseFloat(e.target.value) / 100}))} min={1} max={50} />
                </SettingsItem>
                <div className="grid grid-cols-3 gap-2 mt-2">
                    <SettingsItem label="Head">
                        <ColorInput name="headColor" value={settings.headColor} onChange={handleSettingChange} />
                    </SettingsItem>
                    <SettingsItem label="Tail">
                        <ColorInput name="tailColor" value={settings.tailColor} onChange={handleSettingChange} />
                    </SettingsItem>
                    <SettingsItem label="BG">
                        <ColorInput name="bgColor" value={settings.bgColor} onChange={handleSettingChange} />
                    </SettingsItem>
                </div>
            </CollapsibleSection>

            <CollapsibleSection title="Effects & Toggles">
                <div className="space-y-2">
                    <Checkbox name="memoryMode" checked={settings.memoryMode} onChange={handleSettingChange} label="Memory Mode (No Fade)" />
                    <Checkbox name="ghostingEffect" checked={settings.ghostingEffect} onChange={handleSettingChange} label="Ghosting Effect" />
                    <Checkbox name="glowEffect" checked={settings.glowEffect} onChange={handleSettingChange} label="Character Glow" />
                    <Checkbox name="spawnFlash" checked={settings.spawnFlash} onChange={handleSettingChange} label="Spawn Flash" />
                    <Checkbox name="showSpeechStatus" checked={settings.showSpeechStatus} onChange={handleSettingChange} label="Show Speech Status" shortcut="H" />
                </div>
                <div className='mt-4 pt-4 border-t border-green-500/20'>
                    <SettingsItem label="Glitch Chance %">
                        <RangeInput name="glitchChance" value={settings.glitchChance} onChange={handleSettingChange} min={0} max={100} />
                    </SettingsItem>
                </div>
                <div className="mt-4 pt-4 border-t border-green-500/20">
                    <Checkbox name="enableMouseInteraction" checked={settings.enableMouseInteraction} onChange={handleSettingChange} label="Enable Mouse Interaction" />
                    {settings.enableMouseInteraction && (
                    <div className="pl-6 mt-2 space-y-4">
                        <SettingsItem label="Mouse Effect Radius">
                        <RangeInput name="mouseEffectRadius" value={settings.mouseEffectRadius} onChange={handleSettingChange} min={20} max={500} />
                        </SettingsItem>
                        <SettingsItem label="Mouse Effect Strength">
                        <RangeInput name="mouseEffectStrength" value={settings.mouseEffectStrength} onChange={handleSettingChange} min={-50} max={50} />
                        </SettingsItem>
                    </div>
                    )}
                </div>
            </CollapsibleSection>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;
