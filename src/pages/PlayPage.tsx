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
      <div className="min-h-screen bg-gradient-subtle">
        <div className="container mx-auto px-4 py-8">
          <Button
            onClick={handleBackHome}
            variant="outline"
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>

          <div className="max-w-md mx-auto">
            <Card className="p-8 shadow-card">
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-primary mb-2">Setup Game</h1>
                <p className="text-muted-foreground">Enter the names of both players</p>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="player1">Player 1 Name</Label>
                  <Input
                    id="player1"
                    placeholder="Enter Player 1 name"
                    value={player1Name}
                    onChange={(e) => setPlayer1Name(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="player2">Player 2 Name</Label>
                  <Input
                    id="player2"
                    placeholder="Enter Player 2 name"
                    value={player2Name}
                    onChange={(e) => setPlayer2Name(e.target.value)}
                  />
                </div>

                <Button
                  onClick={handleStartGame}
                  className="w-full bg-gradient-main hover:shadow-glow transition-all duration-300"
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
    <div className="min-h-screen bg-gradient-subtle">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Drawing Conversation
            </h1>
            <p className="text-muted-foreground">
              {player1Name} vs {player2Name} • Current turn: 
              <span className="text-primary font-semibold ml-1">
                {currentPlayer === 1 ? player1Name : player2Name}
              </span>
            </p>
          </div>
          
          <Button
            onClick={handleEndConversation}
            variant="outline"
            className="text-destructive hover:bg-destructive/10"
          >
            End Conversation
          </Button>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <DrawingCanvas 
            onSendDoodle={handleSendDoodle}
            currentPlayer={currentPlayer === 1 ? player1Name : player2Name}
          />
          <ChatTimeline doodles={doodles} />
        </div>
      </div>
    </div>
  );
};