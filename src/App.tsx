import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import About from "./pages/About";
import Contact from "./pages/Contact";
import DarsEQuran from "./pages/DarsEQuran";
import ListenOnline from "./pages/dars/ListenOnline";
import DownloadDars from "./pages/dars/DownloadDars";
import CompleteDars from "./pages/dars/CompleteDars";
import Speeches from "./pages/Speeches";
import Books from "./pages/Books";
import AdminLogin from "./pages/admin/Login";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminPages from "./pages/admin/Pages";
import AdminPosts from "./pages/admin/Posts";
import AdminNavigation from "./pages/admin/Navigation";
import AdminMedia from "./pages/admin/Media";
import AdminComments from "./pages/admin/Comments";
import AdminSettings from "./pages/admin/Settings";
import AdminHeroSlides from "./pages/admin/HeroSlides";
import AdminDarsAudio from "./pages/admin/DarsAudio";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Index />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/dars-e-quran" element={<DarsEQuran />} />
            <Route path="/dars-e-quran/listen" element={<ListenOnline />} />
            <Route path="/dars-e-quran/download" element={<DownloadDars />} />
            <Route path="/dars-e-quran/complete" element={<CompleteDars />} />
            <Route path="/speeches" element={<Speeches />} />
            <Route path="/books" element={<Books />} />
            
            {/* Admin routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/pages" element={<AdminPages />} />
            <Route path="/admin/posts" element={<AdminPosts />} />
            <Route path="/admin/hero-slides" element={<AdminHeroSlides />} />
            <Route path="/admin/navigation" element={<AdminNavigation />} />
            <Route path="/admin/media" element={<AdminMedia />} />
            <Route path="/admin/comments" element={<AdminComments />} />
            <Route path="/admin/settings" element={<AdminSettings />} />
            <Route path="/admin/dars-audio" element={<AdminDarsAudio />} />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
