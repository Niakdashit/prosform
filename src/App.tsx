import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import Index from "./pages/Index";
import Preview from "./pages/Preview";
import Wheel from "./pages/Wheel";
import WheelPreview from "./pages/WheelPreview";
import Quiz from "./pages/Quiz";
import QuizPreview from "./pages/QuizPreview";
import Jackpot from "./pages/Jackpot";
import JackpotPreview from "./pages/JackpotPreview";
import Scratch from "./pages/Scratch";
import ScratchPreview from "./pages/ScratchPreview";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import { GDPRBanner } from "./components/GDPRBanner";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <GDPRBanner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/form" element={<Index />} />
            <Route path="/preview" element={<Preview />} />
            <Route path="/wheel" element={<Wheel />} />
            <Route path="/wheel-preview" element={<WheelPreview />} />
            <Route path="/quiz" element={<Quiz />} />
            <Route path="/quiz-preview" element={<QuizPreview />} />
            <Route path="/jackpot" element={<Jackpot />} />
            <Route path="/jackpot-preview" element={<JackpotPreview />} />
            <Route path="/scratch" element={<Scratch />} />
            <Route path="/scratch-preview" element={<ScratchPreview />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
