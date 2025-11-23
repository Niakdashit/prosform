import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Search, UserRound, MapPin, Phone, Type, AlignLeft, Play, Image, ListOrdered, Mail, BarChart3, Gauge, Star, Grid3x3, Calendar, List, ToggleLeft, CheckSquare, ChevronDown, Upload, FileText, Hash, Globe, CreditCard, Wallet, CalendarDays, HelpCircle, Bot, Scale, Code } from "lucide-react";

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
  contact: [
    { id: "contact-info", label: "Contact Info", icon: UserRound, color: "bg-pink-100 text-pink-600" },
    { id: "address", label: "Address", icon: MapPin, color: "bg-pink-100 text-pink-600" },
    { id: "phone", label: "Phone Number", icon: Phone, color: "bg-pink-100 text-pink-600" },
    { id: "email", label: "Email", icon: Mail, color: "bg-pink-100 text-pink-600" },
    { id: "website", label: "Website", icon: Globe, color: "bg-pink-100 text-pink-600" },
  ],
  textVideo: [
    { id: "short-text", label: "Short Text", icon: Type, color: "bg-blue-100 text-blue-600" },
    { id: "long-text", label: "Long Text", icon: AlignLeft, color: "bg-blue-100 text-blue-600" },
    { id: "statement", label: "Statement", icon: FileText, color: "bg-blue-100 text-blue-600" },
    { id: "video", label: "Video and Audio", icon: Play, color: "bg-blue-100 text-blue-600" },
  ],
  choice: [
    { id: "multiple-choice", label: "Multiple Choice", icon: List, color: "bg-purple-100 text-purple-600" },
    { id: "yes-no", label: "Yes/No", icon: ToggleLeft, color: "bg-purple-100 text-purple-600" },
    { id: "checkbox", label: "Checkbox", icon: CheckSquare, color: "bg-purple-100 text-purple-600" },
    { id: "dropdown", label: "Dropdown", icon: ChevronDown, color: "bg-purple-100 text-purple-600" },
    { id: "picture-choice", label: "Picture Choice", icon: Image, color: "bg-purple-100 text-purple-600" },
    { id: "file-upload", label: "File Upload", icon: Upload, color: "bg-purple-100 text-purple-600" },
  ],
  rating: [
    { id: "number", label: "Number", icon: Hash, color: "bg-green-100 text-green-600" },
    { id: "date", label: "Date", icon: Calendar, color: "bg-green-100 text-green-600" },
    { id: "opinion-scale", label: "Opinion Scale", icon: BarChart3, color: "bg-green-100 text-green-600" },
    { id: "nps", label: "Net Promoter Score®", icon: Gauge, color: "bg-green-100 text-green-600" },
    { id: "rating", label: "Rating", icon: Star, color: "bg-green-100 text-green-600" },
    { id: "matrix", label: "Matrix", icon: Grid3x3, color: "bg-green-100 text-green-600" },
    { id: "ranking", label: "Ranking", icon: ListOrdered, color: "bg-green-100 text-green-600" },
  ],
  integrations: [
    { id: "stripe", label: "Stripe", icon: CreditCard, color: "bg-indigo-100 text-indigo-600" },
    { id: "paypal", label: "PayPal", icon: Wallet, color: "bg-indigo-100 text-indigo-600" },
    { id: "calendly", label: "Calendly", icon: CalendarDays, color: "bg-indigo-100 text-indigo-600" },
  ],
  ai: [
    { id: "faq-with-ai", label: "FAQ with AI", icon: HelpCircle, color: "bg-violet-100 text-violet-600" },
    { id: "clarify-with-ai", label: "Clarify with AI", icon: Bot, color: "bg-violet-100 text-violet-600" },
    { id: "legal", label: "Legal", icon: Scale, color: "bg-violet-100 text-violet-600" },
    { id: "website-embed", label: "Website Embed", icon: Code, color: "bg-violet-100 text-violet-600" },
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
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Contact</h3>
              <div className="grid grid-cols-3 gap-3">
                {elementCategories.contact.map((element) => (
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
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Integrations</h3>
              <div className="grid grid-cols-3 gap-3">
                {elementCategories.integrations.map((element) => (
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
              <h3 className="text-sm font-semibold text-gray-700 mb-3">AI & Advanced</h3>
              <div className="grid grid-cols-3 gap-3">
                {elementCategories.ai.map((element) => (
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
