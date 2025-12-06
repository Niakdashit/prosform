import type { QRCodeData, GoogleReviewPrize } from './types';

/**
 * Service pour gérer les QR codes pré-générés
 */

// Générer un code unique
export function generateUniqueCode(prefix: string = 'GR'): string {
  const year = new Date().getFullYear();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  const timestamp = Date.now().toString(36).toUpperCase();
  return `${prefix}-${year}-${random}${timestamp.slice(-3)}`;
}

// Générer plusieurs QR codes pour un lot
export function generateQRCodes(
  prizeId: string,
  count: number,
  prefix: string = 'GR'
): QRCodeData[] {
  const qrCodes: QRCodeData[] = [];
  const existingCodes = new Set<string>();

  for (let i = 0; i < count; i++) {
    let code: string;
    // S'assurer que le code est unique
    do {
      code = generateUniqueCode(prefix);
    } while (existingCodes.has(code));
    
    existingCodes.add(code);
    
    qrCodes.push({
      id: `qr-${Date.now()}-${i}`,
      code,
      isUsed: false,
      prizeId,
      createdAt: new Date().toISOString(),
    });
  }

  return qrCodes;
}

// Trouver un QR code disponible pour un lot
export function findAvailableQRCode(prize: GoogleReviewPrize): QRCodeData | null {
  const available = prize.qrCodes.find(qr => !qr.isUsed);
  return available || null;
}

// Marquer un QR code comme utilisé
export function markQRCodeAsUsed(
  qrCodes: QRCodeData[],
  qrCodeId: string,
  participantId: string
): QRCodeData[] {
  return qrCodes.map(qr => 
    qr.id === qrCodeId 
      ? {
          ...qr,
          isUsed: true,
          usedAt: new Date().toISOString(),
          usedBy: participantId,
        }
      : qr
  );
}

// Vérifier si un QR code est valide
export function verifyQRCode(
  prizes: GoogleReviewPrize[],
  code: string
): { isValid: boolean; prize?: GoogleReviewPrize; qrCode?: QRCodeData } {
  for (const prize of prizes) {
    const qrCode = prize.qrCodes.find(qr => qr.code === code);
    if (qrCode) {
      return {
        isValid: qrCode.isUsed === false,
        prize,
        qrCode,
      };
    }
  }
  return { isValid: false };
}

// Exporter les QR codes en CSV
export function exportQRCodesToCSV(prizes: GoogleReviewPrize[]): string {
  const headers = ['Lot', 'Code', 'Utilisé', 'Date utilisation', 'Participant'];
  const rows: string[] = [headers.join(',')];

  for (const prize of prizes) {
    for (const qr of prize.qrCodes) {
      rows.push([
        `"${prize.name}"`,
        qr.code,
        qr.isUsed ? 'Oui' : 'Non',
        qr.usedAt || '',
        qr.usedBy || '',
      ].join(','));
    }
  }

  return rows.join('\n');
}

// Importer des QR codes depuis un CSV
export function importQRCodesFromCSV(
  csv: string,
  prizeId: string
): QRCodeData[] {
  const lines = csv.trim().split('\n');
  const qrCodes: QRCodeData[] = [];

  // Skip header
  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].split(',');
    if (parts.length >= 2) {
      const code = parts[1].replace(/"/g, '').trim();
      if (code) {
        qrCodes.push({
          id: `qr-imported-${Date.now()}-${i}`,
          code,
          isUsed: false,
          prizeId,
          createdAt: new Date().toISOString(),
        });
      }
    }
  }

  return qrCodes;
}

// Statistiques des QR codes
export function getQRCodeStats(prizes: GoogleReviewPrize[]): {
  total: number;
  used: number;
  available: number;
  byPrize: Record<string, { total: number; used: number; available: number }>;
} {
  const byPrize: Record<string, { total: number; used: number; available: number }> = {};
  let total = 0;
  let used = 0;

  for (const prize of prizes) {
    const prizeUsed = prize.qrCodes.filter(qr => qr.isUsed).length;
    const prizeTotal = prize.qrCodes.length;
    
    byPrize[prize.id] = {
      total: prizeTotal,
      used: prizeUsed,
      available: prizeTotal - prizeUsed,
    };

    total += prizeTotal;
    used += prizeUsed;
  }

  return {
    total,
    used,
    available: total - used,
    byPrize,
  };
}
