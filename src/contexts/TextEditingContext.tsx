import { createContext, useContext, useState, ReactNode } from 'react';

export interface TextStyle {
  fontFamily: string;
  fontSize: number;
  textColor: string;
  isBold: boolean;
  isItalic: boolean;
  isUnderline: boolean;
  textAlign: 'left' | 'center' | 'right';
}

export type TextElementType = 'title' | 'subtitle' | 'description' | 'button' | null;

interface TextEditingContextType {
  // Currently selected text element
  selectedElement: TextElementType;
  selectedQuestionId: string | null;
  
  // Current styles of selected element
  currentStyle: TextStyle;
  
  // Actions
  selectTextElement: (element: TextElementType, questionId: string, style: TextStyle) => void;
  clearSelection: () => void;
  updateStyle: (updates: Partial<TextStyle>) => void;
}

const defaultStyle: TextStyle = {
  fontFamily: 'Inter',
  fontSize: 32,
  textColor: '#FFFFFF',
  isBold: false,
  isItalic: false,
  isUnderline: false,
  textAlign: 'center',
};

const TextEditingContext = createContext<TextEditingContextType | undefined>(undefined);

export const TextEditingProvider = ({ children }: { children: ReactNode }) => {
  const [selectedElement, setSelectedElement] = useState<TextElementType>(null);
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null);
  const [currentStyle, setCurrentStyle] = useState<TextStyle>(defaultStyle);

  const selectTextElement = (element: TextElementType, questionId: string, style: TextStyle) => {
    setSelectedElement(element);
    setSelectedQuestionId(questionId);
    setCurrentStyle(style);
  };

  const clearSelection = () => {
    setSelectedElement(null);
    setSelectedQuestionId(null);
    setCurrentStyle(defaultStyle);
  };

  const updateStyle = (updates: Partial<TextStyle>) => {
    setCurrentStyle(prev => ({ ...prev, ...updates }));
  };

  return (
    <TextEditingContext.Provider
      value={{
        selectedElement,
        selectedQuestionId,
        currentStyle,
        selectTextElement,
        clearSelection,
        updateStyle,
      }}
    >
      {children}
    </TextEditingContext.Provider>
  );
};

export const useTextEditing = () => {
  const context = useContext(TextEditingContext);
  
  // Return a safe default if context is not available (e.g., in preview mode)
  if (context === undefined) {
    return {
      selectedElement: null as TextElementType,
      selectedQuestionId: null as string | null,
      currentStyle: {
        fontFamily: 'Inter',
        fontSize: 32,
        textColor: '#FFFFFF',
        isBold: false,
        isItalic: false,
        isUnderline: false,
        textAlign: 'center' as const,
      },
      selectTextElement: () => {},
      clearSelection: () => {},
      updateStyle: () => {},
    };
  }
  return context;
};
