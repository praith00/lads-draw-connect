import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";

import { AuthPage } from "@/components/Auth/AuthPage";
import { HomePage } from "@/pages/HomePage";
import { PlayPageWithRoom } from "@/pages/PlayPageWithRoom";
import { CustomPlayPage } from "@/pages/CustomPlayPage";
import { PlayOptions } from "@/components/PlayOptions";
import { AccountPage } from "@/pages/AccountPage";
import { HistoryPageNew } from "@/pages/HistoryPageNew";
import { ConversationViewPage } from "@/pages/ConversationViewPage";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check current auth status
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleAuthSuccess = () => {
    // Session will be updated automatically via auth state change listener
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-dark flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary shadow-glow"></div>
          <p className="text-muted-foreground mt-4 text-xl">Loading BaliLads...</p>
        </div>
      </div>
    );
  }

  const isAuthenticated = !!session;

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {isAuthenticated ? (
              <>
                <Route path="/" element={<HomePage onLogout={handleLogout} />} />
                <Route path="/play-options" element={<PlayOptions />} />
                <Route path="/play/custom" element={<CustomPlayPage />} />
                <Route path="/play/:roomCode" element={<PlayPageWithRoom />} />
                <Route path="/account" element={<AccountPage />} />
                <Route path="/history" element={<HistoryPageNew />} />
                <Route path="/history/:conversationId" element={<ConversationViewPage />} />
              </>
            ) : (
              <>
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<AuthPage onAuthSuccess={handleAuthSuccess} />} />
              </>
            )}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
