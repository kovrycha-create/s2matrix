
import React, { useRef, memo } from 'react';
import { useMatrixAnimation } from '../hooks/useMatrixAnimation';
import { MatrixSettings } from '../types';

interface MatrixCanvasProps {
  settings: MatrixSettings;
  text: string;
  volume: number;
  mousePosition: { x: number; y: number } | null;
}

const MatrixCanvas: React.FC<MatrixCanvasProps> = ({ settings, text, volume, mousePosition }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useMatrixAnimation(canvasRef, settings, text, volume, mousePosition);

  return <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full" />;
};

export default memo(MatrixCanvas);
