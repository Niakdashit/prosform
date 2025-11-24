import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Gift, Upload, Eye, Save, Trash2, Calendar } from "lucide-react";
import { useState, useEffect } from "react";
import { PrizeModal } from "./PrizeModal";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface Prize {
  id: string;
  name: string;
  description?: string;
  quantity: number;
  remaining: number;
  value?: string;
  attributionMethod: 'instant' | 'calendar';
  calendarDate?: string;
  calendarTime?: string;
  assignedSegments?: string[];
  status: 'active' | 'depleted' | 'scheduled';
}

interface CampaignSettingsProps {
  defaultTab?: string;
}

export const CampaignSettings = ({ defaultTab = "canaux" }: CampaignSettingsProps) => {
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [prizes, setPrizes] = useState<Prize[]>([
    {
      id: 'prize-1',
      name: 'Iphone 14 PRO MAX',
      quantity: 10,
      remaining: 10,
      attributionMethod: 'calendar',
      calendarDate: '2025-11-24',
      calendarTime: '12:00',
      status: 'active'
    }
  ]);
  const [prizeModalOpen, setPrizeModalOpen] = useState(false);
  const [editingPrize, setEditingPrize] = useState<Prize | null>(null);

  // Segments factices pour l'exemple
  const segments = [
    { id: 'seg-1', label: '10% de réduction' },
    { id: 'seg-2', label: 'Livraison gratuite' },
    { id: 'seg-3', label: '20% de réduction' },
  ];

  useEffect(() => {
    if (defaultTab) {
      setActiveTab(defaultTab);
    }
  }, [defaultTab]);

  const handleAddPrize = () => {
    setEditingPrize(null);
    setPrizeModalOpen(true);
  };

  const handleEditPrize = (prize: Prize) => {
    setEditingPrize(prize);
    setPrizeModalOpen(true);
  };

  const handleSavePrize = (prize: Prize) => {
    if (editingPrize) {
      setPrizes(prizes.map(p => p.id === prize.id ? { ...prize, remaining: p.remaining } : p));
    } else {
      setPrizes([...prizes, { ...prize, remaining: prize.quantity, status: 'active' as const }]);
    }
  };

  const handleDeletePrize = (id: string) => {
    setPrizes(prizes.filter(p => p.id !== id));
  };

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="border-b">
        <div className="px-6 py-4">
          <h2 className="text-2xl font-semibold">Paramètres de la campagne</h2>
        </div>
        
        <div className="px-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="bg-transparent border-0 h-auto p-0 gap-6">
              <TabsTrigger 
                value="canaux" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent bg-transparent px-0 pb-3"
              >
                Canaux
              </TabsTrigger>
              <TabsTrigger 
                value="parametres"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent bg-transparent px-0 pb-3"
              >
                Paramètres
              </TabsTrigger>
              <TabsTrigger 
                value="dotation"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent bg-transparent px-0 pb-3"
              >
                Dotation
              </TabsTrigger>
              <TabsTrigger 
                value="sortie"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent bg-transparent px-0 pb-3"
              >
                Sortie
              </TabsTrigger>
              <TabsTrigger 
                value="viralite"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent bg-transparent px-0 pb-3"
              >
                Viralité
              </TabsTrigger>
            </TabsList>

            <ScrollArea className="h-[calc(100vh-200px)]">
              <div className="py-6 space-y-6">
                <TabsContent value="canaux" className="mt-0 space-y-6">
                  <div className="space-y-4 bg-card border rounded-lg p-6">
                    <h3 className="font-semibold text-lg">Campagne</h3>
                    
                    <div>
                      <Label>Nom de la campagne</Label>
                      <Input 
                        placeholder="Ma Campagne" 
                        className="mt-1.5"
                      />
                    </div>
                  </div>

                  <div className="space-y-4 bg-card border rounded-lg p-6">
                    <h3 className="font-semibold text-lg">Dates et heures de publication</h3>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Date de début</Label>
                        <Input 
                          type="date" 
                          className="mt-1.5"
                        />
                      </div>
                      <div>
                        <Label>Heure de début</Label>
                        <Input 
                          type="time" 
                          className="mt-1.5"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Date de fin</Label>
                        <Input 
                          type="date" 
                          className="mt-1.5"
                        />
                      </div>
                      <div>
                        <Label>Heure de fin</Label>
                        <Input 
                          type="time" 
                          className="mt-1.5"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 bg-card border rounded-lg p-6">
                    <h3 className="font-semibold text-lg">URL de la campagne</h3>
                    
                    <div>
                      <Input 
                        value="https://id-preview--9ba3ba3f-a694-4465-ae2d-56a6f172ada6.lovable.app/campaign/wheel-design-" 
                        readOnly
                        className="bg-muted"
                      />
                      <Button variant="outline" size="sm" className="mt-2">
                        <Eye className="w-4 h-4 mr-2" />
                        Ouvrir
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-4 bg-card border rounded-lg p-6">
                    <h3 className="font-semibold text-lg">URL Publique</h3>
                    <p className="text-sm text-muted-foreground">
                      Définissez une URL personnalisée pour votre campagne. Si laissé vide, l'URL générée automatiquement sera utilisée.
                    </p>
                    
                    <Input 
                      placeholder="https://votre-campagne-personnalisee.com"
                      className="mt-2"
                    />
                  </div>

                  <div className="space-y-4 bg-card border rounded-lg p-6">
                    <h3 className="font-semibold text-lg">Intégrations</h3>
                    
                    <Tabs defaultValue="javascript" className="w-full">
                      <TabsList>
                        <TabsTrigger value="javascript">Javascript</TabsTrigger>
                        <TabsTrigger value="html">HTML</TabsTrigger>
                        <TabsTrigger value="webview">Webview</TabsTrigger>
                        <TabsTrigger value="oembed">oEmbed</TabsTrigger>
                        <TabsTrigger value="smarturl">Smart URL</TabsTrigger>
                        <TabsTrigger value="shorturl">Short URL</TabsTrigger>
                        <TabsTrigger value="qrcode">QR Code</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="javascript" className="mt-4">
                        <div className="relative">
                          <pre className="bg-muted p-4 rounded-md text-xs overflow-x-auto">
                            <code>{`<div id="wheel-campaign"></div>
<script type="text/javascript">
  (function(w,d,id){
    var el=d.getElementById(id);
    if(!el){ return; }
    var f=d.createElement('iframe');
    f.src='https://wheel.lovable.app/embed';
    f.width='100%';
    f.height='600';
    f.style.border='none';
    el.appendChild(f);
  })(window,document,'wheel-campaign');
</script>`}</code>
                          </pre>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="absolute top-2 right-2"
                          >
                            Copier
                          </Button>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </div>
                </TabsContent>

                <TabsContent value="parametres" className="mt-0 space-y-4">
                  <div className="bg-card border rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-lg">Limites</h3>
                      <Button variant="ghost" size="sm">Développer</Button>
                    </div>
                  </div>

                  <div className="bg-card border rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-lg">Règlement, Gagnants et Contact</h3>
                      <Button variant="ghost" size="sm">Développer</Button>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="dotation" className="mt-0 space-y-6">
                  <div className="bg-card border rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-lg">Gestion de la Dotation</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          Configurez les lots et les règles d'attribution pour votre campagne wheel
                        </p>
                      </div>
                      <Button variant="default" className="gap-2">
                        <Save className="w-4 h-4" />
                        Sauvegarder
                      </Button>
                    </div>

                    <div className="mt-6">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-medium">Lots disponibles ({prizes.length})</h4>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={handleAddPrize}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Ajouter un lot
                        </Button>
                      </div>

                      {prizes.length === 0 ? (
                        <div className="border-2 border-dashed rounded-lg p-12 text-center">
                          <Gift className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                          <p className="text-muted-foreground mb-4">Aucun lot configuré</p>
                          <Button 
                            variant="default"
                            onClick={handleAddPrize}
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Créer le premier lot
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {prizes.map((prize) => (
                            <div key={prize.id} className="border rounded-lg p-4 hover:bg-muted/30 transition-colors">
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex-1">
                                  <h5 className="font-medium text-lg">{prize.name}</h5>
                                  <div className="flex items-center gap-2 mt-1">
                                    {prize.attributionMethod === 'calendar' && (
                                      <Badge variant="secondary" className="gap-1">
                                        <Calendar className="w-3 h-3" />
                                        Calendrier
                                      </Badge>
                                    )}
                                    {prize.attributionMethod === 'instant' && (
                                      <Badge variant="secondary" className="gap-1">
                                        <Gift className="w-3 h-3" />
                                        Instantané
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => handleEditPrize(prize)}
                                  >
                                    <Eye className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-destructive hover:text-destructive"
                                    onClick={() => handleDeletePrize(prize.id)}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>

                              <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                  <span className="text-muted-foreground">Progression</span>
                                  <span className="font-medium">
                                    {prize.quantity - prize.remaining} / {prize.quantity}
                                  </span>
                                </div>
                                <Progress 
                                  value={((prize.quantity - prize.remaining) / prize.quantity) * 100} 
                                  className="h-2"
                                />
                                <p className="text-xs text-muted-foreground">
                                  {prize.remaining} lots restants
                                </p>
                              </div>

                              <Badge 
                                variant={prize.status === 'active' ? 'default' : 'secondary'}
                                className="mt-3"
                              >
                                {prize.status === 'active' ? 'Actif' : prize.status === 'depleted' ? 'Épuisé' : 'Programmé'}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <details className="mt-6 border rounded-lg" open>
                      <summary className="px-4 py-3 cursor-pointer hover:bg-muted/50 transition-colors flex items-center gap-2">
                        <Eye className="w-4 h-4" />
                        <span className="text-sm font-medium">Paramètres avancés</span>
                      </summary>
                      <div className="p-4 border-t text-sm text-muted-foreground">
                        Les paramètres avancés sont configurés individuellement pour chaque lot
                      </div>
                    </details>
                  </div>
                </TabsContent>

                <TabsContent value="sortie" className="mt-0 space-y-6">
                  <div className="bg-card border rounded-lg p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="font-semibold text-lg">Envoi d'un e-mail aux gagnants</h3>
                      <Button variant="ghost" size="sm">Réduire</Button>
                    </div>

                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Nom de l'émetteur</Label>
                          <Input 
                            placeholder="Ex: Cuisine Actuelle"
                            className="mt-1.5"
                          />
                        </div>
                        <div>
                          <Label>Adresse e-mail du destinataire</Label>
                          <Input 
                            type="email"
                            placeholder="exemple@domaine.com"
                            className="mt-1.5"
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            Des virgules peuvent être utilisées pour séparer plusieurs adresses.
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <Checkbox id="use-participant" />
                            <Label htmlFor="use-participant" className="text-sm font-normal">
                              Utiliser l'adresse e-mail du participant
                            </Label>
                          </div>
                        </div>
                      </div>

                      <div>
                        <Label>E-mail de réponse</Label>
                        <Input 
                          type="email"
                          placeholder="reponses@domaine.com"
                          className="mt-1.5"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          À qui envoyer l'e-mail de gain ?
                        </p>
                      </div>

                      <div>
                        <Label>Objet</Label>
                        <Input 
                          placeholder="Félicitations pour votre gain !"
                          className="mt-1.5"
                        />
                      </div>

                      <div>
                        <Label>Contenu de l'e-mail</Label>
                        <Textarea 
                          placeholder="Contenu de l'e-mail (HTML)"
                          className="mt-1.5 min-h-[200px] font-mono text-sm"
                        />
                        <div className="flex justify-end gap-2 mt-2">
                          <Button variant="outline" size="sm">Tags</Button>
                          <Button variant="outline" size="sm">Variables dynamiques</Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="viralite" className="mt-0 space-y-6">
                  <div className="bg-card border rounded-lg p-6">
                    <Tabs defaultValue="general">
                      <TabsList>
                        <TabsTrigger value="general">Contenu général</TabsTrigger>
                        <TabsTrigger value="boutons">Boutons sociaux</TabsTrigger>
                        <TabsTrigger value="actions">Actions écran de sortie</TabsTrigger>
                        <TabsTrigger value="emails">Emails d'invitation</TabsTrigger>
                      </TabsList>

                      <TabsContent value="general" className="space-y-4 mt-6">
                        <p className="text-sm text-muted-foreground">
                          Toutes les informations remplies ci-dessous pré-rempliront les champs des boutons de partage que vous activerez dans les autres onglets.
                        </p>

                        <div className="grid grid-cols-2 gap-6">
                          <div>
                            <Label>Image de partage (1200×627px)</Label>
                            <div className="mt-2 border-2 border-dashed rounded-lg p-8 text-center hover:border-primary cursor-pointer transition-colors">
                              <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                              <p className="text-sm text-muted-foreground">Cliquez pour ajouter une image</p>
                              <p className="text-xs text-muted-foreground mt-1">PNG, JPG jusqu'à 10MB</p>
                            </div>
                            <div className="mt-2">
                              <Label className="text-sm">Description de l'image</Label>
                              <Input 
                                placeholder="Description de l'image"
                                className="mt-1"
                              />
                            </div>
                            <div className="flex items-center gap-2 mt-2">
                              <Checkbox id="xml-feed" />
                              <Label htmlFor="xml-feed" className="text-sm font-normal">
                                Ajouter une image pour le flux XML
                              </Label>
                            </div>
                          </div>

                          <div className="space-y-4">
                            <div>
                              <Label>Titre</Label>
                              <Input 
                                placeholder="Gagnez votre Plancha..."
                                className="mt-1.5"
                              />
                            </div>

                            <div>
                              <Label>Description</Label>
                              <Textarea 
                                placeholder="Jouez et rejouez jusqu'à ..."
                                className="mt-1.5"
                                rows={4}
                              />
                            </div>
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="boutons" className="mt-6">
                        <p className="text-sm text-muted-foreground mb-4">
                          Configurez les boutons de partage sur les réseaux sociaux
                        </p>
                      </TabsContent>

                      <TabsContent value="actions" className="mt-6">
                        <p className="text-sm text-muted-foreground mb-4">
                          Configurez les actions disponibles sur l'écran de sortie
                        </p>
                      </TabsContent>

                      <TabsContent value="emails" className="mt-6">
                        <p className="text-sm text-muted-foreground mb-4">
                          Configurez les emails d'invitation à envoyer
                        </p>
                      </TabsContent>
                    </Tabs>
                  </div>
                </TabsContent>
              </div>
            </ScrollArea>
          </Tabs>
        </div>
      </div>

      <PrizeModal
        open={prizeModalOpen}
        onOpenChange={setPrizeModalOpen}
        prize={editingPrize}
        onSave={handleSavePrize}
        segments={segments}
      />
    </div>
  );
};