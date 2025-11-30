import { useRealtimeStats } from '@/hooks/useRealtimeStats';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, MapPin, Smartphone, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

const colors = {
  dark: '#3d3731',
  gold: '#f5ca3c',
  white: '#ffffff',
  muted: '#6b7280',
  border: '#e5e7eb',
  success: '#22c55e',
};

export function LiveFeed() {
  const { recentParticipations, liveCount } = useRealtimeStats();

  return (
    <div 
      className="p-6 relative overflow-hidden"
      style={{ 
        background: 'rgba(255, 255, 255, 0.25)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderRadius: '18px',
        border: '1px solid rgba(255, 255, 255, 0.6)',
        boxShadow: `
          0 4px 24px rgba(0, 0, 0, 0.06),
          0 1px 2px rgba(0, 0, 0, 0.04),
          inset 0 1px 1px rgba(255, 255, 255, 0.8),
          inset 0 -1px 1px rgba(0, 0, 0, 0.02)
        `,
      }}
    >
      <div className="absolute top-0 left-2 right-2 h-[1px] pointer-events-none"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.9) 20%, rgba(255,255,255,0.9) 80%, transparent 100%)',
        }}
      />
      
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5" style={{ color: colors.gold }} />
          <h3 className="text-lg font-semibold" style={{ color: colors.dark }}>
            Activité en direct
          </h3>
        </div>
        
        <AnimatePresence>
          {liveCount > 0 && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="px-3 py-1 rounded-full flex items-center gap-2"
              style={{ 
                backgroundColor: `${colors.success}20`,
                border: `1px solid ${colors.success}40`,
              }}
            >
              <div 
                className="w-2 h-2 rounded-full animate-pulse"
                style={{ backgroundColor: colors.success }}
              />
              <span className="text-xs font-medium" style={{ color: colors.success }}>
                +{liveCount} maintenant
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="space-y-2 max-h-[400px] overflow-y-auto">
        <AnimatePresence initial={false}>
          {recentParticipations.map((participation) => (
            <motion.div
              key={participation.id}
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="p-3 rounded-xl border relative overflow-hidden group"
              style={{
                background: colors.white,
                borderColor: colors.border,
              }}
            >
              {/* Ligne animée pour les nouvelles entrées */}
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.5 }}
                className="absolute top-0 left-0 right-0 h-[2px]"
                style={{ 
                  background: `linear-gradient(90deg, transparent, ${colors.gold}, transparent)`,
                  transformOrigin: 'left',
                }}
              />
              
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {participation.email && (
                      <span 
                        className="text-sm font-medium truncate"
                        style={{ color: colors.dark }}
                      >
                        {participation.email}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-3 text-xs" style={{ color: colors.muted }}>
                    {participation.country && (
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        <span>{participation.country}</span>
                      </div>
                    )}
                    
                    {participation.device_type && (
                      <div className="flex items-center gap-1">
                        <Smartphone className="w-3 h-3" />
                        <span className="capitalize">{participation.device_type}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>
                        {formatDistanceToNow(new Date(participation.created_at), {
                          addSuffix: true,
                          locale: fr,
                        })}
                      </span>
                    </div>
                  </div>
                </div>
                
                {participation.participation_data?.result?.type === 'win' && (
                  <div 
                    className="px-2 py-1 rounded text-xs font-medium whitespace-nowrap"
                    style={{ 
                      backgroundColor: `${colors.success}15`,
                      color: colors.success,
                    }}
                  >
                    🎉 Gagnant
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {recentParticipations.length === 0 && (
          <div 
            className="text-center py-12"
            style={{ color: colors.muted }}
          >
            <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">En attente de participations...</p>
          </div>
        )}
      </div>
    </div>
  );
}
