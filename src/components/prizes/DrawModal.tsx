import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PrizesService, type PrizeDrawFilters } from '@/services/PrizesService';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import type { Campaign } from '@/types/campaign';

interface DrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDrawComplete: () => void;
  campaigns: Campaign[];
  preselectedCampaignId?: string;
}

export const DrawModal = ({ isOpen, onClose, onDrawComplete, campaigns, preselectedCampaignId }: DrawModalProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [drawName, setDrawName] = useState('');
  const [campaignId, setCampaignId] = useState(preselectedCampaignId || '');
  const [winnersCount, setWinnersCount] = useState(1);
  const [filters, setFilters] = useState<PrizeDrawFilters>({});

  useEffect(() => {
    if (preselectedCampaignId) {
      setCampaignId(preselectedCampaignId);
    }
  }, [preselectedCampaignId]);

  const handleDraw = async () => {
    if (!drawName || !campaignId || winnersCount < 1) {
      toast.error('Veuillez remplir tous les champs requis');
      return;
    }

    setIsLoading(true);
    const result = await PrizesService.performDraw(
      campaignId,
      drawName,
      winnersCount,
      filters
    );
    setIsLoading(false);

    if (result) {
      toast.success(`Tirage effectué : ${result.winners_selected} gagnants sélectionnés`);
      onDrawComplete();
      // Reset form
      setDrawName('');
      setCampaignId('');
      setWinnersCount(1);
      setFilters({});
    } else {
      toast.error('Erreur lors du tirage');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Nouveau tirage au sort</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="draw-name">Nom du tirage *</Label>
            <Input
              id="draw-name"
              placeholder="Ex: Tirage de Noël 2024"
              value={drawName}
              onChange={(e) => setDrawName(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="campaign">Campagne *</Label>
            <Select value={campaignId} onValueChange={setCampaignId}>
              <SelectTrigger id="campaign">
                <SelectValue placeholder="Sélectionner une campagne" />
              </SelectTrigger>
              <SelectContent>
                {campaigns.map(c => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="winners-count">Nombre de gagnants *</Label>
            <Input
              id="winners-count"
              type="number"
              min="1"
              value={winnersCount}
              onChange={(e) => setWinnersCount(parseInt(e.target.value) || 1)}
            />
          </div>

          <div className="space-y-3 pt-2">
            <Label>Filtres (optionnels)</Label>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="only-winners"
                checked={filters.only_winners || false}
                onCheckedChange={(checked) => 
                  setFilters(prev => ({ ...prev, only_winners: checked as boolean }))
                }
              />
              <label htmlFor="only-winners" className="text-sm">
                Uniquement les gagnants
              </label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="only-non-winners"
                checked={filters.only_non_winners || false}
                onCheckedChange={(checked) => 
                  setFilters(prev => ({ ...prev, only_non_winners: checked as boolean }))
                }
              />
              <label htmlFor="only-non-winners" className="text-sm">
                Uniquement les non-gagnants
              </label>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="date-from" className="text-xs">Du</Label>
                <Input
                  id="date-from"
                  type="date"
                  value={filters.date_from || ''}
                  onChange={(e) => 
                    setFilters(prev => ({ ...prev, date_from: e.target.value }))
                  }
                />
              </div>
              <div>
                <Label htmlFor="date-to" className="text-xs">Au</Label>
                <Input
                  id="date-to"
                  type="date"
                  value={filters.date_to || ''}
                  onChange={(e) => 
                    setFilters(prev => ({ ...prev, date_to: e.target.value }))
                  }
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Annuler
          </Button>
          <Button onClick={handleDraw} disabled={isLoading}>
            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Effectuer le tirage
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
