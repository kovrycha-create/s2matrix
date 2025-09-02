
export enum DisplayMode {
  Letters = 'letters',
  Words = 'words',
  Sentences = 'sentences'
}

export interface MatrixSettings {
  mode: DisplayMode;
  fontSize: number;
  fallSpeed: number;
  brightness: number;
  fadeOutRate: number;
  randomization: number;
  memoryMode: boolean;
  glowEffect: boolean;
  ghostingEffect: boolean;
  fallDirection: 'down' | 'up';
  showSpeechStatus: boolean;
  headColor: string;
  tailColor: string;
  bgColor: string;
  reverseWordDirection: boolean;
  enableBackgroundRain: boolean;
  rainSpawnRate: number;
  characterSet: string;
  spawnFlash: boolean;
  enableVolumeReactivity: boolean;
  volumeAffects: 'speed' | 'brightness' | 'density';
  volumeSensitivity: number;
  glitchChance: number;
  enableMouseInteraction: boolean;
  mouseEffectRadius: number;
  mouseEffectStrength: number;
}

export interface MatrixColumn {
  chars: string[];
  yPositions: number[];
  isActive: boolean;
  flashIntensity?: number;
}

export interface Preset {
  name: string;
  settings: Partial<MatrixSettings>;
}

export interface ColorTheme {
    name: string;
    headColor: string;
    tailColor: string;
    bgColor: string;
}
