import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import Index from "./pages/Index";
import Preview from "./pages/Preview";
import Campaigns from "./pages/Campaigns";
import Stats from "./pages/Stats";
import Contacts from "./pages/Contacts";
import Media from "./pages/Media";
import SettingsPage from "./pages/SettingsPage";
import Wheel from "./pages/Wheel";
import ArticleWheel from "./pages/ArticleWheel";
import ArticleWheelPreview from "./pages/ArticleWheelPreview";
import WheelPreview from "./pages/WheelPreview";
import Quiz from "./pages/Quiz";
import QuizPreview from "./pages/QuizPreview";
import Jackpot from "./pages/Jackpot";
import JackpotPreview from "./pages/JackpotPreview";
import Scratch from "./pages/Scratch";
import ScratchPreview from "./pages/ScratchPreview";
import ArticleScratch from "./pages/ArticleScratch";
import ArticleScratchPreview from "./pages/ArticleScratchPreview";
import ArticleQuiz from "./pages/ArticleQuiz";
import ArticleQuizPreview from "./pages/ArticleQuizPreview";
import ArticleJackpot from "./pages/ArticleJackpot";
import ArticleJackpotPreview from "./pages/ArticleJackpotPreview";
import Prizes from "./pages/Prizes";
import PublicCampaign from "./pages/PublicCampaign";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/campaigns" replace />} />
            <Route path="/campaigns" element={<Campaigns />} />
            <Route path="/stats" element={<Stats />} />
            <Route path="/contacts" element={<Contacts />} />
            <Route path="/prizes" element={<Prizes />} />
            <Route path="/media" element={<Media />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/form" element={<Index />} />
            <Route path="/preview" element={<Preview />} />
            <Route path="/wheel" element={<Wheel />} />
            <Route path="/wheel-preview" element={<WheelPreview />} />
            <Route path="/article-wheel" element={<ArticleWheel />} />
            <Route path="/article-wheel-preview" element={<ArticleWheelPreview />} />
            <Route path="/quiz" element={<Quiz />} />
            <Route path="/quiz-preview" element={<QuizPreview />} />
            <Route path="/jackpot" element={<Jackpot />} />
            <Route path="/jackpot-preview" element={<JackpotPreview />} />
            <Route path="/scratch" element={<Scratch />} />
            <Route path="/scratch-preview" element={<ScratchPreview />} />
            <Route path="/article-scratch" element={<ArticleScratch />} />
            <Route path="/article-scratch-preview" element={<ArticleScratchPreview />} />
            <Route path="/article-quiz" element={<ArticleQuiz />} />
            <Route path="/article-quiz-preview" element={<ArticleQuizPreview />} />
            <Route path="/article-jackpot" element={<ArticleJackpot />} />
            <Route path="/article-jackpot-preview" element={<ArticleJackpotPreview />} />
            <Route path="/p/:slug" element={<PublicCampaign />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
