import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { DrawingCanvas } from "@/components/DrawingCanvas";
import { ChatTimeline } from "@/components/ChatTimeline";
import { ArrowLeft } from "lucide-react";

interface Doodle {
  id: string;
  imageData: string;
  timestamp: Date;
  sender: string;
  isOwn: boolean;
}

export const PlayPage = () => {
  const navigate = useNavigate();
  const [gameStarted, setGameStarted] = useState(false);
  const [player1Name, setPlayer1Name] = useState("");
  const [player2Name, setPlayer2Name] = useState("");
  const [currentPlayer, setCurrentPlayer] = useState(1);
  const [doodles, setDoodles] = useState<Doodle[]>([]);

  const handleStartGame = () => {
    if (!player1Name.trim() || !player2Name.trim()) {
      return;
    }
    setGameStarted(true);
  };

  const handleSendDoodle = (canvasData: string) => {
    const playerName = currentPlayer === 1 ? player1Name : player2Name;
    
    const newDoodle: Doodle = {
      id: Date.now().toString(),
      imageData: canvasData,
      timestamp: new Date(),
      sender: playerName,
      isOwn: true,
    };
   
    setDoodles(prev => [...prev, newDoodle]);
    setCurrentPlayer(currentPlayer === 1 ? 2 : 1);
  };

  const handleEndConversation = () => {
    navigate("/");
  };

  const handleBackHome = () => {
    navigate("/");
  };

  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-gradient-dark">
        <div className="container mx-auto px-4 py-8">
          <Button
            onClick={handleBackHome}
            variant="outline"
            className="mb-6 border-glass bg-glass backdrop-blur-sm hover:bg-accent transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>

          <div className="max-w-md mx-auto">
            <Card className="p-8 shadow-floating bg-gradient-card border-glass backdrop-blur-sm animate-scale-in">
              <div className="text-center mb-8">
                <h1 className="text-4xl font-bold bg-gradient-main bg-clip-text text-transparent mb-4">Setup Game</h1>
                <p className="text-muted-foreground text-lg">Enter the names of both players to begin</p>
                <div className="w-16 h-1 bg-gradient-main mx-auto rounded-full mt-4 shadow-glow"></div>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="player1" className="text-sm font-medium">Player 1 Name</Label>
                  <Input
                    id="player1"
                    placeholder="Enter Player 1 name"
                    value={player1Name}
                    onChange={(e) => setPlayer1Name(e.target.value)}
                    className="bg-glass border-glass backdrop-blur-sm focus:border-primary transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="player2" className="text-sm font-medium">Player 2 Name</Label>
                  <Input
                    id="player2"
                    placeholder="Enter Player 2 name"
                    value={player2Name}
                    onChange={(e) => setPlayer2Name(e.target.value)}
                    className="bg-glass border-glass backdrop-blur-sm focus:border-primary transition-colors"
                  />
                </div>

                <Button
                  onClick={handleStartGame}
                  className="w-full bg-gradient-main hover:shadow-glow transition-spring hover:scale-105 py-3 text-lg font-semibold"
                  disabled={!player1Name.trim() || !player2Name.trim()}
                >
                  Start Conversation
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-dark">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8 p-4 bg-glass rounded-lg border border-glass backdrop-blur-sm animate-slide-in">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-main bg-clip-text text-transparent">
              Drawing Conversation
            </h1>
            <p className="text-muted-foreground text-lg mt-1">
              {player1Name} <span className="text-primary">vs</span> {player2Name} • Current turn: 
              <span className="text-primary font-bold ml-2 px-3 py-1 bg-gradient-main/10 rounded-full">
                {currentPlayer === 1 ? player1Name : player2Name}
              </span>
            </p>
          </div>
          
          <Button
            onClick={handleEndConversation}
            variant="outline"
            className="text-destructive hover:bg-destructive/10 border-destructive/30 hover:border-destructive transition-colors"
          >
            End Conversation
          </Button>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="animate-slide-up">
            <DrawingCanvas 
              onSendDoodle={handleSendDoodle}
              currentPlayer={currentPlayer === 1 ? player1Name : player2Name}
            />
          </div>
          <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <ChatTimeline doodles={doodles} />
          </div>
        </div>
      </div>
    </div>
  );
};