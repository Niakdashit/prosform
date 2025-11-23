import { Clock } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#372F15' }}>
      {/* Logo */}
      <div className="absolute top-8 left-8">
        <div className="grid grid-cols-2 gap-1">
          <div className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: '#EDDE7D' }} />
          <div className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: '#EDDE7D' }} />
          <div className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: '#EDDE7D' }} />
          <div className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: '#EDDE7D' }} />
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full max-w-[1440px] px-12">
        <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-16 items-center">
          {/* Left Column - Text */}
          <div className="flex flex-col">
            <h1 
              className="font-bold mb-6 leading-[0.95]" 
              style={{ 
                color: '#EDDE7D', 
                fontSize: '80px',
                letterSpacing: '-0.03em',
                fontWeight: 700
              }}
            >
              How are we doing?
            </h1>
            
            <p 
              className="text-[17px] mb-12 leading-[1.6]" 
              style={{ color: 'rgba(237, 222, 125, 0.7)' }}
            >
              Your feedback helps us build an even better place to work.
            </p>
            
            <button
              className="flex items-center gap-3 px-8 font-semibold transition-opacity hover:opacity-90 w-fit"
              style={{ 
                backgroundColor: '#EDDE7D', 
                color: '#372F15',
                height: '56px',
                borderRadius: '28px',
                fontSize: '17px',
                border: 'none',
                boxShadow: 'none'
              }}
            >
              <span>Give feedback</span>
              <span className="font-normal" style={{ color: 'rgba(55, 47, 21, 0.5)', fontSize: '14px' }}>
                press <strong style={{ fontWeight: 600 }}>Enter</strong> ↵
              </span>
            </button>
            
            <div className="flex items-center gap-2.5 mt-5" style={{ color: 'rgba(237, 222, 125, 0.6)', fontSize: '14px' }}>
              <Clock className="w-4 h-4" />
              <span>Takes 30 sec</span>
            </div>
          </div>

          {/* Right Column - Image */}
          <div className="flex items-center justify-center">
            <div
              className="overflow-hidden rounded-[32px]"
              style={{ 
                width: '520px', 
                height: '520px',
                maxWidth: '100%'
              }}
            >
              <img
                src="https://images.unsplash.com/photo-1635322966219-b75ed372eb01?w=1600&h=1600&fit=crop"
                alt="Feedback illustration"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
