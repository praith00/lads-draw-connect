import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sparkles, Users } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  const handleAuthClick = () => {
    navigate("/auth");
  };

  return (
    <div className="min-h-screen bg-gradient-dark">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <div className="animate-fade-in">
            <h1 className="text-7xl md:text-8xl font-bold bg-gradient-main bg-clip-text text-transparent mb-6">
              BaliLads
            </h1>
            <p className="text-2xl md:text-3xl text-muted-foreground mb-4">
              Draw. Connect. Create Together.
            </p>
            <p className="text-lg text-muted-foreground/80 mb-12 max-w-2xl mx-auto">
              Join the ultimate drawing conversation experience where art meets friendship in real-time collaboration.
            </p>
            <div className="w-24 h-1 bg-gradient-main mx-auto rounded-full mb-16 shadow-glow"></div>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto mb-16">
            <Card className="p-8 shadow-floating bg-gradient-card border-glass backdrop-blur-sm animate-slide-up">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-main rounded-full flex items-center justify-center mx-auto mb-6 shadow-glow">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-4">Creative Expression</h3>
                <p className="text-muted-foreground">
                  Express yourself through drawing with advanced tools and colors
                </p>
              </div>
            </Card>

            <Card className="p-8 shadow-floating bg-gradient-card border-glass backdrop-blur-sm animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-main rounded-full flex items-center justify-center mx-auto mb-6 shadow-glow">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-4">Real-time Collaboration</h3>
                <p className="text-muted-foreground">
                  Draw together with friends or meet new people from around the world
                </p>
              </div>
            </Card>
          </div>

          <div className="animate-slide-up" style={{ animationDelay: '0.4s' }}>
            <Button
              onClick={handleAuthClick}
              className="bg-gradient-main hover:shadow-glow transition-spring hover:scale-105 px-12 py-6 text-xl font-semibold"
            >
              Get Started
            </Button>
          </div>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="fixed top-10 left-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl animate-float"></div>
      <div className="fixed bottom-10 right-10 w-40 h-40 bg-secondary/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
      <div className="fixed top-1/2 right-20 w-24 h-24 bg-accent/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }}></div>
    </div>
  );
};

export default Index;
