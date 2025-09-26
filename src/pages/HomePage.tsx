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
    navigate("/play");
  };

  const handleAccountDetails = () => {
    navigate("/account");
  };

  const handleHistory = () => {
    navigate("/history");
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold text-primary mb-4">Lads</h1>
          <p className="text-xl text-muted-foreground">
            Communicate through the art of drawing
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          <div className="grid gap-6">
            <Card className="p-8 shadow-card hover:shadow-glow transition-all duration-300">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                  <Play className="w-8 h-8 text-primary" />
                </div>
                <h2 className="text-2xl font-semibold">Start Drawing</h2>
                <p className="text-muted-foreground">
                  Begin a new drawing conversation with someone
                </p>
                <Button
                  onClick={handlePlay}
                  size="lg"
                  className="bg-gradient-main hover:shadow-glow transition-all duration-300"
                >
                  Play Now
                </Button>
              </div>
            </Card>

            <div className="grid md:grid-cols-3 gap-4">
              <Card className="p-6 shadow-card hover:shadow-glow transition-all duration-300 cursor-pointer" onClick={handleAccountDetails}>
                <div className="text-center space-y-3">
                  <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center mx-auto">
                    <User className="w-6 h-6 text-secondary-foreground" />
                  </div>
                  <h3 className="font-semibold">Account Details</h3>
                  <p className="text-sm text-muted-foreground">Manage your profile</p>
                </div>
              </Card>

              <Card className="p-6 shadow-card hover:shadow-glow transition-all duration-300 cursor-pointer" onClick={handleHistory}>
                <div className="text-center space-y-3">
                  <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center mx-auto">
                    <History className="w-6 h-6 text-secondary-foreground" />
                  </div>
                  <h3 className="font-semibold">History</h3>
                  <p className="text-sm text-muted-foreground">View past conversations</p>
                </div>
              </Card>

              <Card className="p-6 shadow-card hover:shadow-glow transition-all duration-300 cursor-pointer" onClick={handleLogout}>
                <div className="text-center space-y-3">
                  <div className="w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mx-auto">
                    <LogOut className="w-6 h-6 text-destructive" />
                  </div>
                  <h3 className="font-semibold">Log Out</h3>
                  <p className="text-sm text-muted-foreground">Sign out of your account</p>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};