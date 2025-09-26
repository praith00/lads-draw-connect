import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Play, User, History, LogOut } from "lucide-react";

interface HomePageProps {
  onLogout: () => void;
}

export const HomePage = ({ onLogout }: HomePageProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Goodbye!",
        description: "Successfully logged out of Lads.",
      });
      onLogout();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handlePlay = () => {
    navigate("/play-options");
  };

  const handleAccountDetails = () => {
    navigate("/account");
  };

  const handleHistory = () => {
    navigate("/history");
  };

  return (
    <div className="min-h-screen bg-gradient-dark">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12 animate-slide-up">
          <h1 className="text-7xl font-bold bg-gradient-main bg-clip-text text-transparent mb-6 animate-float">
            Lads
          </h1>
          <p className="text-xl text-muted-foreground mb-4">
            Communicate through the art of drawing
          </p>
          <div className="w-24 h-1 bg-gradient-main mx-auto rounded-full shadow-glow"></div>
        </div>

        <div className="max-w-2xl mx-auto">
          <div className="grid gap-8">
            <Card className="p-8 shadow-floating hover:shadow-glow transition-spring hover:scale-105 bg-gradient-card border-glass backdrop-blur-sm animate-scale-in">
              <div className="text-center space-y-6">
                <div className="w-20 h-20 bg-gradient-main rounded-full flex items-center justify-center mx-auto shadow-glow animate-pulse-glow">
                  <Play className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-foreground">Start Drawing</h2>
                <p className="text-muted-foreground text-lg">
                  Begin a new drawing conversation with someone special
                </p>
                <Button
                  onClick={handlePlay}
                  size="lg"
                  className="bg-gradient-main hover:shadow-glow transition-spring hover:scale-110 px-8 py-4 text-lg font-semibold"
                >
                  <Play className="w-5 h-5 mr-2" />
                  Play Now
                </Button>
              </div>
            </Card>

            <div className="grid md:grid-cols-3 gap-6">
              <Card className="p-6 shadow-floating hover:shadow-glow transition-spring hover:scale-105 cursor-pointer bg-gradient-card border-glass backdrop-blur-sm animate-slide-up" 
                    onClick={handleAccountDetails}
                    style={{ animationDelay: '0.1s' }}>
                <div className="text-center space-y-4">
                  <div className="w-14 h-14 bg-gradient-secondary rounded-full flex items-center justify-center mx-auto shadow-glass">
                    <User className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="font-semibold text-lg">Account Details</h3>
                  <p className="text-sm text-muted-foreground">Manage your profile and settings</p>
                </div>
              </Card>

              <Card className="p-6 shadow-floating hover:shadow-glow transition-spring hover:scale-105 cursor-pointer bg-gradient-card border-glass backdrop-blur-sm animate-slide-up" 
                    onClick={handleHistory}
                    style={{ animationDelay: '0.2s' }}>
                <div className="text-center space-y-4">
                  <div className="w-14 h-14 bg-gradient-accent rounded-full flex items-center justify-center mx-auto shadow-glass">
                    <History className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="font-semibold text-lg">History</h3>
                  <p className="text-sm text-muted-foreground">View your past drawing conversations</p>
                </div>
              </Card>

              <Card className="p-6 shadow-floating hover:shadow-glow transition-spring hover:scale-105 cursor-pointer bg-gradient-card border-glass backdrop-blur-sm animate-slide-up" 
                    onClick={handleLogout}
                    style={{ animationDelay: '0.3s' }}>
                <div className="text-center space-y-4">
                  <div className="w-14 h-14 bg-destructive/20 rounded-full flex items-center justify-center mx-auto border-2 border-destructive/30">
                    <LogOut className="w-7 h-7 text-destructive" />
                  </div>
                  <h3 className="font-semibold text-lg">Log Out</h3>
                  <p className="text-sm text-muted-foreground">Sign out of your account safely</p>
                </div>
              </Card>
            </div>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="fixed top-10 left-10 w-20 h-20 bg-gradient-main rounded-full opacity-20 animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="fixed bottom-10 right-10 w-16 h-16 bg-gradient-secondary rounded-full opacity-20 animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="fixed top-1/2 right-20 w-12 h-12 bg-gradient-accent rounded-full opacity-20 animate-float" style={{ animationDelay: '3s' }}></div>
      </div>
    </div>
  );
};