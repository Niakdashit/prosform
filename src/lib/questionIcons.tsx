import { 
  UserRound, 
  MapPin, 
  Phone, 
  Type, 
  AlignLeft, 
  Play, 
  Image, 
  ListOrdered, 
  Mail, 
  BarChart3, 
  Gauge, 
  Star, 
  Grid3x3, 
  Calendar, 
  List, 
  ToggleLeft, 
  CheckSquare, 
  ChevronDown, 
  Upload, 
  FileText, 
  Hash, 
  Globe,
  LucideIcon,
  Layers
} from "lucide-react";
import { Question } from "@/components/FormBuilder";

export const questionIconMap: Record<string, { icon: LucideIcon; color: string }> = {
  // Contact
  "contact-info": { icon: UserRound, color: "bg-pink-100 text-pink-600" },
  "address": { icon: MapPin, color: "bg-pink-100 text-pink-600" },
  "phone": { icon: Phone, color: "bg-pink-100 text-pink-600" },
  "email": { icon: Mail, color: "bg-pink-100 text-pink-600" },
  "website": { icon: Globe, color: "bg-pink-100 text-pink-600" },
  
  // Text & Video
  "short-text": { icon: Type, color: "bg-blue-100 text-blue-600" },
  "long-text": { icon: AlignLeft, color: "bg-blue-100 text-blue-600" },
  "statement": { icon: FileText, color: "bg-blue-100 text-blue-600" },
  "video": { icon: Play, color: "bg-blue-100 text-blue-600" },
  
  // Choice
  "multiple-choice": { icon: List, color: "bg-purple-100 text-purple-600" },
  "yes-no": { icon: ToggleLeft, color: "bg-purple-100 text-purple-600" },
  "checkbox": { icon: CheckSquare, color: "bg-purple-100 text-purple-600" },
  "dropdown": { icon: ChevronDown, color: "bg-purple-100 text-purple-600" },
  "picture-choice": { icon: Image, color: "bg-purple-100 text-purple-600" },
  "file-upload": { icon: Upload, color: "bg-purple-100 text-purple-600" },
  
  // Rating & Ranking
  "number": { icon: Hash, color: "bg-green-100 text-green-600" },
  "date": { icon: Calendar, color: "bg-green-100 text-green-600" },
  "opinion-scale": { icon: BarChart3, color: "bg-green-100 text-green-600" },
  "nps": { icon: Gauge, color: "bg-green-100 text-green-600" },
  "rating": { icon: Star, color: "bg-green-100 text-green-600" },
  "matrix": { icon: Grid3x3, color: "bg-green-100 text-green-600" },
  "ranking": { icon: ListOrdered, color: "bg-green-100 text-green-600" },
  
  // Default
  "welcome": { icon: Layers, color: "bg-gray-100 text-gray-600" },
  "ending": { icon: Layers, color: "bg-gray-100 text-gray-600" },
  
  // Aliases for Question types
  "text": { icon: Type, color: "bg-blue-100 text-blue-600" },
  "choice": { icon: List, color: "bg-purple-100 text-purple-600" },
  "yesno": { icon: ToggleLeft, color: "bg-purple-100 text-purple-600" },
  "file": { icon: Upload, color: "bg-purple-100 text-purple-600" },
};

export const getQuestionIcon = (question: Question | string) => {
  // If it's a Question object, determine the icon based on type and variant
  if (typeof question === 'object') {
    const { type, variant } = question;
    
    // Handle text variations
    if (type === 'text') {
      return variant === 'long' 
        ? questionIconMap["long-text"] 
        : questionIconMap["short-text"];
    }
    
    // Handle rating variations
    if (type === 'rating') {
      if (variant === 'scale') return questionIconMap["opinion-scale"];
      if (variant === 'ranking') return questionIconMap["ranking"];
      return questionIconMap["rating"];
    }
    
    // Handle choice as multiple-choice
    if (type === 'choice') {
      return questionIconMap["multiple-choice"];
    }
    
    // Handle yesno
    if (type === 'yesno') {
      return questionIconMap["yes-no"];
    }
    
    // Handle file
    if (type === 'file') {
      return questionIconMap["file-upload"];
    }
    
    // Handle picture-choice
    if (type === 'picture-choice') {
      return questionIconMap["picture-choice"];
    }
    
    // Default lookup by type
    return questionIconMap[type] || questionIconMap["short-text"];
  }
  
  // If it's a string, just look it up
  return questionIconMap[question] || questionIconMap["short-text"];
};

