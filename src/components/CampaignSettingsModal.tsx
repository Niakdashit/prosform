import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Gift, Upload, Eye, Save } from "lucide-react";
import { useState } from "react";

interface CampaignSettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CampaignSettingsModal = ({
  open,
  onOpenChange
}: CampaignSettingsModalProps) => {
  const [activeTab, setActiveTab] = useState("canaux");
  const [prizes, setPrizes] = useState<any[]>([]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle>Paramètres de la campagne</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
          <div className="px-6 border-b">
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
          </div>

          <ScrollArea className="h-[calc(90vh-200px)]">
            <div className="px-6 py-6">
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
                        onClick={() => setPrizes([...prizes, { id: Date.now(), name: "", quantity: 1 }])}
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
                          onClick={() => setPrizes([{ id: Date.now(), name: "", quantity: 1 }])}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Créer le premier lot
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {prizes.map((prize) => (
                          <div key={prize.id} className="border rounded-lg p-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label>Nom du lot</Label>
                                <Input 
                                  placeholder="Ex: iPhone 15 Pro"
                                  className="mt-1.5"
                                />
                              </div>
                              <div>
                                <Label>Quantité disponible</Label>
                                <Input 
                                  type="number"
                                  min="1"
                                  defaultValue="1"
                                  className="mt-1.5"
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="mt-6 pt-6 border-t">
                    <Button variant="ghost" size="sm" className="gap-2">
                      <Eye className="w-4 h-4" />
                      Paramètres avancés
                    </Button>
                  </div>
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

          <div className="flex justify-end gap-3 px-6 py-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button onClick={() => onOpenChange(false)}>
              Enregistrer
            </Button>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};