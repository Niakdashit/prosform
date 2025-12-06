import { useEffect, useState } from 'react';
import { Trophy, Gift, XCircle, Download, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { GoogleReviewConfig, GoogleReviewPrize, QRCodeData } from './types';
import QRCode from 'qrcode';

interface ResultScreenProps {
  config: GoogleReviewConfig;
  hasWon: boolean;
  prize: GoogleReviewPrize | null;
  qrCode: QRCodeData | null;
  onShare?: () => void;
  onDownload?: () => void;
}

export function ResultScreen({
  config,
  hasWon,
  prize,
  qrCode,
  onShare,
  onDownload,
}: ResultScreenProps) {
  const { result, general } = config;
  const [qrImageUrl, setQrImageUrl] = useState<string | null>(null);

  // Générer le QR code à partir du code
  useEffect(() => {
    if (qrCode?.code && hasWon) {
      // Si on a déjà une image QR, l'utiliser
      if (qrCode.qrImage) {
        setQrImageUrl(qrCode.qrImage);
      } else {
        // Sinon, générer le QR code
        QRCode.toDataURL(qrCode.code, {
          width: result.qrCodeSize || 200,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF',
          },
        })
          .then((url) => setQrImageUrl(url))
          .catch(console.error);
      }
    }
  }, [qrCode, hasWon, result.qrCodeSize]);

  // Remplacer {{prize}} par le nom du lot
  const getSubtitle = () => {
    if (hasWon && prize) {
      return result.winSubtitle.replace('{{prize}}', prize.name);
    }
    return result.loseSubtitle;
  };

  const handleDownload = () => {
    if (qrImageUrl) {
      const link = document.createElement('a');
      link.href = qrImageUrl;
      link.download = `gain-${qrCode?.code || 'qr'}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
    onDownload?.();
  };

  const handleShare = async () => {
    if (navigator.share && prize) {
      try {
        await navigator.share({
          title: `J'ai gagné chez ${general.businessName} !`,
          text: `J'ai gagné ${prize.name} grâce au jeu ${general.businessName} !`,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Partage annulé');
      }
    }
    onShare?.();
  };

  return (
    <div 
      className="min-h-screen flex flex-col items-center justify-center px-6 py-12"
      style={{ backgroundColor: result.backgroundColor || '#FFFFFF' }}
    >
      {/* Logo de l'établissement */}
      {general.businessLogo && (
        <div className="mb-6">
          <img 
            src={general.businessLogo} 
            alt={general.businessName}
            className="h-16 object-contain"
          />
        </div>
      )}

      {/* Icône de résultat */}
      <div className={`mb-6 p-4 rounded-full ${hasWon ? 'bg-green-100' : 'bg-gray-100'}`}>
        {hasWon ? (
          <Trophy className="w-16 h-16 text-green-500" />
        ) : (
          <XCircle className="w-16 h-16 text-gray-400" />
        )}
      </div>

      {/* Titre */}
      <h1 
        className={`text-3xl font-bold text-center mb-4 ${
          hasWon ? 'text-green-600' : 'text-gray-700'
        }`}
        dangerouslySetInnerHTML={
          hasWon && result.winTitleHtml
            ? { __html: result.winTitleHtml }
            : !hasWon && result.loseTitleHtml
            ? { __html: result.loseTitleHtml }
            : undefined
        }
      >
        {hasWon 
          ? (!result.winTitleHtml ? result.winTitle : null)
          : (!result.loseTitleHtml ? result.loseTitle : null)
        }
      </h1>

      {/* Sous-titre */}
      <p className="text-lg text-gray-600 text-center mb-8 max-w-sm">
        {getSubtitle()}
      </p>

      {/* Affichage du lot gagné */}
      {hasWon && prize && (
        <div className="w-full max-w-sm bg-white rounded-2xl shadow-lg p-6 mb-6 border border-gray-100">
          {/* Image du lot */}
          {result.showPrizeImage && prize.image && (
            <div className="mb-4 flex justify-center">
              <img 
                src={prize.image} 
                alt={prize.name}
                className="h-32 object-contain rounded-lg"
              />
            </div>
          )}

          {/* Nom du lot */}
          <div className="flex items-center justify-center gap-2 mb-4">
            <Gift className="w-5 h-5 text-yellow-500" />
            <span className="text-lg font-semibold text-gray-900">
              {prize.name}
            </span>
          </div>

          {/* Description du lot */}
          {prize.description && (
            <p className="text-sm text-gray-500 text-center mb-4">
              {prize.description}
            </p>
          )}

          {/* QR Code */}
          {result.showQRCode && qrImageUrl && (
            <div className="flex flex-col items-center mb-4">
              <div className="p-3 bg-white rounded-lg shadow-inner border border-gray-200">
                <img 
                  src={qrImageUrl} 
                  alt="QR Code"
                  style={{ 
                    width: result.qrCodeSize || 200,
                    height: result.qrCodeSize || 200,
                  }}
                />
              </div>
              <p className="text-xs text-gray-400 mt-2">
                Scannez ce QR code en magasin
              </p>
            </div>
          )}

          {/* Numéro gagnant */}
          {result.showWinnerNumber && qrCode?.code && (
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <p className="text-xs text-gray-500 mb-1">Numéro gagnant</p>
              <p className="text-2xl font-mono font-bold text-gray-900 tracking-wider">
                {qrCode.code}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Boutons d'action (seulement pour les gagnants) */}
      {hasWon && prize && (
        <div className="flex gap-3 w-full max-w-sm">
          <Button
            onClick={handleDownload}
            variant="outline"
            className="flex-1 h-12 flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            Télécharger
          </Button>
          
          {navigator.share && (
            <Button
              onClick={handleShare}
              className="flex-1 h-12 flex items-center justify-center gap-2"
              style={{ backgroundColor: '#3B82F6' }}
            >
              <Share2 className="w-4 h-4" />
              Partager
            </Button>
          )}
        </div>
      )}

      {/* Message pour les perdants */}
      {!hasWon && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg max-w-sm">
          <p className="text-sm text-gray-500 text-center">
            Merci d'avoir participé ! Revenez nous voir pour tenter à nouveau votre chance.
          </p>
        </div>
      )}

      {/* Instructions pour récupérer le lot */}
      {hasWon && (
        <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200 max-w-sm">
          <p className="text-sm text-yellow-800 text-center">
            📍 Présentez ce QR code ou ce numéro en magasin pour récupérer votre lot.
          </p>
        </div>
      )}
    </div>
  );
}
