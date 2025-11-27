import { Sparkles, X } from "lucide-react";
import { useState, useCallback } from "react";

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

interface EditableTextBlockProps {
  value: string;
  onChange: (value: string, html?: string) => void;
  onClear?: () => void;
  onSparklesClick?: () => void;
  placeholder?: string;
  className?: string;
  style?: React.CSSProperties;
  showSparkles?: boolean;
  showClear?: boolean;
  isEditing?: boolean;
  isReadOnly?: boolean;
  onFocus?: () => void;
  onBlur?: () => void;
  fieldType?: 'title' | 'subtitle' | 'button'; // For FloatingToolbar integration
  // Resize props
  width?: number; // percentage 20-100
  onWidthChange?: (width: number) => void;
  marginBottom?: string;
}

export const EditableTextBlock = ({
  value,
  onChange,
  onClear,
  onSparklesClick,
  placeholder = "",
  className = "",
  style = {},
  showSparkles = true,
  showClear = true,
  isEditing = false,
  isReadOnly = false,
  onFocus,
  onBlur,
  fieldType = 'title',
  width = 100,
  onWidthChange,
  marginBottom = '0px',
}: EditableTextBlockProps) => {
  const [localValue, setLocalValue] = useState(value);
  const [isResizing, setIsResizing] = useState(false);

  const handleResizeStart = useCallback((e: React.MouseEvent, side: 'left' | 'right') => {
    if (isReadOnly || !onWidthChange) return;
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    
    const startX = e.clientX;
    const startWidth = width;
    
    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaPercent = deltaX / 5;
      
      let newWidth: number;
      if (side === 'right') {
        newWidth = startWidth + deltaPercent;
      } else {
        newWidth = startWidth - deltaPercent;
      }
      
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
  }, [isReadOnly, width, onWidthChange]);

  const handleBlur = (e: React.FocusEvent<HTMLDivElement>) => {
    // Ne pas blur si on clique sur les boutons Sparkles/Clear ou FloatingToolbar
    const relatedTarget = e.relatedTarget as HTMLElement;
    if (relatedTarget && (relatedTarget.closest('.editable-text-buttons') || relatedTarget.closest('.floating-toolbar'))) {
      return;
    }
    
    const newValue = e.currentTarget.textContent || "";
    const html = e.currentTarget.innerHTML;
    setLocalValue(newValue);
    onChange(newValue, html);
    onBlur?.();
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLocalValue("");
    onChange("");
    onClear?.();
    // Considérer la suppression comme une fin d'édition
    onBlur?.();
  };

  // En mode readOnly, afficher simplement le texte sans édition
  if (isReadOnly) {
    return (
      <div
        className={`transition-opacity ${className}`}
        style={{
          ...style,
          width: onWidthChange ? `${width}%` : undefined,
          padding: '4px',
          marginTop: '-4px',
          marginLeft: '-4px',
          marginRight: '-4px',
          marginBottom,
        }}
        dangerouslySetInnerHTML={{ __html: value || placeholder }}
      />
    );
  }

  return (
    <div 
      className="relative group inline-block"
      style={{ 
        width: onWidthChange ? `${width}%` : '100%',
        transition: isResizing ? 'none' : 'width 0.15s ease-out',
        marginBottom
      }}
    >
      {/* Resize handles */}
      {onWidthChange && (
        <>
          <ResizeHandle side="left" onMouseDown={(e) => handleResizeStart(e, 'left')} isResizing={isResizing} />
          <ResizeHandle side="right" onMouseDown={(e) => handleResizeStart(e, 'right')} isResizing={isResizing} />
        </>
      )}

      {isEditing && value && (
        <div className="absolute -top-3 right-0 flex items-center gap-1 z-50 animate-fade-in editable-text-buttons">
          {showSparkles && (
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={(e) => {
                e.stopPropagation();
                onSparklesClick?.();
              }}
              className="w-7 h-7 rounded-md transition-all hover:scale-110 flex items-center justify-center"
              style={{
                backgroundColor: 'rgba(245, 184, 0, 0.15)',
                color: '#F5B800',
                backdropFilter: 'blur(8px)',
              }}
            >
              <Sparkles className="w-3.5 h-3.5" />
            </button>
          )}
          {showClear && (
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={handleClear}
              className="w-7 h-7 rounded-md transition-all hover:scale-110 flex items-center justify-center"
              style={{
                backgroundColor: 'rgba(239, 68, 68, 0.15)',
                color: '#ef4444',
                backdropFilter: 'blur(8px)',
              }}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}

      <div
        data-text-editable={fieldType}
        className={`cursor-text hover:opacity-80 transition-opacity ${className}`}
        style={{
          ...style,
          outline: isEditing ? '2px solid rgba(245, 202, 60, 0.5)' : 'none',
          padding: '4px',
          margin: '-4px',
          borderRadius: '4px',
        }}
        contentEditable
        suppressContentEditableWarning
        onFocus={onFocus}
        onClick={(e) => e.stopPropagation()}
        onBlur={handleBlur}
        dangerouslySetInnerHTML={{ __html: value || placeholder }}
      />
    </div>
  );
};
