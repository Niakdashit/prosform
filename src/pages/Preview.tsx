import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const Preview = () => {
  const [formData, setFormData] = useState<any>(null);

  useEffect(() => {
    // Load initial form data
    const loadFormData = () => {
      const stored = localStorage.getItem('formPreviewData');
      if (stored) {
        setFormData(JSON.parse(stored));
      }
    };

    loadFormData();

    // Listen for changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'formPreviewData' && e.newValue) {
        setFormData(JSON.parse(e.newValue));
      }
    };

    // Listen for same-tab updates
    const handleCustomEvent = (e: CustomEvent) => {
      setFormData(e.detail);
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('formPreviewUpdate' as any, handleCustomEvent);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('formPreviewUpdate' as any, handleCustomEvent);
    };
  }, []);

  if (!formData) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-background">
        <div className="text-muted-foreground">Chargement de la prévisualisation...</div>
      </div>
    );
  }

  const { theme, questions, currentQuestionIndex, layout, isMobileResponsive } = formData;

  // Calculate scale for responsive preview
  const getScale = () => {
    if (!isMobileResponsive) return 1;

    const baseWidth = layout === 'mobile' ? 375 : 1100;
    const baseHeight = layout === 'mobile' ? 667 : 620;
    
    const scaleX = window.innerWidth / baseWidth;
    const scaleY = window.innerHeight / baseHeight;
    
    return Math.min(scaleX, scaleY, 1);
  };

  const [scale, setScale] = useState(getScale());

  useEffect(() => {
    const handleResize = () => setScale(getScale());
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isMobileResponsive, layout]);

  const currentQuestion = questions[currentQuestionIndex];
  const containerWidth = layout === 'mobile' ? 375 : 1100;
  const containerHeight = layout === 'mobile' ? 667 : 620;

  return (
    <div 
      className="w-screen h-screen flex items-center justify-center overflow-hidden"
      style={{ 
        backgroundColor: isMobileResponsive ? theme.backgroundColor : '#1a1a1a'
      }}
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="relative"
        style={{
          width: `${containerWidth}px`,
          height: `${containerHeight}px`,
          transform: isMobileResponsive ? `scale(${scale})` : 'none',
          transformOrigin: 'center center',
        }}
      >
        <div
          className="w-full h-full rounded-lg shadow-2xl overflow-hidden relative"
          style={{
            backgroundColor: theme.backgroundColor,
            fontFamily: theme.fontFamily,
          }}
        >
          {theme.backgroundImage && (
            <div
              className="absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{
                backgroundImage: `url(${theme.backgroundImage})`,
                opacity: theme.backgroundOpacity / 100,
              }}
            />
          )}

          <div className="relative z-10 w-full h-full flex items-center justify-center p-8">
            <motion.div
              key={currentQuestionIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="w-full max-w-2xl"
            >
              <h2
                className="text-3xl font-bold mb-6 text-center"
                style={{
                  color: theme.textColor,
                  fontSize: `${theme.titleSize}px`,
                }}
              >
                {currentQuestion.title}
              </h2>

              {currentQuestion.description && (
                <p
                  className="mb-8 text-center"
                  style={{
                    color: theme.textColor,
                    opacity: 0.8,
                    fontSize: `${theme.descriptionSize}px`,
                  }}
                >
                  {currentQuestion.description}
                </p>
              )}

              {currentQuestion.image && (
                <div className="mb-6 flex justify-center">
                  <img
                    src={currentQuestion.image}
                    alt="Question"
                    className="max-w-full h-auto rounded-lg"
                    style={{ maxHeight: '300px' }}
                  />
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Preview;
