import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { OrganizationProvider } from "@/contexts/OrganizationContext";
import ErrorBoundary from "@/components/ErrorBoundary";
import PrivateRoute from "@/components/PrivateRoute";
import { Loader2 } from "lucide-react";

// Lazy loaded pages for better performance
const Login = lazy(() => import("./pages/Login"));
const Signup = lazy(() => import("./pages/Signup"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const Profile = lazy(() => import("./pages/Profile"));
const Index = lazy(() => import("./pages/Index"));
const Preview = lazy(() => import("./pages/Preview"));
const Campaigns = lazy(() => import("./pages/Campaigns"));
const Stats = lazy(() => import("./pages/Stats"));
const Contacts = lazy(() => import("./pages/Contacts"));
const Media = lazy(() => import("./pages/Media"));
const SettingsPage = lazy(() => import("./pages/SettingsPage"));
const InstantWins = lazy(() => import("./pages/InstantWins"));
const PrizeDraws = lazy(() => import("./pages/PrizeDraws"));
const Wheel = lazy(() => import("./pages/Wheel"));
const ArticleWheel = lazy(() => import("./pages/ArticleWheel"));
const ArticleWheelPreview = lazy(() => import("./pages/ArticleWheelPreview"));
const WheelPreview = lazy(() => import("./pages/WheelPreview"));
const Quiz = lazy(() => import("./pages/Quiz"));
const QuizPreview = lazy(() => import("./pages/QuizPreview"));
const Jackpot = lazy(() => import("./pages/Jackpot"));
const JackpotPreview = lazy(() => import("./pages/JackpotPreview"));
const Scratch = lazy(() => import("./pages/Scratch"));
const ScratchPreview = lazy(() => import("./pages/ScratchPreview"));
const ArticleScratch = lazy(() => import("./pages/ArticleScratch"));
const ArticleScratchPreview = lazy(() => import("./pages/ArticleScratchPreview"));
const ArticleQuiz = lazy(() => import("./pages/ArticleQuiz"));
const ArticleQuizPreview = lazy(() => import("./pages/ArticleQuizPreview"));
const ArticleJackpot = lazy(() => import("./pages/ArticleJackpot"));
const ArticleJackpotPreview = lazy(() => import("./pages/ArticleJackpotPreview"));
const Catalog = lazy(() => import("./pages/Catalog"));
const CatalogPreview = lazy(() => import("./pages/CatalogPreview"));
const PublicCampaign = lazy(() => import("./pages/PublicCampaign"));
const ShortUrl = lazy(() => import("./pages/ShortUrl"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Settings pages
const Team = lazy(() => import("./pages/settings/Team"));

// Admin pages
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));

// Loading fallback component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <Loader2 className="w-8 h-8 animate-spin text-primary" />
  </div>
);

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <OrganizationProvider>
          <ThemeProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  {/* Public routes */}
                  <Route path="/" element={<Navigate to="/login" replace />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  
                  {/* Protected routes */}
                  <Route path="/campaigns" element={<PrivateRoute><Campaigns /></PrivateRoute>} />
                  <Route path="/stats" element={<PrivateRoute><Stats /></PrivateRoute>} />
                  <Route path="/contacts" element={<PrivateRoute><Contacts /></PrivateRoute>} />
                  <Route path="/media" element={<PrivateRoute><Media /></PrivateRoute>} />
                  <Route path="/settings" element={<PrivateRoute><SettingsPage /></PrivateRoute>} />
                  <Route path="/settings/team" element={<PrivateRoute><Team /></PrivateRoute>} />
                  <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
                  
                  {/* Admin routes */}
                  <Route path="/admin" element={<PrivateRoute><AdminDashboard /></PrivateRoute>} />
                  <Route path="/instant-wins" element={<PrivateRoute><InstantWins /></PrivateRoute>} />
                  <Route path="/prize-draws" element={<PrivateRoute><PrizeDraws /></PrivateRoute>} />
                  <Route path="/form" element={<PrivateRoute><Index /></PrivateRoute>} />
                  <Route path="/preview" element={<Preview />} />
                  
                  {/* Campaign builders (protected) */}
                  <Route path="/wheel" element={<PrivateRoute><Wheel /></PrivateRoute>} />
                  <Route path="/article-wheel" element={<PrivateRoute><ArticleWheel /></PrivateRoute>} />
                  <Route path="/quiz" element={<PrivateRoute><Quiz /></PrivateRoute>} />
                  <Route path="/jackpot" element={<PrivateRoute><Jackpot /></PrivateRoute>} />
                  <Route path="/scratch" element={<PrivateRoute><Scratch /></PrivateRoute>} />
                  <Route path="/article-scratch" element={<PrivateRoute><ArticleScratch /></PrivateRoute>} />
                  <Route path="/article-quiz" element={<PrivateRoute><ArticleQuiz /></PrivateRoute>} />
                  <Route path="/article-jackpot" element={<PrivateRoute><ArticleJackpot /></PrivateRoute>} />
                  <Route path="/catalog" element={<PrivateRoute><Catalog /></PrivateRoute>} />
                  
                  {/* Public preview routes (for participants) */}
                  <Route path="/wheel-preview" element={<WheelPreview />} />
                  <Route path="/article-wheel-preview" element={<ArticleWheelPreview />} />
                  <Route path="/quiz-preview" element={<QuizPreview />} />
                  <Route path="/jackpot-preview" element={<JackpotPreview />} />
                  <Route path="/scratch-preview" element={<ScratchPreview />} />
                  <Route path="/article-scratch-preview" element={<ArticleScratchPreview />} />
                  <Route path="/article-quiz-preview" element={<ArticleQuizPreview />} />
                  <Route path="/article-jackpot-preview" element={<ArticleJackpotPreview />} />
                  <Route path="/catalog-preview" element={<CatalogPreview />} />
                  
                  {/* Public campaign URLs */}
                  <Route path="/p/:slug" element={<PublicCampaign />} />
                  <Route path="/c/:shortId" element={<ShortUrl />} />
                  
                  {/* Catch-all */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </BrowserRouter>
            </TooltipProvider>
          </ThemeProvider>
          </OrganizationProvider>
        </AuthProvider>
      </QueryClientProvider>
    </HelmetProvider>
  </ErrorBoundary>
);

export default App;
