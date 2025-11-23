import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Search, Type, List, Star, Hash, Calendar, MessageSquare, Video, CheckCircle2, BarChart3, CheckSquare, SlidersHorizontal, Grid3x3, Mail, Phone, Upload, FileText, Image } from "lucide-react";

interface AddContentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectElement: (type: string) => void;
}

const elementCategories = {
  recommended: [
    { id: "short-text", label: "Short Text", icon: Type, color: "bg-blue-100 text-blue-600" },
    { id: "multiple-choice", label: "Multiple Choice", icon: List, color: "bg-purple-100 text-purple-600" },
  ],
  choice: [
    { id: "multiple-choice", label: "Multiple Choice", icon: List, color: "bg-purple-100 text-purple-600" },
    { id: "picture-choice", label: "Picture Choice", icon: Image, color: "bg-purple-100 text-purple-600" },
    { id: "dropdown", label: "Dropdown", icon: SlidersHorizontal, color: "bg-purple-100 text-purple-600" },
    { id: "yes-no", label: "Yes/No", icon: CheckCircle2, color: "bg-purple-100 text-purple-600" },
  ],
  rating: [
    { id: "rating", label: "Rating", icon: Star, color: "bg-green-100 text-green-600" },
    { id: "opinion-scale", label: "Opinion Scale", icon: BarChart3, color: "bg-green-100 text-green-600" },
    { id: "ranking", label: "Ranking", icon: Grid3x3, color: "bg-green-100 text-green-600" },
  ],
  textVideo: [
    { id: "long-text", label: "Long Text", icon: MessageSquare, color: "bg-blue-100 text-blue-600" },
    { id: "short-text", label: "Short Text", icon: Type, color: "bg-blue-100 text-blue-600" },
    { id: "video", label: "Video and Audio", icon: Video, color: "bg-blue-100 text-blue-600" },
  ],
  input: [
    { id: "email", label: "Email", icon: Mail, color: "bg-orange-100 text-orange-600" },
    { id: "phone", label: "Phone Number", icon: Phone, color: "bg-orange-100 text-orange-600" },
    { id: "number", label: "Number", icon: Hash, color: "bg-yellow-100 text-yellow-600" },
    { id: "date", label: "Date", icon: Calendar, color: "bg-yellow-100 text-yellow-600" },
  ],
  other: [
    { id: "file-upload", label: "File Upload", icon: Upload, color: "bg-red-100 text-red-600" },
    { id: "statement", label: "Statement", icon: FileText, color: "bg-gray-100 text-gray-600" },
    { id: "checkbox", label: "Checkbox", icon: CheckSquare, color: "bg-purple-100 text-purple-600" },
  ],
};

export const AddContentModal = ({ isOpen, onClose, onSelectElement }: AddContentModalProps) => {
  const handleSelect = (elementId: string) => {
    onSelectElement(elementId);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Add form elements</DialogTitle>
        </DialogHeader>

        <div className="mt-4">
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Search form elements"
              className="pl-10"
            />
          </div>

          <div className="space-y-8">
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Recommended</h3>
              <div className="grid grid-cols-3 gap-3">
                {elementCategories.recommended.map((element) => (
                  <button
                    key={element.id}
                    onClick={() => handleSelect(element.id)}
                    className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all text-left"
                  >
                    <div className={`w-10 h-10 rounded-lg ${element.color} flex items-center justify-center flex-shrink-0`}>
                      <element.icon className="w-5 h-5" />
                    </div>
                    <span className="font-medium text-sm">{element.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Choice</h3>
              <div className="grid grid-cols-3 gap-3">
                {elementCategories.choice.map((element) => (
                  <button
                    key={element.id}
                    onClick={() => handleSelect(element.id)}
                    className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all text-left"
                  >
                    <div className={`w-10 h-10 rounded-lg ${element.color} flex items-center justify-center flex-shrink-0`}>
                      <element.icon className="w-5 h-5" />
                    </div>
                    <span className="font-medium text-sm">{element.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Rating & ranking</h3>
              <div className="grid grid-cols-3 gap-3">
                {elementCategories.rating.map((element) => (
                  <button
                    key={element.id}
                    onClick={() => handleSelect(element.id)}
                    className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all text-left"
                  >
                    <div className={`w-10 h-10 rounded-lg ${element.color} flex items-center justify-center flex-shrink-0`}>
                      <element.icon className="w-5 h-5" />
                    </div>
                    <span className="font-medium text-sm">{element.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Text & Video</h3>
              <div className="grid grid-cols-3 gap-3">
                {elementCategories.textVideo.map((element) => (
                  <button
                    key={element.id}
                    onClick={() => handleSelect(element.id)}
                    className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all text-left"
                  >
                    <div className={`w-10 h-10 rounded-lg ${element.color} flex items-center justify-center flex-shrink-0`}>
                      <element.icon className="w-5 h-5" />
                    </div>
                    <span className="font-medium text-sm">{element.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Input fields</h3>
              <div className="grid grid-cols-3 gap-3">
                {elementCategories.input.map((element) => (
                  <button
                    key={element.id}
                    onClick={() => handleSelect(element.id)}
                    className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all text-left"
                  >
                    <div className={`w-10 h-10 rounded-lg ${element.color} flex items-center justify-center flex-shrink-0`}>
                      <element.icon className="w-5 h-5" />
                    </div>
                    <span className="font-medium text-sm">{element.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Other</h3>
              <div className="grid grid-cols-3 gap-3">
                {elementCategories.other.map((element) => (
                  <button
                    key={element.id}
                    onClick={() => handleSelect(element.id)}
                    className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all text-left"
                  >
                    <div className={`w-10 h-10 rounded-lg ${element.color} flex items-center justify-center flex-shrink-0`}>
                      <element.icon className="w-5 h-5" />
                    </div>
                    <span className="font-medium text-sm">{element.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
