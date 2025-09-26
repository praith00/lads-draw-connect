import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DrawingCanvas } from "@/components/DrawingCanvas";
import { ChatTimeline } from "@/components/ChatTimeline";
import { ArrowLeft, Play, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Doodle {
  id: string;
  imageData: string;
  timestamp: Date;
  sender: string;
  isOwn: boolean;
}

interface GameSession {
  player1Name: string;
  player2Name: string;
  currentPlayer: 1 | 2;
  doodles: Doodle[];
  sessionId: string;
}

export const CustomPlayPage = () => {
  const navigate = useNavigate();
  const [gameStarted, setGameStarted] = useState(false);
  const [player1Name, setPlayer1Name] = useState("");
  const [player2Name, setPlayer2Name] = useState("");
  const [session, setSession] = useState<GameSession | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const { toast } = useToast();

  const handleStartGame = async () => {
    if (!player1Name.trim() || !player2Name.trim()) {
      toast({
        title: "Missing names",
        description: "Please enter names for both players",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Create a conversation for the custom session
      const { data: newConversation, error: convError } = await supabase
        .from('conversations')
        .insert({
          room_id: null, // Custom sessions don't have rooms
          participants: {
            user_ids: [user.id],
            usernames: [player1Name.trim(), player2Name.trim()],
            mode: 'custom'
          },
          status: 'active'
        })
        .select()
        .single();

      if (convError) throw convError;

      const newSession: GameSession = {
        player1Name: player1Name.trim(),
        player2Name: player2Name.trim(),
        currentPlayer: 1,
        doodles: [],
        sessionId: newConversation.id
      };

      setSession(newSession);
      setConversationId(newConversation.id);
      setGameStarted(true);

      toast({
        title: "Game started!",
        description: `${player1Name} goes first`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to start custom game",
        variant: "destructive",
      });
    }
  };

  const handleSendDoodle = async (canvasData: string) => {
    if (!session || !conversationId) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const currentPlayerName = session.currentPlayer === 1 ? session.player1Name : session.player2Name;

      // Save to database
      const { error } = await supabase
        .from('doodles')
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          image_data: canvasData
        });

      if (error) throw error;

      // Update local state
      const newDoodle: Doodle = {
        id: Date.now().toString(),
        imageData: canvasData,
        timestamp: new Date(),
        sender: currentPlayerName,
        isOwn: true
      };

      const updatedSession = {
        ...session,
        currentPlayer: (session.currentPlayer === 1 ? 2 : 1) as 1 | 2,
        doodles: [...session.doodles, newDoodle]
      };

      setSession(updatedSession);

      const nextPlayerName = updatedSession.currentPlayer === 1 ? session.player1Name : session.player2Name;
      toast({
        title: "Turn completed!",
        description: `It's ${nextPlayerName}'s turn now`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save doodle",
        variant: "destructive",
      });
    }
  };

  const handleEndSession = async () => {
    if (!conversationId) return;

    try {
      await supabase
        .from('conversations')
        .update({ 
          status: 'completed',
          ended_at: new Date().toISOString()
        })
        .eq('id', conversationId);

      toast({
        title: "Session ended",
        description: "The custom session has been saved to your history.",
      });

      navigate("/");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to end session",
        variant: "destructive",
      });
    }
  };

  const handleBackToOptions = () => {
    navigate("/play-options");
  };

  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-gradient-dark">
        <div className="container mx-auto px-4 py-8">
          <Button
            onClick={handleBackToOptions}
            variant="outline"
            className="mb-6 border-glass bg-glass backdrop-blur-sm hover:bg-accent transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Play Options
          </Button>

          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-5xl font-bold bg-gradient-main bg-clip-text text-transparent mb-4">
                Custom Mode
              </h1>
              <p className="text-muted-foreground text-xl">
                Set up a local 2-player drawing session
              </p>
              <div className="w-20 h-1 bg-gradient-main mx-auto rounded-full mt-6 shadow-glow"></div>
            </div>

            <Card className="p-8 shadow-floating bg-gradient-card border-glass backdrop-blur-sm">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-main rounded-full flex items-center justify-center mx-auto mb-6 shadow-glow">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl font-bold mb-4">Player Setup</h2>
                <p className="text-muted-foreground">
                  Enter the names for both players who will be drawing
                </p>
              </div>
              
              <div className="max-w-md mx-auto space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="player1">Player 1 Name</Label>
                  <Input
                    id="player1"
                    placeholder="Enter Player 1 name"
                    value={player1Name}
                    onChange={(e) => setPlayer1Name(e.target.value)}
                    className="bg-glass border-glass backdrop-blur-sm focus:border-primary transition-colors"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="player2">Player 2 Name</Label>
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
                  className="w-full bg-gradient-main hover:shadow-glow transition-spring hover:scale-105 py-3 text-lg"
                  disabled={!player1Name.trim() || !player2Name.trim()}
                >
                  <Play className="w-5 h-5 mr-2" />
                  Start Drawing Session
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="min-h-screen bg-gradient-dark">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8 p-4 bg-glass rounded-lg border border-glass backdrop-blur-sm animate-slide-in">
          <div className="flex items-center space-x-4">
            <Button
              onClick={handleBackToOptions}
              variant="outline"
              size="sm"
              className="border-glass bg-glass backdrop-blur-sm hover:bg-accent transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            
            <div>
              <h1 className="text-3xl font-bold bg-gradient-main bg-clip-text text-transparent">
                Custom Drawing Session
              </h1>
              <div className="flex items-center space-x-4 mt-1 text-muted-foreground">
                <span>{session.player1Name} & {session.player2Name}</span>
                <div className="px-3 py-1 bg-gradient-main/20 rounded text-primary font-semibold">
                  {session.currentPlayer === 1 ? session.player1Name : session.player2Name}'s Turn
                </div>
              </div>
            </div>
          </div>
          
          <Button
            onClick={handleEndSession}
            variant="outline"
            className="text-destructive hover:bg-destructive/10 border-destructive/30 hover:border-destructive transition-colors"
          >
            End Session
          </Button>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="animate-slide-up">
            <DrawingCanvas 
              onSendDoodle={handleSendDoodle}
              currentPlayer={session.currentPlayer === 1 ? session.player1Name : session.player2Name}
            />
          </div>
          <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <ChatTimeline doodles={session.doodles} />
          </div>
        </div>
      </div>
    </div>
  );
};