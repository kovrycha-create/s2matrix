import { useEffect, useRef } from 'react';
import { MatrixSettings } from '../types';

// The entire worker script is now a self-contained string.
// All dependencies from other files are inlined directly here.
const workerScript = `
// --- Inlined from types.ts ---
const DisplayMode = {
  Letters: 'letters',
  Words: 'words',
  Sentences: 'sentences'
};

// --- Inlined from constants.ts ---
const DEFAULT_SETTINGS = {
  mode: 'words',
  fontSize: 20,
  fallSpeed: 5,
  brightness: 7,
  fadeOutRate: 0.1,
  randomization: 40,
  memoryMode: false,
  glowEffect: true,
  ghostingEffect: false,
  fallDirection: 'down',
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

const CHARACTER_SETS = {
  katakana: 'アァカサタナハマヤャラワガザダバパイィキシチニヒミリヰギジヂビピウゥクスツヌフムユュルグズブヅプエェケセテネヘメレヱゲゼデベペオォコソトノホモヨョロヲゴゾドボポヴッン',
  binary: '01',
  numbers: '0123456789',
  runes: 'ᚠᚢᚦᚨᚱᚲᚷᚹᚺᚾᛁᛃᛇᛈᛉᛊᛏᛒᛖᛗᛚᛜᛟᛞ',
  ascii: '!"#$%&\\\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\\\]^_\`abcdefghijklmnopqrstuvwxyz{|}~',
  'js-code': '<>(){}[].,;\\'"=/+-%*&|!?^~',
};


// --- Original worker code from workers/matrix.worker.ts (with imports removed) ---
let canvas;
let ctx;
let settings = DEFAULT_SETTINGS;
let volume = 0;
let mousePosition = null;

let matrixColumns = [];
const queues = {
  letters: [],
  words: [],
};
let animationFrameId = null;
let lastTime = 0;
let nextColumnIndex = 0;

const hexToRgb = (hex) => {
  const result = /^#?([a-f\\d]{2})([a-f\\d]{2})([a-f\\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
};

const initMatrix = (width, height) => {
    if (!canvas) return;
    canvas.width = width;
    canvas.height = height;

    const columnCount = Math.floor(canvas.width / settings.fontSize);
    matrixColumns = Array(columnCount).fill(null).map(() => ({
      chars: [],
      yPositions: [],
      isActive: false,
      flashIntensity: 0,
    }));
    
    nextColumnIndex = 0;

    if (!ctx) return;
    ctx.fillStyle = settings.bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
};

const getNextColumn = () => {
    const columnCount = matrixColumns.length;
    if (columnCount === 0) return null;

    const inactiveColumnsIndices = [];
    for(let i = 0; i < columnCount; i++) {
        if (!matrixColumns[i].isActive) {
            inactiveColumnsIndices.push(i);
        }
    }

    if (inactiveColumnsIndices.length === 0) {
        return null;
    }
    
    if (Math.random() * 100 < settings.randomization) {
      return inactiveColumnsIndices[Math.floor(Math.random() * inactiveColumnsIndices.length)];
    }

    const start = nextColumnIndex;
    for (let i = 0; i < columnCount; i++) {
      const idx = (start + i) % columnCount;
      if (!matrixColumns[idx].isActive) {
        nextColumnIndex = (idx + 1) % columnCount;
        return idx;
      }
    }
    
    return inactiveColumnsIndices[0];
};

const addWordToMatrix = (word) => {
    if (!word || !canvas) return true;
    const colIndex = getNextColumn();
    if (colIndex === null) return false;

    const column = matrixColumns[colIndex];
    if(!column) return true;

    column.chars = [];
    column.yPositions = [];
    
    if (settings.reverseWordDirection) {
        for (let i = 0; i < word.length; i++) {
            column.chars.push(word[i]);
            const yPos = settings.fallDirection === 'up'
                ? canvas.height + (word.length - 1 - i) * settings.fontSize
                : (word.length - 1 - i) * -settings.fontSize;
            column.yPositions.push(yPos);
        }
    } else {
        for (let i = word.length - 1; i >= 0; i--) {
            column.chars.push(word[i]);
            const yPos = settings.fallDirection === 'up'
                ? canvas.height + i * settings.fontSize
                : (word.length - 1 - i) * -settings.fontSize;
            column.yPositions.push(yPos);
        }
    }
    column.isActive = true;
    column.flashIntensity = 1;
    return true;
};

const processQueues = () => {
    while(queues.letters.length > 0) {
        const letter = queues.letters[0];
        if(!letter || !letter.trim()){
            queues.letters.shift();
            continue;
        }
        if (addWordToMatrix(letter)) {
            queues.letters.shift();
        } else {
            break;
        }
    }
    while(queues.words.length > 0) {
        const word = queues.words[0];
        if(!word) {
            queues.words.shift();
            continue;
        }
        if (addWordToMatrix(word)) {
            queues.words.shift();
        } else {
            break;
        }
    }
};

const draw = (timestamp) => {
    if (!lastTime) lastTime = timestamp;
    const deltaTime = timestamp - lastTime;
    lastTime = timestamp;

    if (!canvas || !ctx) {
        animationFrameId = self.requestAnimationFrame(draw);
        return;
    }
    
    let effectiveFallSpeed = settings.fallSpeed;
    let effectiveBrightness = settings.brightness;
    let effectiveRainSpawnRate = settings.rainSpawnRate;
    const charSet = CHARACTER_SETS[settings.characterSet] || CHARACTER_SETS.katakana;

    if (settings.enableVolumeReactivity && volume > 0.01) {
      const volumeFactor = Math.min(volume * (settings.volumeSensitivity / 25), 4);
      switch (settings.volumeAffects) {
        case 'speed':
          effectiveFallSpeed += settings.fallSpeed * volumeFactor;
          break;
        case 'brightness':
          effectiveBrightness += settings.brightness * volumeFactor;
          break;
        case 'density':
          effectiveRainSpawnRate += settings.rainSpawnRate * volumeFactor * 2;
          break;
      }
    }

    if (!settings.memoryMode) {
        if (settings.ghostingEffect) {
            const bgColorRgb = hexToRgb(settings.bgColor);
            if (bgColorRgb) {
                ctx.fillStyle = \`rgba(\${bgColorRgb.r}, \${bgColorRgb.g}, \${bgColorRgb.b}, \${settings.fadeOutRate})\`;
            } else {
                ctx.fillStyle = settings.bgColor;
            }
        } else {
            ctx.fillStyle = settings.bgColor;
        }
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    
    ctx.font = \`\${settings.fontSize}px 'Courier New', monospace\`;
    
    matrixColumns.forEach((column, i) => {
        if(settings.enableBackgroundRain && !column.isActive && (Math.random() * 1000) < effectiveRainSpawnRate) {
            column.isActive = true;
            column.chars.push(charSet[Math.floor(Math.random() * charSet.length)]);
            const startY = settings.fallDirection === 'up' ? canvas.height : 0;
            column.yPositions.push(startY);
            column.flashIntensity = 0.7;
        }

        if (!column.isActive) return;

        if (settings.spawnFlash && column.flashIntensity && column.flashIntensity > 0) {
            const x = i * settings.fontSize;
            const isUp = settings.fallDirection === 'up';
            const y = isUp ? canvas.height : 0;
            const gradientHeight = settings.fontSize * 4 * (isUp ? -1 : 1);

            const gradient = ctx.createLinearGradient(x, y, x, y + gradientHeight);
            gradient.addColorStop(0, \`rgba(255, 255, 255, \${column.flashIntensity * 0.7})\`);
            gradient.addColorStop(0.5, \`rgba(255, 255, 255, \${column.flashIntensity * 0.2})\`);
            gradient.addColorStop(1, 'transparent');
            
            ctx.fillStyle = gradient;
            ctx.fillRect(x, y, settings.fontSize, gradientHeight);
            
            column.flashIntensity -= 0.04;
        }

        let allCharsOffscreen = true;

        for (let j = 0; j < column.chars.length; j++) {
            const speed = (effectiveFallSpeed * deltaTime) / 50;
            if (settings.fallDirection === 'up') {
                column.yPositions[j] -= speed;
            } else {
                column.yPositions[j] += speed;
            }

            let charToDraw = column.chars[j];
            let isGlitched = false;
            if (settings.glitchChance > 0 && Math.random() * 100 < settings.glitchChance) {
                charToDraw = charSet[Math.floor(Math.random() * charSet.length)];
                isGlitched = true;
            }

            const y = column.yPositions[j];
            let x = i * settings.fontSize;
            
            if (settings.enableMouseInteraction && mousePosition) {
                const dx = x - mousePosition.x;
                const dy = y - mousePosition.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < settings.mouseEffectRadius) {
                    const force = 1 - (distance / settings.mouseEffectRadius);
                    const angle = Math.atan2(dy, dx);
                    const pushX = Math.cos(angle) * force * settings.mouseEffectStrength;
                    x += pushX;
                }
            }
            
            const isOffscreen = settings.fallDirection === 'up'
                ? y < -settings.fontSize
                : y > canvas.height + settings.fontSize;

            if (!isOffscreen) allCharsOffscreen = false;

            const isHead = j === column.chars.length - 1;
            
            if (isHead) {
                ctx.fillStyle = isGlitched ? '#ff4444' : settings.headColor;
                if(settings.glowEffect) {
                    ctx.shadowColor = isGlitched ? '#ff0000' : settings.tailColor;
                    ctx.shadowBlur = 10 * (effectiveBrightness / 5);
                }
            } else {
                const distanceFromHead = column.chars.length - 1 - j;
                const opacity = Math.max(0, 1 - distanceFromHead / (column.chars.length * 0.8)) * (effectiveBrightness / 7);
                const tailColorRgb = hexToRgb(settings.tailColor);
                if (tailColorRgb) {
                    const glitchStyle = \`rgba(255, 100, 100, \${opacity})\`;
                    const normalStyle = \`rgba(\${tailColorRgb.r}, \${tailColorRgb.g}, \${tailColorRgb.b}, \${opacity})\`;
                    ctx.fillStyle = isGlitched ? glitchStyle : normalStyle;
                }
            }
            if(!isOffscreen) {
                ctx.fillText(charToDraw, x, y);
            }
            ctx.shadowBlur = 0;
        }

        if(allCharsOffscreen) {
            column.isActive = false;
            column.chars = [];
            column.yPositions = [];
        }
    });
    
    processQueues();
    animationFrameId = self.requestAnimationFrame(draw);
};

self.onmessage = (event) => {
    const { type, ...data } = event.data;

    switch(type) {
        case 'init':
            canvas = data.canvas;
            ctx = canvas.getContext('2d');
            initMatrix(data.width, data.height);
            if(animationFrameId) self.cancelAnimationFrame(animationFrameId);
            animationFrameId = self.requestAnimationFrame(draw);
            break;
        case 'resize':
            initMatrix(data.width, data.height);
            break;
        case 'settings': {
            const oldFontSize = settings.fontSize;
            const oldBgColor = settings.bgColor;
            settings = data.settings;
            if (settings.fontSize !== oldFontSize || settings.bgColor !== oldBgColor) {
                initMatrix(canvas.width, canvas.height);
            }
            break;
        }
        case 'text':
            switch(settings.mode) {
                case DisplayMode.Letters:
                    queues.letters.push(...data.text.split(''));
                    break;
                case DisplayMode.Words:
                case DisplayMode.Sentences:
                    queues.words.push(...data.text.split(/\\s+/).filter((w) => w.length > 0));
                    break;
            }
            break;
        case 'volume':
            volume = data.volume;
            break;
        case 'mouse':
            mousePosition = data.position;
            break;
    }
};
`;

export const useMatrixAnimation = (
  canvasRef: React.RefObject<HTMLCanvasElement>,
  settings: MatrixSettings,
  text: string,
  volume: number,
  mousePosition: { x: number; y: number } | null
) => {
  const workerRef = useRef<Worker | null>(null);
  const workerUrlRef = useRef<string | null>(null);

  // Setup worker, canvas, and resize listener
  useEffect(() => {
    if (!canvasRef.current) return;

    // Create a Blob from the inlined worker script
    const blob = new Blob([workerScript], { type: 'application/javascript' });
    const workerUrl = URL.createObjectURL(blob);
    workerUrlRef.current = workerUrl;

    const worker = new Worker(workerUrl);
    workerRef.current = worker;

    const offscreenCanvas = canvasRef.current.transferControlToOffscreen();
    
    worker.postMessage({ 
        type: 'init', 
        canvas: offscreenCanvas,
        width: canvasRef.current.clientWidth,
        height: canvasRef.current.clientHeight,
    }, [offscreenCanvas]);

    const handleResize = () => {
        if (workerRef.current && canvasRef.current) {
            workerRef.current.postMessage({
                type: 'resize',
                width: canvasRef.current.clientWidth,
                height: canvasRef.current.clientHeight,
            });
        }
    }
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (workerRef.current) {
        workerRef.current.terminate();
        workerRef.current = null;
      }
      if (workerUrlRef.current) {
        URL.revokeObjectURL(workerUrlRef.current);
        workerUrlRef.current = null;
      }
    };
  }, [canvasRef]);

  // Send settings updates to worker
  useEffect(() => {
    if (workerRef.current) {
      workerRef.current.postMessage({ type: 'settings', settings });
    }
  }, [settings]);

  // Send text updates to worker
  useEffect(() => {
    if (workerRef.current && text) {
      workerRef.current.postMessage({ type: 'text', text });
    }
  }, [text]);

  // Send volume updates to worker
  useEffect(() => {
    if (workerRef.current) {
      workerRef.current.postMessage({ type: 'volume', volume });
    }
  }, [volume]);
  
  // Send mouse position updates to worker
  useEffect(() => {
    if (workerRef.current) {
      workerRef.current.postMessage({ type: 'mouse', position: mousePosition });
    }
  }, [mousePosition]);
};