import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  Sparkles, 
  Zap, 
  BarChart3, 
  Users, 
  Gift, 
  Target,
  ArrowRight,
  CheckCircle,
  Play
} from 'lucide-react';

const features = [
  {
    icon: Gift,
    title: 'Roue de la fortune',
    description: 'Créez des jeux de roue interactifs pour engager vos visiteurs et collecter des leads.',
  },
  {
    icon: Zap,
    title: 'Quiz interactifs',
    description: 'Concevez des quiz personnalisés pour qualifier vos prospects et augmenter l\'engagement.',
  },
  {
    icon: Target,
    title: 'Jackpot & Scratch',
    description: 'Proposez des jeux à gratter et machines à sous pour des campagnes mémorables.',
  },
  {
    icon: BarChart3,
    title: 'Analytics avancés',
    description: 'Suivez les performances de vos campagnes en temps réel avec des tableaux de bord détaillés.',
  },
  {
    icon: Users,
    title: 'Gestion des contacts',
    description: 'Centralisez et gérez tous vos leads collectés via vos campagnes.',
  },
  {
    icon: Sparkles,
    title: 'Personnalisation totale',
    description: 'Adaptez chaque campagne à votre image de marque avec notre éditeur visuel.',
  },
];

const testimonials = [
  {
    quote: "Prosform a transformé notre façon de collecter des leads. Nos taux de conversion ont augmenté de 300%.",
    author: "Marie L.",
    role: "Directrice Marketing",
    company: "TechCorp",
  },
  {
    quote: "L'interface est intuitive et les résultats sont impressionnants. Je recommande vivement !",
    author: "Thomas D.",
    role: "CEO",
    company: "StartupXYZ",
  },
  {
    quote: "Nos campagnes de Noël avec la roue de la fortune ont été un succès phénoménal.",
    author: "Sophie M.",
    role: "Community Manager",
    company: "RetailBrand",
  },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-lg font-bold text-primary-foreground">P</span>
              </div>
              <span className="text-xl font-bold">Prosform</span>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/login">
                <Button variant="ghost">Connexion</Button>
              </Link>
              <Link to="/signup">
                <Button>Commencer gratuitement</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-8">
            <Sparkles className="w-4 h-4" />
            Nouveau : Intégrations Short URL personnalisables
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            Créez des campagnes
            <br />
            <span className="text-primary">interactives et engageantes</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            Roues de la fortune, quiz, jeux à gratter... Transformez vos visiteurs en leads qualifiés avec des expériences gamifiées.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/signup">
              <Button size="lg" className="text-lg px-8">
                Démarrer gratuitement
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="text-lg px-8">
              <Play className="mr-2 w-5 h-5" />
              Voir la démo
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            Pas de carte bancaire requise • Configuration en 5 minutes
          </p>
        </div>
      </section>

      {/* Demo Preview */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/50">
        <div className="max-w-6xl mx-auto">
          <div className="relative rounded-2xl overflow-hidden shadow-2xl border bg-background">
            <div className="aspect-video bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
              <div className="text-center">
                <div className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Play className="w-12 h-12 text-primary" />
                </div>
                <p className="text-muted-foreground">Aperçu de l'éditeur de campagnes</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Tout ce dont vous avez besoin
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Une plateforme complète pour créer, gérer et analyser vos campagnes marketing interactives.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="p-6 rounded-2xl border bg-card hover:shadow-lg transition-shadow"
              >
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Ils nous font confiance
            </h2>
            <p className="text-xl text-muted-foreground">
              Découvrez ce que nos clients disent de Prosform
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="p-6 rounded-2xl border bg-card"
              >
                <p className="text-lg mb-6 italic">"{testimonial.quote}"</p>
                <div>
                  <p className="font-semibold">{testimonial.author}</p>
                  <p className="text-sm text-muted-foreground">
                    {testimonial.role}, {testimonial.company}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Commencez gratuitement
          </h2>
          <p className="text-xl text-muted-foreground mb-10">
            Créez jusqu'à 3 campagnes gratuitement, puis passez à un plan payant pour débloquer toutes les fonctionnalités.
          </p>
          <div className="bg-card border rounded-2xl p-8 max-w-md mx-auto">
            <div className="text-sm font-medium text-primary mb-2">Plan Gratuit</div>
            <div className="text-4xl font-bold mb-4">0€<span className="text-lg font-normal text-muted-foreground">/mois</span></div>
            <ul className="space-y-3 text-left mb-8">
              {[
                '3 campagnes actives',
                '1000 participations/mois',
                'Tous les types de jeux',
                'Analytics de base',
                'Support par email',
              ].map((item, index) => (
                <li key={index} className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <Link to="/signup">
              <Button className="w-full" size="lg">
                Créer mon compte gratuit
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Prêt à booster vos conversions ?
          </h2>
          <p className="text-xl opacity-90 mb-8">
            Rejoignez des milliers de marketeurs qui utilisent Prosform pour créer des campagnes engageantes.
          </p>
          <Link to="/signup">
            <Button size="lg" variant="secondary" className="text-lg px-8">
              Commencer maintenant
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-lg font-bold text-primary-foreground">P</span>
              </div>
              <span className="text-xl font-bold">Prosform</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <Link to="/terms" className="hover:text-foreground">Conditions d'utilisation</Link>
              <Link to="/privacy" className="hover:text-foreground">Politique de confidentialité</Link>
              <Link to="/contact" className="hover:text-foreground">Contact</Link>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2025 Prosform. Tous droits réservés.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
