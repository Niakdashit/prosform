import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { User, Building, CreditCard, Bell, Shield, Palette, Globe, Key } from "lucide-react";

const colors = {
  dark: '#3d3731',
  gold: '#f5ca3c',
  background: '#f3f4f6',
  border: '#e5e7eb',
  white: '#ffffff',
  muted: '#6b7280',
};

const settingsSections = [
  { id: 'profile', label: 'Profil', icon: User, description: 'Informations personnelles' },
  { id: 'company', label: 'Entreprise', icon: Building, description: 'Informations de votre organisation' },
  { id: 'billing', label: 'Facturation', icon: CreditCard, description: 'Abonnement et paiements' },
  { id: 'notifications', label: 'Notifications', icon: Bell, description: 'Préférences de notifications' },
  { id: 'security', label: 'Sécurité', icon: Shield, description: 'Mot de passe et authentification' },
  { id: 'branding', label: 'Personnalisation', icon: Palette, description: 'Logo et couleurs par défaut' },
  { id: 'domains', label: 'Domaines', icon: Globe, description: 'Domaines personnalisés' },
  { id: 'api', label: 'API', icon: Key, description: 'Clés API et intégrations' },
];

const SettingsPage = () => {
  const [activeSection, setActiveSection] = useState('profile');

  return (
    <AppLayout>
      <div style={{ fontFamily: "'DM Sans', sans-serif" }}>
        {/* Page title */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold" style={{ color: colors.dark }}>
            Paramètres
          </h1>
          <p className="text-sm mt-1" style={{ color: colors.muted }}>
            Gérez votre compte et vos préférences
          </p>
        </div>

        <div className="flex gap-6">
          {/* Settings navigation */}
          <div 
            className="w-64 flex-shrink-0"
            style={{ 
              backgroundColor: colors.white, 
              borderRadius: '8px',
              border: `1px solid ${colors.border}`,
              overflow: 'hidden',
            }}
          >
            {settingsSections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors"
                style={{ 
                  backgroundColor: activeSection === section.id ? colors.background : 'transparent',
                  borderLeft: activeSection === section.id ? `3px solid ${colors.gold}` : '3px solid transparent',
                }}
              >
                <section.icon 
                  className="w-4 h-4" 
                  style={{ color: activeSection === section.id ? colors.gold : colors.muted }} 
                />
                <div>
                  <p 
                    className="text-sm font-medium"
                    style={{ color: activeSection === section.id ? colors.dark : colors.muted }}
                  >
                    {section.label}
                  </p>
                </div>
              </button>
            ))}
          </div>

          {/* Settings content */}
          <div 
            className="flex-1 p-6"
            style={{ 
              backgroundColor: colors.white, 
              borderRadius: '8px',
              border: `1px solid ${colors.border}`,
            }}
          >
            {activeSection === 'profile' && (
              <div>
                <h2 className="text-lg font-semibold mb-4" style={{ color: colors.dark }}>
                  Profil
                </h2>
                
                <div className="flex items-center gap-4 mb-6">
                  <div 
                    className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-medium"
                    style={{ backgroundColor: colors.dark, color: colors.white }}
                  >
                    JN
                  </div>
                  <div>
                    <button
                      className="text-xs font-medium px-3 py-1.5 rounded-md"
                      style={{ backgroundColor: colors.background, color: colors.dark }}
                    >
                      Changer la photo
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium mb-1.5" style={{ color: colors.muted }}>
                        Prénom
                      </label>
                      <input
                        type="text"
                        defaultValue="Jonathan"
                        className="w-full h-9 px-3 text-sm rounded-md outline-none"
                        style={{ 
                          border: `1px solid ${colors.border}`,
                          color: colors.dark,
                        }}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1.5" style={{ color: colors.muted }}>
                        Nom
                      </label>
                      <input
                        type="text"
                        defaultValue="Nzaumakoso"
                        className="w-full h-9 px-3 text-sm rounded-md outline-none"
                        style={{ 
                          border: `1px solid ${colors.border}`,
                          color: colors.dark,
                        }}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium mb-1.5" style={{ color: colors.muted }}>
                      Email
                    </label>
                    <input
                      type="email"
                      defaultValue="jonathan@prosplay.com"
                      className="w-full h-9 px-3 text-sm rounded-md outline-none"
                      style={{ 
                        border: `1px solid ${colors.border}`,
                        color: colors.dark,
                      }}
                    />
                  </div>
                </div>

                <div className="mt-6 pt-6" style={{ borderTop: `1px solid ${colors.border}` }}>
                  <button
                    className="h-8 px-4 text-xs font-medium rounded-md"
                    style={{ backgroundColor: colors.gold, color: colors.dark }}
                  >
                    Enregistrer
                  </button>
                </div>
              </div>
            )}

            {activeSection !== 'profile' && (
              <div className="flex flex-col items-center justify-center py-12">
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center mb-4"
                  style={{ backgroundColor: colors.background }}
                >
                  {settingsSections.find(s => s.id === activeSection)?.icon && (
                    <span style={{ color: colors.muted }}>
                      {(() => {
                        const Icon = settingsSections.find(s => s.id === activeSection)?.icon;
                        return Icon ? <Icon className="w-6 h-6" /> : null;
                      })()}
                    </span>
                  )}
                </div>
                <p className="font-medium" style={{ color: colors.dark }}>
                  {settingsSections.find(s => s.id === activeSection)?.label}
                </p>
                <p className="text-sm mt-1" style={{ color: colors.muted }}>
                  Cette section sera disponible prochainement
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default SettingsPage;
