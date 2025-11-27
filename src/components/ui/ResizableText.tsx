import React, { useState, useRef, useCallback } from 'react';

interface ResizableTextProps {
  children: React.ReactNode;
  width: number; // percentage 20-100
  onWidthChange: (width: number) => void;
  marginBottom?: string;
  disabled?: boolean;
}

// Mini resize handle component
const ResizeHandle = ({ 
  side, 
  onMouseDown, 
  isResizing 
}: { 
  side: 'left' | 'right', 
  onMouseDown: (e: React.MouseEvent) => void, 
  isResizing: boolean 
}) => (
  <div
    className={`absolute ${side === 'left' ? '-left-2' : '-right-2'} cursor-ew-resize z-50 opacity-0 group-hover:opacity-100 transition-opacity`}
    style={{ top: '50%', transform: 'translateY(-50%)' }} 
    onMouseDown={onMouseDown}
  >
    <div 
      className="w-2 h-2 rounded-full border-2 transition-all hover:scale-150"
      style={{ 
        backgroundColor: isResizing ? '#F5B800' : 'white',
        borderColor: '#F5B800',
        boxShadow: '0 1px 4px rgba(0,0,0,0.4)'
      }}
    />
  </div>
);

export const ResizableText = ({ 
  children, 
  width, 
  onWidthChange, 
  marginBottom = '0px',
  disabled = false 
}: ResizableTextProps) => {
  const [isResizing, setIsResizing] = useState(false);
  
  const handleResizeStart = useCallback((e: React.MouseEvent, side: 'left' | 'right') => {
    if (disabled) return;
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    
    const startX = e.clientX;
    const startWidth = width;
    
    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      // Use a fixed ratio: 5px = 1%
      const deltaPercent = deltaX / 5;
      
      let newWidth: number;
      if (side === 'right') {
        newWidth = startWidth + deltaPercent;
      } else {
        newWidth = startWidth - deltaPercent;
      }
      
      // Clamp between 20% and 100%
      newWidth = Math.max(20, Math.min(100, newWidth));
      onWidthChange(Math.round(newWidth));
    };
    
    const handleMouseUp = () => {
      setIsResizing(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
    
    document.body.style.cursor = 'ew-resize';
    document.body.style.userSelect = 'none';
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [disabled, width, onWidthChange]);

  return (
    <div 
      className="relative group inline-block"
      style={{ 
        width: `${width}%`, 
        transition: isResizing ? 'none' : 'width 0.15s ease-out',
        marginBottom
      }}
    >
      {!disabled && (
        <>
          <ResizeHandle 
            side="left" 
            onMouseDown={(e) => handleResizeStart(e, 'left')} 
            isResizing={isResizing} 
          />
          <ResizeHandle 
            side="right" 
            onMouseDown={(e) => handleResizeStart(e, 'right')} 
            isResizing={isResizing} 
          />
        </>
      )}
      {children}
    </div>
  );
};

export default ResizableText;
