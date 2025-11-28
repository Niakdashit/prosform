import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Search, Upload, LayoutGrid, List, MoreVertical, Image, Folder, Trash2 } from "lucide-react";

const colors = {
  dark: '#3d3731',
  gold: '#f5ca3c',
  background: '#f3f4f6',
  border: '#e5e7eb',
  white: '#ffffff',
  muted: '#6b7280',
};

interface MediaItem {
  id: string;
  name: string;
  type: 'image' | 'folder';
  size?: string;
  date: string;
  thumbnail?: string;
}

const mockMedia: MediaItem[] = [
  { id: '1', name: 'Backgrounds', type: 'folder', date: '2024-07-10' },
  { id: '2', name: 'Logos', type: 'folder', date: '2024-07-08' },
  { id: '3', name: 'banner-summer.jpg', type: 'image', size: '245 KB', date: '2024-07-15', thumbnail: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=200' },
  { id: '4', name: 'promo-wheel.png', type: 'image', size: '128 KB', date: '2024-07-14', thumbnail: 'https://images.unsplash.com/photo-1518893494013-4c4e107e9f05?w=200' },
  { id: '5', name: 'prize-gift.jpg', type: 'image', size: '312 KB', date: '2024-07-12', thumbnail: 'https://images.unsplash.com/photo-1513885535751-8b9238bd345a?w=200' },
  { id: '6', name: 'confetti-bg.png', type: 'image', size: '89 KB', date: '2024-07-10', thumbnail: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=200' },
];

const Media = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const filteredMedia = mockMedia.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AppLayout>
      <div style={{ fontFamily: "'DM Sans', sans-serif" }}>
        {/* Page title */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold" style={{ color: colors.dark }}>
              Médias
            </h1>
            <p className="text-sm mt-1" style={{ color: colors.muted }}>
              Gérez vos images et fichiers
            </p>
          </div>
          <button
            className="h-8 px-3 flex items-center gap-2 font-medium text-xs transition-colors rounded-md"
            style={{ 
              backgroundColor: colors.gold, 
              color: colors.dark,
            }}
          >
            <Upload className="w-3.5 h-3.5" />
            Importer
          </button>
        </div>

        {/* Filters bar */}
        <div 
          className="flex items-center justify-between p-4 mb-4"
          style={{ 
            backgroundColor: colors.white, 
            borderRadius: '8px',
            border: `1px solid ${colors.border}`,
          }}
        >
          <div 
            className="flex items-center gap-2 px-3 h-9"
            style={{ 
              backgroundColor: colors.background, 
              borderRadius: '6px',
              width: '280px',
            }}
          >
            <Search className="w-4 h-4" style={{ color: colors.muted }} />
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none text-sm flex-1"
              style={{ color: colors.dark }}
            />
          </div>

          <div className="flex items-center gap-1 p-1" style={{ backgroundColor: colors.background, borderRadius: '6px' }}>
            <button
              onClick={() => setViewMode('grid')}
              className="p-1.5 transition-colors"
              style={{ 
                backgroundColor: viewMode === 'grid' ? colors.white : 'transparent',
                borderRadius: '4px',
              }}
            >
              <LayoutGrid className="w-4 h-4" style={{ color: viewMode === 'grid' ? colors.dark : colors.muted }} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className="p-1.5 transition-colors"
              style={{ 
                backgroundColor: viewMode === 'list' ? colors.white : 'transparent',
                borderRadius: '4px',
              }}
            >
              <List className="w-4 h-4" style={{ color: viewMode === 'list' ? colors.dark : colors.muted }} />
            </button>
          </div>
        </div>

        {/* Media grid */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-6 gap-4">
            {filteredMedia.map((item) => (
              <div
                key={item.id}
                className="group relative cursor-pointer"
                style={{ 
                  backgroundColor: colors.white, 
                  borderRadius: '8px',
                  border: `1px solid ${colors.border}`,
                  overflow: 'hidden',
                }}
              >
                {item.type === 'folder' ? (
                  <div 
                    className="aspect-square flex items-center justify-center"
                    style={{ backgroundColor: colors.background }}
                  >
                    <Folder className="w-12 h-12" style={{ color: colors.gold }} />
                  </div>
                ) : (
                  <div 
                    className="aspect-square bg-cover bg-center"
                    style={{ 
                      backgroundImage: item.thumbnail ? `url(${item.thumbnail})` : undefined,
                      backgroundColor: colors.background,
                    }}
                  >
                    {!item.thumbnail && (
                      <div className="w-full h-full flex items-center justify-center">
                        <Image className="w-8 h-8" style={{ color: colors.muted }} />
                      </div>
                    )}
                  </div>
                )}
                <div className="p-2">
                  <p className="text-xs font-medium truncate" style={{ color: colors.dark }}>
                    {item.name}
                  </p>
                  <p className="text-xs" style={{ color: colors.muted }}>
                    {item.size || 'Dossier'}
                  </p>
                </div>
                
                {/* Hover overlay */}
                <div 
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2"
                  style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
                >
                  <button className="p-2 rounded-full bg-white">
                    <MoreVertical className="w-4 h-4" style={{ color: colors.dark }} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div 
            style={{ 
              backgroundColor: colors.white, 
              borderRadius: '8px',
              border: `1px solid ${colors.border}`,
              overflow: 'hidden',
            }}
          >
            {filteredMedia.map((item) => (
              <div
                key={item.id}
                className="flex items-center px-4 h-14 transition-colors hover:bg-gray-50"
                style={{ borderBottom: `1px solid ${colors.border}` }}
              >
                <div className="flex items-center gap-3 flex-1">
                  {item.type === 'folder' ? (
                    <Folder className="w-8 h-8" style={{ color: colors.gold }} />
                  ) : (
                    <div 
                      className="w-8 h-8 rounded bg-cover bg-center"
                      style={{ 
                        backgroundImage: item.thumbnail ? `url(${item.thumbnail})` : undefined,
                        backgroundColor: colors.background,
                      }}
                    />
                  )}
                  <span className="text-sm font-medium" style={{ color: colors.dark }}>
                    {item.name}
                  </span>
                </div>
                <span className="text-xs w-24" style={{ color: colors.muted }}>
                  {item.size || '-'}
                </span>
                <span className="text-xs w-32" style={{ color: colors.muted }}>
                  {new Date(item.date).toLocaleDateString('fr-FR')}
                </span>
                <button className="p-1.5 rounded transition-colors hover:bg-gray-100">
                  <MoreVertical className="w-4 h-4" style={{ color: colors.muted }} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default Media;
