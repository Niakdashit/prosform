import { useState } from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Plus, 
  Download, 
  Upload, 
  Trash2, 
  QrCode,
  Search,
  CheckCircle2,
  XCircle,
  Copy,
  RefreshCw
} from "lucide-react";
import { toast } from "sonner";
import type { GoogleReviewConfig, GoogleReviewPrize, QRCodeData } from './types';
import { 
  generateQRCodes, 
  exportQRCodesToCSV, 
  getQRCodeStats 
} from './qrCodeService';

interface QRCodesPanelProps {
  config: GoogleReviewConfig;
  onUpdateConfig: (updates: Partial<GoogleReviewConfig>) => void;
}

export const QRCodesPanel = ({
  config,
  onUpdateConfig,
}: QRCodesPanelProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPrize, setFilterPrize] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'used' | 'available'>('all');
  const [showGenerateDialog, setShowGenerateDialog] = useState(false);
  const [generatePrizeId, setGeneratePrizeId] = useState<string>('');
  const [generateCount, setGenerateCount] = useState(10);
  const [generatePrefix, setGeneratePrefix] = useState('GR');

  const stats = getQRCodeStats(config.prizes);

  // Tous les QR codes aplatis avec leur lot
  const allQRCodes = config.prizes.flatMap(prize => 
    prize.qrCodes.map(qr => ({
      ...qr,
      prizeName: prize.name,
      prizeId: prize.id,
    }))
  );

  // Filtrage
  const filteredQRCodes = allQRCodes.filter(qr => {
    const matchesSearch = qr.code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPrize = filterPrize === 'all' || qr.prizeId === filterPrize;
    const matchesStatus = 
      filterStatus === 'all' || 
      (filterStatus === 'used' && qr.isUsed) ||
      (filterStatus === 'available' && !qr.isUsed);
    return matchesSearch && matchesPrize && matchesStatus;
  });

  const handleGenerateQRCodes = () => {
    if (!generatePrizeId) {
      toast.error('Veuillez sélectionner un lot');
      return;
    }

    const newQRCodes = generateQRCodes(generatePrizeId, generateCount, generatePrefix);
    
    const updatedPrizes = config.prizes.map(prize => {
      if (prize.id === generatePrizeId) {
        return {
          ...prize,
          qrCodes: [...prize.qrCodes, ...newQRCodes],
        };
      }
      return prize;
    });

    onUpdateConfig({ prizes: updatedPrizes });
    setShowGenerateDialog(false);
    toast.success(`${generateCount} QR codes générés avec succès !`);
  };

  const handleExportCSV = () => {
    const csv = exportQRCodesToCSV(config.prizes);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `qrcodes-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Export CSV téléchargé !');
  };

  const handleDeleteQRCode = (prizeId: string, qrCodeId: string) => {
    const updatedPrizes = config.prizes.map(prize => {
      if (prize.id === prizeId) {
        return {
          ...prize,
          qrCodes: prize.qrCodes.filter(qr => qr.id !== qrCodeId),
        };
      }
      return prize;
    });

    onUpdateConfig({ prizes: updatedPrizes });
    toast.success('QR code supprimé');
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success('Code copié !');
  };

  return (
    <div className="flex-1 flex flex-col p-6 bg-muted/30">
      {/* Header avec stats */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Gestion des QR Codes</h2>
        <p className="text-muted-foreground mb-4">
          Gérez les QR codes pré-générés pour chaque lot
        </p>

        {/* Stats rapides */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-card rounded-lg p-4 border">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <QrCode className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Total</p>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-lg p-4 border">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.available}</p>
                <p className="text-xs text-muted-foreground">Disponibles</p>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-lg p-4 border">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <XCircle className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.used}</p>
                <p className="text-xs text-muted-foreground">Utilisés</p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions et filtres */}
        <div className="flex flex-wrap items-center gap-3">
          <Button onClick={() => setShowGenerateDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Générer des QR codes
          </Button>
          <Button variant="outline" onClick={handleExportCSV}>
            <Download className="w-4 h-4 mr-2" />
            Exporter CSV
          </Button>

          <div className="flex-1" />

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher un code..."
              className="pl-9 w-64"
            />
          </div>

          <Select value={filterPrize} onValueChange={setFilterPrize}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Tous les lots" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les lots</SelectItem>
              {config.prizes.map(prize => (
                <SelectItem key={prize.id} value={prize.id}>
                  {prize.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filterStatus} onValueChange={(v: 'all' | 'used' | 'available') => setFilterStatus(v)}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous</SelectItem>
              <SelectItem value="available">Disponibles</SelectItem>
              <SelectItem value="used">Utilisés</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tableau des QR codes */}
      <div className="bg-card rounded-lg border flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Lot</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Utilisé le</TableHead>
                <TableHead>Participant</TableHead>
                <TableHead className="w-20">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredQRCodes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <QrCode className="w-10 h-10 opacity-50" />
                      <p>Aucun QR code trouvé</p>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setShowGenerateDialog(true)}
                      >
                        Générer des QR codes
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredQRCodes.map((qr) => (
                  <TableRow key={qr.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <code className="text-sm font-mono bg-muted px-2 py-1 rounded">
                          {qr.code}
                        </code>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => handleCopyCode(qr.code)}
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>{qr.prizeName}</TableCell>
                    <TableCell>
                      {qr.isUsed ? (
                        <Badge variant="secondary" className="bg-orange-100 text-orange-700">
                          Utilisé
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-green-100 text-green-700">
                          Disponible
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {qr.usedAt ? new Date(qr.usedAt).toLocaleDateString('fr-FR') : '-'}
                    </TableCell>
                    <TableCell>
                      {qr.usedBy ? (
                        <span className="text-sm text-muted-foreground">
                          {qr.usedBy.substring(0, 15)}...
                        </span>
                      ) : '-'}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                        onClick={() => handleDeleteQRCode(qr.prizeId, qr.id)}
                        disabled={qr.isUsed}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </div>

      {/* Dialog de génération */}
      <Dialog open={showGenerateDialog} onOpenChange={setShowGenerateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Générer des QR codes</DialogTitle>
            <DialogDescription>
              Créez des QR codes uniques pour un lot spécifique
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Lot concerné</Label>
              <Select value={generatePrizeId} onValueChange={setGeneratePrizeId}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un lot" />
                </SelectTrigger>
                <SelectContent>
                  {config.prizes.map(prize => (
                    <SelectItem key={prize.id} value={prize.id}>
                      {prize.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {config.prizes.length === 0 && (
                <p className="text-xs text-orange-600">
                  Veuillez d'abord créer des lots dans l'onglet "Paramètres et lots"
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Nombre de QR codes</Label>
              <Input
                type="number"
                value={generateCount}
                onChange={(e) => setGenerateCount(parseInt(e.target.value) || 10)}
                min={1}
                max={1000}
              />
            </div>

            <div className="space-y-2">
              <Label>Préfixe des codes</Label>
              <Input
                value={generatePrefix}
                onChange={(e) => setGeneratePrefix(e.target.value.toUpperCase())}
                placeholder="GR"
                maxLength={5}
              />
              <p className="text-xs text-muted-foreground">
                Ex: {generatePrefix}-2024-ABC123
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowGenerateDialog(false)}>
              Annuler
            </Button>
            <Button 
              onClick={handleGenerateQRCodes}
              disabled={!generatePrizeId || config.prizes.length === 0}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Générer {generateCount} codes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
