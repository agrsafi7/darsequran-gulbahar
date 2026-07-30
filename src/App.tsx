import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ScrollToTop } from "@/components/shared/ScrollToTop";
import Index from "./pages/Index";
const About = lazy(() => import("./pages/About"));
const Contact = lazy(() => import("./pages/Contact"));
const DarsEQuran = lazy(() => import("./pages/DarsEQuran"));
const ListenOnline = lazy(() => import("./pages/dars/ListenOnline"));
const DownloadDars = lazy(() => import("./pages/dars/DownloadDars"));
const CompleteDars = lazy(() => import("./pages/dars/CompleteDars"));
const ScholarPage = lazy(() => import("./pages/dars/ScholarPage"));
const SubcategoryPage = lazy(() => import("./pages/dars/SubcategoryPage"));
const CategoryPage = lazy(() => import("./pages/CategoryPage"));
const Posts = lazy(() => import("./pages/Posts"));
const PostDetail = lazy(() => import("./pages/PostDetail"));
const PageDetail = lazy(() => import("./pages/PageDetail"));
const AdminLogin = lazy(() => import("./pages/admin/Login"));
const AdminDashboard = lazy(() => import("./pages/admin/Dashboard"));
const AdminPages = lazy(() => import("./pages/admin/Pages"));
const AdminPosts = lazy(() => import("./pages/admin/Posts"));
const AdminCategories = lazy(() => import("./pages/admin/Categories"));
const AdminNavigation = lazy(() => import("./pages/admin/Navigation"));
const AdminMedia = lazy(() => import("./pages/admin/Media"));
const AdminComments = lazy(() => import("./pages/admin/Comments"));
const AdminSettings = lazy(() => import("./pages/admin/Settings"));
const AdminHeroSlides = lazy(() => import("./pages/admin/HeroSlides"));
const AdminAdPlacements = lazy(() => import("./pages/admin/AdPlacements"));
const AdminAnalytics = lazy(() => import("./pages/admin/Analytics"));
const AdminLiveStreams = lazy(() => import("./pages/admin/LiveStreams"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
          <Suspense fallback={<div className="min-h-screen" />}>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Index />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/posts" element={<Posts />} />
            <Route path="/post/:slug" element={<PostDetail />} />
            <Route path="/page/:slug" element={<PageDetail />} />
            
            {/* Dars-e-Quran specific routes */}
            <Route path="/dars-e-quran" element={<DarsEQuran />} />
            <Route path="/dars-e-quran/listen" element={<ListenOnline />} />
            <Route path="/dars-e-quran/download" element={<DownloadDars />} />
            <Route path="/dars-e-quran/complete" element={<CompleteDars />} />
            <Route path="/dars-e-quran/:slug" element={<ScholarPage />} />
            <Route path="/dars-e-quran/:scholarSlug/:categorySlug" element={<SubcategoryPage />} />
            
            {/* Dynamic category routes - handles any category with hierarchy */}
            <Route path="/:slug" element={<CategoryPage />} />
            <Route path="/:slug/:subSlug" element={<CategoryPage />} />
            
            {/* Admin routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/pages" element={<AdminPages />} />
            <Route path="/admin/posts" element={<AdminPosts />} />
            <Route path="/admin/categories" element={<AdminCategories />} />
            <Route path="/admin/hero-slides" element={<AdminHeroSlides />} />
            <Route path="/admin/navigation" element={<AdminNavigation />} />
            <Route path="/admin/media" element={<AdminMedia />} />
            <Route path="/admin/comments" element={<AdminComments />} />
            <Route path="/admin/ads" element={<AdminAdPlacements />} />
            <Route path="/admin/analytics" element={<AdminAnalytics />} />
            <Route path="/admin/live-streams" element={<AdminLiveStreams />} />
            <Route path="/admin/settings" element={<AdminSettings />} />
            
            
            <Route path="*" element={<NotFound />} />
          </Routes>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
