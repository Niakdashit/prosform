import { useState } from "react";
import { Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, Minus, Plus, ChevronDown } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface TextToolbarProps {
  fontFamily?: string;
  fontSize?: number;
  textColor?: string;
  isBold?: boolean;
  isItalic?: boolean;
  isUnderline?: boolean;
  textAlign?: 'left' | 'center' | 'right';
  onFontFamilyChange?: (font: string) => void;
  onFontSizeChange?: (size: number) => void;
  onTextColorChange?: (color: string) => void;
  onBoldChange?: (bold: boolean) => void;
  onItalicChange?: (italic: boolean) => void;
  onUnderlineChange?: (underline: boolean) => void;
  onTextAlignChange?: (align: 'left' | 'center' | 'right') => void;
}

const FONT_FAMILIES = [
  { value: 'Inter', label: 'Inter' },
  { value: 'Open Sans', label: 'Open Sans' },
  { value: 'Roboto', label: 'Roboto' },
  { value: 'Poppins', label: 'Poppins' },
  { value: 'Montserrat', label: 'Montserrat' },
  { value: 'Lato', label: 'Lato' },
  { value: 'Playfair Display', label: 'Playfair Display' },
  { value: 'Merriweather', label: 'Merriweather' },
  { value: 'Source Sans Pro', label: 'Source Sans Pro' },
  { value: 'Nunito', label: 'Nunito' },
];

const FONT_SIZES = [12, 14, 16, 18, 20, 24, 28, 32, 36, 40, 48, 56, 64, 72];

const PRESET_COLORS = [
  '#FFFFFF', '#000000', '#F5B800', '#FF6B6B', '#4ECDC4', 
  '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8'
];

export const TextToolbar = ({
  fontFamily = 'Inter',
  fontSize = 48,
  textColor = '#FFFFFF',
  isBold = false,
  isItalic = false,
  isUnderline = false,
  textAlign = 'center',
  onFontFamilyChange,
  onFontSizeChange,
  onTextColorChange,
  onBoldChange,
  onItalicChange,
  onUnderlineChange,
  onTextAlignChange,
}: TextToolbarProps) => {
  const [fontOpen, setFontOpen] = useState(false);
  const [sizeOpen, setSizeOpen] = useState(false);
  const [colorOpen, setColorOpen] = useState(false);

  const decreaseSize = () => {
    console.log('decreaseSize called, current fontSize:', fontSize);
    const currentIndex = FONT_SIZES.indexOf(fontSize);
    if (currentIndex > 0) {
      console.log('Calling onFontSizeChange with:', FONT_SIZES[currentIndex - 1]);
      onFontSizeChange?.(FONT_SIZES[currentIndex - 1]);
    } else if (fontSize > FONT_SIZES[0]) {
      console.log('Calling onFontSizeChange with:', fontSize - 2);
      onFontSizeChange?.(fontSize - 2);
    }
  };

  const increaseSize = () => {
    console.log('increaseSize called, current fontSize:', fontSize);
    const currentIndex = FONT_SIZES.indexOf(fontSize);
    if (currentIndex < FONT_SIZES.length - 1 && currentIndex !== -1) {
      console.log('Calling onFontSizeChange with:', FONT_SIZES[currentIndex + 1]);
      onFontSizeChange?.(FONT_SIZES[currentIndex + 1]);
    } else if (fontSize < FONT_SIZES[FONT_SIZES.length - 1]) {
      console.log('Calling onFontSizeChange with:', fontSize + 2);
      onFontSizeChange?.(fontSize + 2);
    }
  };

  return (
    <div 
      className="text-toolbar inline-flex items-center gap-0.5 rounded-lg px-2 py-1"
      style={{ 
        backgroundColor: '#3D3731',
        border: '1px solid rgba(245, 184, 0, 0.25)',
        boxShadow: '0 4px 16px rgba(0,0,0,0.25)'
      }}
    >
      {/* Font Family Selector */}
      <Popover open={fontOpen} onOpenChange={setFontOpen}>
        <PopoverTrigger asChild>
          <button
            onMouseDown={(e) => e.preventDefault()}
            className="flex items-center gap-2 px-2.5 py-1 rounded-md hover:bg-white/10 transition-colors min-w-[120px]"
          >
            <span className="text-xs text-white truncate" style={{ fontFamily }}>
              {fontFamily}
            </span>
            <ChevronDown className="w-3 h-3 text-white/60 flex-shrink-0" />
          </button>
        </PopoverTrigger>
        <PopoverContent 
          className="w-48 p-1 border-0"
          style={{ backgroundColor: 'rgba(30, 27, 24, 0.98)', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}
        >
          <div className="max-h-64 overflow-y-auto">
            {FONT_FAMILIES.map((font) => (
              <button
                key={font.value}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  onFontFamilyChange?.(font.value);
                  setFontOpen(false);
                }}
                className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                  fontFamily === font.value 
                    ? 'bg-[#F5B800]/20 text-[#F5B800]' 
                    : 'text-white hover:bg-white/10'
                }`}
                style={{ fontFamily: font.value }}
              >
                {font.label}
              </button>
            ))}
          </div>
        </PopoverContent>
      </Popover>

      {/* Separator */}
      <div className="w-px h-5 bg-white/20 mx-1" />

      {/* Font Size Controls */}
      <div className="flex items-center gap-0.5">
        <button
          onMouseDown={(e) => e.preventDefault()}
          onClick={decreaseSize}
          className="p-1 rounded-md hover:bg-white/10 transition-colors"
        >
          <Minus className="w-3 h-3 text-white/80" />
        </button>
        
        <Popover open={sizeOpen} onOpenChange={setSizeOpen}>
          <PopoverTrigger asChild>
            <button
              onMouseDown={(e) => e.preventDefault()}
              className="flex items-center gap-1 px-2 py-1 rounded-md hover:bg-white/10 transition-colors min-w-[44px] justify-center"
            >
              <span className="text-xs text-white font-medium">{fontSize}</span>
              <ChevronDown className="w-3 h-3 text-white/60" />
            </button>
          </PopoverTrigger>
          <PopoverContent 
            className="w-20 p-1 border-0"
            style={{ backgroundColor: 'rgba(30, 27, 24, 0.98)', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}
          >
            <div className="max-h-48 overflow-y-auto">
              {FONT_SIZES.map((size) => (
                <button
                  key={size}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    onFontSizeChange?.(size);
                    setSizeOpen(false);
                  }}
                  className={`w-full text-center px-2 py-1.5 text-sm rounded-md transition-colors ${
                    fontSize === size 
                      ? 'bg-[#F5B800]/20 text-[#F5B800]' 
                      : 'text-white hover:bg-white/10'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        <button
          onMouseDown={(e) => e.preventDefault()}
          onClick={increaseSize}
          className="p-1 rounded-md hover:bg-white/10 transition-colors"
        >
          <Plus className="w-3 h-3 text-white/80" />
        </button>
      </div>

      {/* Separator */}
      <div className="w-px h-5 bg-white/20 mx-1" />

      {/* Text Color */}
      <Popover open={colorOpen} onOpenChange={setColorOpen}>
        <PopoverTrigger asChild>
          <button
            onMouseDown={(e) => e.preventDefault()}
            className="flex items-center gap-1.5 p-1 rounded-md hover:bg-white/10 transition-colors"
          >
            <span className="text-sm text-white font-bold">T</span>
            <div 
              className="w-4 h-4 rounded border border-white/30"
              style={{ backgroundColor: textColor }}
            />
          </button>
        </PopoverTrigger>
        <PopoverContent 
          className="w-auto p-3 border-0"
          style={{ backgroundColor: 'rgba(30, 27, 24, 0.98)', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}
        >
          <div className="grid grid-cols-5 gap-2">
            {PRESET_COLORS.map((color) => (
              <button
                key={color}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  onTextColorChange?.(color);
                  setColorOpen(false);
                }}
                className={`w-7 h-7 rounded-md border-2 transition-all hover:scale-110 ${
                  textColor === color ? 'border-[#F5B800]' : 'border-transparent'
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
          <div className="mt-3 pt-3 border-t border-white/10">
            <label className="flex items-center gap-2" onMouseDown={(e) => e.preventDefault()}>
              <span className="text-xs text-white/60">Custom:</span>
              <input
                type="color"
                value={textColor}
                onMouseDown={(e) => e.stopPropagation()}
                onChange={(e) => onTextColorChange?.(e.target.value)}
                className="w-8 h-6 rounded cursor-pointer bg-transparent border-0"
              />
              <span className="text-xs text-white/80 uppercase">{textColor}</span>
            </label>
          </div>
        </PopoverContent>
      </Popover>

      {/* Separator */}
      <div className="w-px h-6 bg-white/20 mx-1" />

      {/* Text Style Buttons */}
      <div className="flex items-center gap-0.5">
        <button
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => onBoldChange?.(!isBold)}
          className={`p-1.5 rounded-md transition-colors ${
            isBold ? 'bg-[#F5B800]/20 text-[#F5B800]' : 'text-white/80 hover:bg-white/10'
          }`}
        >
          <Bold className="w-4 h-4" />
        </button>
        <button
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => onItalicChange?.(!isItalic)}
          className={`p-1.5 rounded-md transition-colors ${
            isItalic ? 'bg-[#F5B800]/20 text-[#F5B800]' : 'text-white/80 hover:bg-white/10'
          }`}
        >
          <Italic className="w-4 h-4" />
        </button>
        <button
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => onUnderlineChange?.(!isUnderline)}
          className={`p-1.5 rounded-md transition-colors ${
            isUnderline ? 'bg-[#F5B800]/20 text-[#F5B800]' : 'text-white/80 hover:bg-white/10'
          }`}
        >
          <Underline className="w-4 h-4" />
        </button>
      </div>

      {/* Separator */}
      <div className="w-px h-6 bg-white/20 mx-1" />

      {/* Text Alignment */}
      <div className="flex items-center gap-0.5">
        <button
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => onTextAlignChange?.('left')}
          className={`p-1.5 rounded-md transition-colors ${
            textAlign === 'left' ? 'bg-[#F5B800]/20 text-[#F5B800]' : 'text-white/80 hover:bg-white/10'
          }`}
        >
          <AlignLeft className="w-4 h-4" />
        </button>
        <button
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => onTextAlignChange?.('center')}
          className={`p-1.5 rounded-md transition-colors ${
            textAlign === 'center' ? 'bg-[#F5B800]/20 text-[#F5B800]' : 'text-white/80 hover:bg-white/10'
          }`}
        >
          <AlignCenter className="w-4 h-4" />
        </button>
        <button
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => onTextAlignChange?.('right')}
          className={`p-1.5 rounded-md transition-colors ${
            textAlign === 'right' ? 'bg-[#F5B800]/20 text-[#F5B800]' : 'text-white/80 hover:bg-white/10'
          }`}
        >
          <AlignRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default TextToolbar;
