
import { MatrixSettings, DisplayMode } from './types';

export const DEFAULT_SETTINGS: MatrixSettings = {
  mode: DisplayMode.Words,
  fontSize: 20,
  fallSpeed: 5,
  brightness: 7,
  fadeOutRate: 0.1, // Adjusted for better visibility with ghosting
  randomization: 40,
  memoryMode: false,
  glowEffect: true,
  ghostingEffect: false, // Disabled by default
  fallDirection: 'down', // Default direction
  showSpeechStatus: true,
  headColor: '#ffffff',
  tailColor: '#00ff00',
  bgColor: '#000000',
  reverseWordDirection: false,
  enableBackgroundRain: true,
  rainSpawnRate: 15,
  characterSet: 'katakana',
  spawnFlash: true,
  enableVolumeReactivity: true,
  volumeAffects: 'speed',
  volumeSensitivity: 50,
  glitchChance: 2,
  enableMouseInteraction: true,
  mouseEffectRadius: 100,
  mouseEffectStrength: 15,
};

export const CHARACTER_SETS: { [key: string]: string } = {
  katakana: 'アァカサタナハマヤャラワガザダバパイィキシチニヒミリヰギジヂビピウゥクスツヌフムユュルグズブヅプエェケセテネヘメレヱゲゼデベペオォコソトノホモヨョロヲゴゾドボポヴッン',
  binary: '01',
  numbers: '0123456789',
  runes: 'ᚠᚢᚦᚨᚱᚲᚷᚹᚺᚾᛁᛃᛇᛈᛉᛊᛏᛒᛖᛗᛚᛜᛟᛞ',
  ascii: '!"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~',
  'js-code': '<>(){}[].,;\'"=/+-%*&|!?^~',
};

export const CHARACTER_SET_NAMES: { [key: string]: string } = {
  katakana: 'Katakana',
  binary: 'Binary',
  numbers: 'Numbers',
  runes: 'Elder Futhark Runes',
  ascii: 'ASCII',
  'js-code': 'Code Snippets',
};
