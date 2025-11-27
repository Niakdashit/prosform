import React, { useRef, useEffect, useState, useCallback } from 'react';
import './SmartScratch.css';

interface SmartScratchProps {
  width?: number;
  height?: number;
  scratchColor?: string;
  revealContent?: React.ReactNode;
  revealImage?: string;
  revealText?: string;
  onComplete?: (percentage: number) => void;
  threshold?: number;
  brushSize?: number;
  disabled?: boolean;
  showProgress?: boolean;
  borderRadius?: number;
}

export const SmartScratch: React.FC<SmartScratchProps> = ({
  width = 300,
  height = 200,
  scratchColor = '#C0C0C0',
  revealContent,
  revealImage,
  revealText = '🎉 Gagné !',
  onComplete,
  threshold = 70,
  brushSize = 30,
  disabled = false,
  showProgress = true,
  borderRadius = 16
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isScratching, setIsScratching] = useState(false);
  const [scratchPercentage, setScratchPercentage] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const lastPosRef = useRef<{ x: number; y: number } | null>(null);

  // Initialiser le canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Remplir avec la couleur de grattage
    ctx.fillStyle = scratchColor;
    ctx.fillRect(0, 0, width, height);

    // Ajouter un pattern de texture
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    for (let i = 0; i < width; i += 4) {
      for (let j = 0; j < height; j += 4) {
        if (Math.random() > 0.5) {
          ctx.fillRect(i, j, 2, 2);
        }
      }
    }
  }, [width, height, scratchColor]);

  const calculateProgress = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return 0;

    const ctx = canvas.getContext('2d');
    if (!ctx) return 0;

    const imageData = ctx.getImageData(0, 0, width, height);
    const pixels = imageData.data;
    let transparentPixels = 0;

    for (let i = 3; i < pixels.length; i += 4) {
      if (pixels[i] === 0) {
        transparentPixels++;
      }
    }

    return (transparentPixels / (width * height)) * 100;
  }, [width, height]);

  const scratch = useCallback((x: number, y: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();

    if (lastPosRef.current) {
      ctx.moveTo(lastPosRef.current.x, lastPosRef.current.y);
      ctx.lineTo(x, y);
      ctx.lineWidth = brushSize;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.stroke();
    }

    ctx.arc(x, y, brushSize / 2, 0, Math.PI * 2);
    ctx.fill();

    lastPosRef.current = { x, y };

    const progress = calculateProgress();
    setScratchPercentage(progress);

    if (progress >= threshold && !isCompleted) {
      setIsCompleted(true);
      onComplete?.(progress);
    }
  }, [brushSize, calculateProgress, threshold, isCompleted, onComplete]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (disabled || isCompleted) return;
    setIsScratching(true);
    setHasStarted(true);
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      lastPosRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    }
  }, [disabled, isCompleted]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isScratching || disabled || isCompleted) return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      scratch(e.clientX - rect.left, e.clientY - rect.top);
    }
  }, [isScratching, disabled, isCompleted, scratch]);

  const handleMouseUp = useCallback(() => {
    setIsScratching(false);
    lastPosRef.current = null;
  }, []);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (disabled || isCompleted) return;
    e.preventDefault();
    setIsScratching(true);
    setHasStarted(true);
    const touch = e.touches[0];
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      lastPosRef.current = {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top
      };
    }
  }, [disabled, isCompleted]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isScratching || disabled || isCompleted) return;
    e.preventDefault();
    const touch = e.touches[0];
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      scratch(touch.clientX - rect.left, touch.clientY - rect.top);
    }
  }, [isScratching, disabled, isCompleted, scratch]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    setIsScratching(false);
    lastPosRef.current = null;
  }, []);

  return (
    <div 
      className="smart-scratch-container"
      style={{ 
        width, 
        height,
        borderRadius
      }}
    >
      {/* Contenu révélé */}
      <div className="reveal-content">
        {revealContent || (
          revealImage ? (
            <img src={revealImage} alt="Prize" className="reveal-image" />
          ) : (
            <div className="reveal-text">{revealText}</div>
          )
        )}
      </div>

      {/* Canvas de grattage */}
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="scratch-canvas"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          cursor: disabled || isCompleted ? 'not-allowed' : (isScratching ? 'grabbing' : 'grab'),
          borderRadius
        }}
      />

      {/* Barre de progression */}
      {showProgress && hasStarted && !isCompleted && (
        <div className="progress-bar">
          <div 
            className="progress-fill"
            style={{ width: `${Math.min(scratchPercentage, 100)}%` }}
          />
        </div>
      )}
    </div>
  );
};

export default SmartScratch;
