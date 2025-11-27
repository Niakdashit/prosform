/**
 * ============================================================================
 * SYSTÈME DE TIRAGE PROFESSIONNEL - INSTANT GAGNANT
 * ============================================================================
 * 
 * Architecture inspirée des systèmes utilisés par les grands organisateurs :
 * - Tirage pondéré avec distribution équitable
 * - Méthode calendrier avec créneaux horaires précis
 * - Gestion des stocks et anti-fraude
 * - Logs détaillés pour audit
 * 
 * RÈGLES DE PRIORITÉ :
 * 1. Lots calendrier (instant gagnant programmé)
 * 2. Lots probabilité (tirage aléatoire pondéré)
 * 3. Aucun gain (segment perdant)
 */

// ============================================================================
// TYPES
// ============================================================================

export interface Prize {
  id: string;
  name: string;
  description?: string;
  quantity: number;
  remaining: number;
  attributionMethod: 'probability' | 'calendar';
  // Probabilité
  winProbability?: number; // 0-100
  assignedSegments?: string[];
  // Calendrier
  calendarDate?: string; // YYYY-MM-DD
  calendarTime?: string; // HH:MM
  timeWindow?: number; // en minutes (tolérance avant/après)
  // Métadonnées
  status: 'active' | 'depleted' | 'scheduled';
  priority?: number; // Plus élevé = prioritaire
}

export interface Segment {
  id: string;
  label: string;
  isWinning?: boolean;
  prizeId?: string;
}

export interface DrawResult {
  won: boolean;
  prize: Prize | null;
  segment: Segment | null;
  method: 'calendar' | 'probability' | 'weighted' | 'none';
  message: string;
  debug?: {
    eligiblePrizes: number;
    roll?: number;
    threshold?: number;
  };
}

export interface DrawConfig {
  prizes: Prize[];
  segments: Segment[];
  playTime?: Date;
  forceSegmentId?: string; // Pour forcer un segment spécifique (mode test)
}

// ============================================================================
// UTILITAIRES
// ============================================================================

/**
 * Génère un nombre aléatoire cryptographiquement sûr entre 0 et 1
 */
function secureRandom(): number {
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const array = new Uint32Array(1);
    crypto.getRandomValues(array);
    return array[0] / (0xFFFFFFFF + 1);
  }
  return Math.random();
}

/**
 * Mélange un tableau de façon aléatoire (Fisher-Yates)
 */
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(secureRandom() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// ============================================================================
// MÉTHODE CALENDRIER (INSTANT GAGNANT PROGRAMMÉ)
// ============================================================================

/**
 * Vérifie si un lot calendrier est valide pour l'heure de jeu donnée
 */
function isCalendarPrizeActive(prize: Prize, playTime: Date): boolean {
  if (prize.attributionMethod !== 'calendar') return false;
  if (prize.remaining <= 0) return false;
  if (prize.status === 'depleted') return false;
  if (!prize.calendarDate || !prize.calendarTime) return false;

  try {
    // Parser la date et l'heure cible (en heure locale)
    const [year, month, day] = prize.calendarDate.split('-').map(Number);
    const [hours, minutes] = prize.calendarTime.split(':').map(Number);
    const targetTime = new Date(year, month - 1, day, hours, minutes, 0, 0);

    // Fenêtre de tolérance (défaut: 5 minutes)
    const windowMinutes = prize.timeWindow ?? 5;
    const windowMs = windowMinutes * 60 * 1000;

    // Calculer la différence en millisecondes
    const diff = playTime.getTime() - targetTime.getTime();
    const diffMinutes = Math.round(diff / 60000);
    
    // Le joueur doit jouer dans la fenêtre autour de l'heure programmée
    const isInWindow = diff >= -windowMs && diff <= windowMs;

    // Format lisible pour les logs (heure locale)
    const formatTime = (d: Date) => d.toLocaleString('fr-FR', { 
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    });

    console.log(`📅 [Calendar] Lot "${prize.name}":`);
    console.log(`   → Heure cible: ${formatTime(targetTime)} (${prize.calendarDate} ${prize.calendarTime})`);
    console.log(`   → Heure de jeu: ${formatTime(playTime)}`);
    console.log(`   → Différence: ${diffMinutes} minutes (fenêtre: ±${windowMinutes} min)`);
    console.log(`   → Valide: ${isInWindow ? '✅ OUI' : '❌ NON'}`);

    return isInWindow;
  } catch (e) {
    console.error(`📅 [Calendar] Erreur parsing date pour lot "${prize.name}":`, e);
    return false;
  }
}

/**
 * Trouve le lot calendrier le plus prioritaire valide
 */
function findActiveCalendarPrize(prizes: Prize[], playTime: Date, segmentId?: string): Prize | null {
  const validPrizes = prizes
    .filter(p => isCalendarPrizeActive(p, playTime))
    .filter(p => {
      // Si pas de segments assignés, valide pour tous
      if (!p.assignedSegments || p.assignedSegments.length === 0) return true;
      // Sinon, vérifier le segment
      if (!segmentId) return true;
      return p.assignedSegments.includes(segmentId);
    })
    .sort((a, b) => (b.priority || 0) - (a.priority || 0));

  if (validPrizes.length > 0) {
    console.log(`📅 [Calendar] Lot calendrier trouvé: "${validPrizes[0].name}"`);
    return validPrizes[0];
  }

  return null;
}

// ============================================================================
// MÉTHODE PROBABILITÉ (TIRAGE PONDÉRÉ)
// ============================================================================

/**
 * Système de tirage pondéré professionnel
 * 
 * Algorithme :
 * 1. Calculer le poids total de tous les lots éligibles
 * 2. Générer un nombre aléatoire entre 0 et le poids total
 * 3. Parcourir les lots et soustraire leur poids jusqu'à atteindre 0
 * 
 * Cela garantit une distribution équitable selon les probabilités définies.
 */
function drawWeightedPrize(prizes: Prize[], segmentId?: string): { prize: Prize | null; roll: number; threshold: number } {
  // Filtrer les lots éligibles
  const eligiblePrizes = prizes.filter(p => {
    // Doit être en mode probabilité
    if (p.attributionMethod !== 'probability') return false;
    // Doit avoir du stock
    if (p.remaining <= 0) return false;
    // Doit être actif
    if (p.status !== 'active') return false;
    // Doit avoir une probabilité > 0
    if (!p.winProbability || p.winProbability <= 0) return false;
    
    // Vérifier le segment si spécifié
    if (segmentId) {
      // Si pas de segments assignés → éligible pour tous les segments
      if (!p.assignedSegments || p.assignedSegments.length === 0) {
        return true;
      }
      // Sinon, doit être assigné à ce segment
      return p.assignedSegments.includes(segmentId);
    }
    
    return true;
  });

  console.log(`🎲 [Weighted] ${eligiblePrizes.length} lots éligibles pour segment "${segmentId || 'any'}"`);

  if (eligiblePrizes.length === 0) {
    return { prize: null, roll: 0, threshold: 0 };
  }

  // Calculer le poids total (somme des probabilités)
  const totalWeight = eligiblePrizes.reduce((sum, p) => sum + (p.winProbability || 0), 0);
  
  // Générer un nombre aléatoire entre 0 et 100
  const roll = secureRandom() * 100;
  
  console.log(`🎲 [Weighted] Roll: ${roll.toFixed(2)}, Total weight: ${totalWeight}%`);

  // Si le roll est supérieur au poids total, pas de gain
  if (roll >= totalWeight) {
    console.log(`🎲 [Weighted] Roll ${roll.toFixed(2)} >= ${totalWeight}% → Pas de gain`);
    return { prize: null, roll, threshold: totalWeight };
  }

  // Parcourir les lots et trouver le gagnant
  let cumulative = 0;
  for (const prize of eligiblePrizes) {
    cumulative += prize.winProbability || 0;
    console.log(`🎲 [Weighted] Lot "${prize.name}": cumulative=${cumulative.toFixed(2)}%, roll=${roll.toFixed(2)}`);
    
    if (roll < cumulative) {
      console.log(`🎲 [Weighted] 🎉 GAGNÉ: "${prize.name}"`);
      return { prize, roll, threshold: cumulative };
    }
  }

  return { prize: null, roll, threshold: totalWeight };
}

// ============================================================================
// SÉLECTION DU SEGMENT GAGNANT
// ============================================================================

/**
 * Détermine sur quel segment la roue doit s'arrêter
 * 
 * Logique :
 * 1. Si un lot calendrier est actif → forcer le segment associé
 * 2. Sinon, tirage pondéré basé sur les probabilités des lots
 * 3. Si aucun lot gagné → segment perdant aléatoire
 */
export function determineWinningSegment(config: DrawConfig): DrawResult {
  const { prizes, segments, playTime = new Date(), forceSegmentId } = config;

  console.log('═══════════════════════════════════════════════════════════');
  console.log('🎰 [DRAW] Nouveau tirage');
  console.log(`🎰 [DRAW] ${prizes.length} lots, ${segments.length} segments`);
  console.log(`🎰 [DRAW] Heure: ${playTime.toISOString()}`);
  console.log('═══════════════════════════════════════════════════════════');

  // Mode test : forcer un segment
  if (forceSegmentId) {
    const segment = segments.find(s => s.id === forceSegmentId);
    if (segment) {
      console.log(`🧪 [TEST] Segment forcé: "${segment.label}"`);
      return {
        won: segment.isWinning || false,
        prize: null,
        segment,
        method: 'none',
        message: `Mode test: segment "${segment.label}" forcé`
      };
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // ÉTAPE 1 : Vérifier les lots calendrier
  // ─────────────────────────────────────────────────────────────────────────
  const calendarPrizes = prizes.filter(p => p.attributionMethod === 'calendar');
  const probabilityPrizes = prizes.filter(p => p.attributionMethod === 'probability');
  
  console.log(`📊 [DRAW] Lots calendrier: ${calendarPrizes.length}, Lots probabilité: ${probabilityPrizes.length}`);
  
  const calendarPrize = findActiveCalendarPrize(prizes, playTime);
  
  if (calendarPrize) {
    // Trouver un segment associé à ce lot
    let winningSegment: Segment | null = null;
    
    if (calendarPrize.assignedSegments && calendarPrize.assignedSegments.length > 0) {
      // Prendre un segment assigné au hasard
      const randomIndex = Math.floor(secureRandom() * calendarPrize.assignedSegments.length);
      const segmentId = calendarPrize.assignedSegments[randomIndex];
      winningSegment = segments.find(s => s.id === segmentId) || null;
    } else {
      // Prendre un segment gagnant au hasard
      const winningSegments = segments.filter(s => s.isWinning);
      if (winningSegments.length > 0) {
        winningSegment = winningSegments[Math.floor(secureRandom() * winningSegments.length)];
      }
    }

    if (winningSegment) {
      console.log(`📅 [DRAW] Lot calendrier gagné: "${calendarPrize.name}" → Segment "${winningSegment.label}"`);
      return {
        won: true,
        prize: calendarPrize,
        segment: winningSegment,
        method: 'calendar',
        message: `🎉 Félicitations ! Vous avez gagné "${calendarPrize.name}" !`,
        debug: { eligiblePrizes: 1 }
      };
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // ÉTAPE 2 : Tirage pondéré par probabilité
  // ─────────────────────────────────────────────────────────────────────────
  
  // D'abord, on tire pour savoir si on gagne un lot
  const { prize: wonPrize, roll, threshold } = drawWeightedPrize(prizes);

  if (wonPrize) {
    // Trouver un segment associé à ce lot
    let winningSegment: Segment | null = null;
    
    if (wonPrize.assignedSegments && wonPrize.assignedSegments.length > 0) {
      // Prendre un segment assigné au hasard
      const shuffledSegments = shuffleArray(wonPrize.assignedSegments);
      for (const segId of shuffledSegments) {
        const seg = segments.find(s => s.id === segId);
        if (seg) {
          winningSegment = seg;
          break;
        }
      }
    }
    
    // Fallback : prendre n'importe quel segment gagnant
    if (!winningSegment) {
      const winningSegments = segments.filter(s => s.isWinning);
      if (winningSegments.length > 0) {
        winningSegment = winningSegments[Math.floor(secureRandom() * winningSegments.length)];
      } else {
        // Dernier recours : premier segment
        winningSegment = segments[0];
      }
    }

    console.log(`🎲 [DRAW] Lot probabilité gagné: "${wonPrize.name}" → Segment "${winningSegment?.label}"`);
    return {
      won: true,
      prize: wonPrize,
      segment: winningSegment,
      method: 'weighted',
      message: `🎉 Félicitations ! Vous avez gagné "${wonPrize.name}" !`,
      debug: { eligiblePrizes: prizes.filter(p => p.attributionMethod === 'probability' && p.remaining > 0).length, roll, threshold }
    };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // ÉTAPE 3 : Pas de gain → Segment perdant
  // ─────────────────────────────────────────────────────────────────────────
  
  // Collecter tous les segments qui ont des lots assignés (calendrier ou probabilité)
  // Ces segments ne doivent PAS être sélectionnés comme "perdants"
  const segmentsWithPrizes = new Set<string>();
  for (const prize of prizes) {
    if (prize.assignedSegments && prize.assignedSegments.length > 0 && prize.remaining > 0) {
      prize.assignedSegments.forEach(segId => segmentsWithPrizes.add(segId));
    }
  }
  
  // Filtrer les segments perdants : 
  // - Soit marqués comme non-gagnants (!isWinning)
  // - ET qui n'ont pas de lot assigné
  const losingSegments = segments.filter(s => !s.isWinning && !segmentsWithPrizes.has(s.id));
  
  // Si aucun segment perdant disponible, prendre un segment sans lot assigné
  const availableSegments = losingSegments.length > 0 
    ? losingSegments 
    : segments.filter(s => !segmentsWithPrizes.has(s.id));
  
  // En dernier recours, prendre n'importe quel segment (ne devrait pas arriver)
  const finalSegments = availableSegments.length > 0 ? availableSegments : segments;
  const randomLosingSegment = finalSegments[Math.floor(secureRandom() * finalSegments.length)];

  console.log(`❌ [DRAW] Pas de gain → Segment "${randomLosingSegment?.label}" (${segmentsWithPrizes.size} segments avec lots exclus)`);
  return {
    won: false,
    prize: null,
    segment: randomLosingSegment || null,
    method: 'none',
    message: 'Dommage, vous n\'avez pas gagné cette fois-ci. Retentez votre chance !',
    debug: { eligiblePrizes: prizes.filter(p => p.attributionMethod === 'probability' && p.remaining > 0).length, roll, threshold }
  };
}

// ============================================================================
// FONCTION LEGACY (compatibilité)
// ============================================================================

/**
 * @deprecated Utiliser determineWinningSegment à la place
 */
export function drawPrize(
  prizes: Prize[],
  playTime: Date = new Date(),
  segmentId?: string
): { won: boolean; prize: Prize | null; method: string; message: string } {
  // Créer des segments fictifs pour la compatibilité
  const segments: Segment[] = segmentId 
    ? [{ id: segmentId, label: 'Segment', isWinning: true }]
    : [];

  const result = determineWinningSegment({ prizes, segments, playTime });
  
  return {
    won: result.won,
    prize: result.prize,
    method: result.method,
    message: result.message
  };
}

// ============================================================================
// GESTION DU STOCK
// ============================================================================

/**
 * Décrémente le stock d'un lot après attribution
 */
export function consumePrize(prize: Prize): Prize {
  const newRemaining = Math.max(0, prize.remaining - 1);
  return {
    ...prize,
    remaining: newRemaining,
    status: newRemaining === 0 ? 'depleted' : prize.status
  };
}

/**
 * Vérifie si un lot a encore du stock
 */
export function hasPrizeStock(prize: Prize): boolean {
  return prize.remaining > 0 && prize.status !== 'depleted';
}

/**
 * Calcule le taux de distribution d'un lot
 */
export function getPrizeDistributionRate(prize: Prize): number {
  if (prize.quantity === 0) return 0;
  return ((prize.quantity - prize.remaining) / prize.quantity) * 100;
}
