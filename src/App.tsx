import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route } from "react-router-dom";

import { SchoolProvider } from "./contexts/SchoolContext";
import Layout from "./components/Layout";

import Index from "./pages/Index";
import About from "./pages/About";
import Admissions from "./pages/Admissions";
import Gallery from "./pages/Gallery";
import NoticeBoard from "./pages/NoticeBoard";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminRegistration from "./pages/admin/AdminRegistration";
import NotFound from "./pages/NotFound";

import RouteProtection from "./components/RouteProtection";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <SchoolProvider>
        <Toaster />
        <Sonner />

        <HashRouter>
          <Routes>

            {/* PUBLIC + LAYOUT */}
            <Route path="/" element={<Layout />}>
              <Route index element={<Index />} />
              <Route path="about" element={<About />} />
              <Route path="admissions" element={<Admissions />} />
              <Route path="gallery" element={<Gallery />} />
              <Route path="notice-board" element={<NoticeBoard />} />
              <Route path="contact" element={<Contact />} />
              <Route path="login" element={<Login />} />

              {/* PROTECTED ADMIN */}
              <Route 
                path="admin/*" 
                element={
                  <RouteProtection>
                    <AdminDashboard />
                  </RouteProtection>
                } 
              />

              <Route path="admin/register" element={<AdminRegistration />} />
            </Route>

            <Route path="*" element={<NotFound />} />

          </Routes>
        </HashRouter>

      </SchoolProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;