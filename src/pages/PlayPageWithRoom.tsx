import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DrawingCanvas } from "@/components/DrawingCanvas";
import { ChatTimeline } from "@/components/ChatTimeline";
import { ArrowLeft, Copy, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Doodle {
  id: string;
  imageData: string;
  timestamp: Date;
  sender: string;
  isOwn: boolean;
}

interface RoomData {
  id: string;
  room_code: string;
  status: string;
  current_players: number;
  max_players: number;
}

interface ConversationData {
  id: string;
  participants: any;
}

export const PlayPageWithRoom = () => {
  const { roomCode } = useParams<{ roomCode: string }>();
  const navigate = useNavigate();
  const [room, setRoom] = useState<RoomData | null>(null);
  const [conversation, setConversation] = useState<ConversationData | null>(null);
  const [doodles, setDoodles] = useState<Doodle[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [participants, setParticipants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (!roomCode) return;
    
    loadRoomData();
    getCurrentUser();
  }, [roomCode]);

  useEffect(() => {
    if (!conversation?.id) return;

    loadDoodles();
    
    // Set up real-time subscription for new doodles
    const doodleSubscription = supabase
      .channel('doodles-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'doodles',
          filter: `conversation_id=eq.${conversation.id}`,
        },
        (payload) => {
          const newDoodle = payload.new as any;
          setDoodles(prev => [...prev, {
            id: newDoodle.id,
            imageData: newDoodle.image_data,
            timestamp: new Date(newDoodle.created_at),
            sender: 'Other Player', // We'll improve this later
            isOwn: newDoodle.sender_id === currentUser?.id
          }]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(doodleSubscription);
    };
  }, [conversation?.id, currentUser?.id]);

  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      setCurrentUser({ ...user, profile });
    }
  };

  const loadRoomData = async () => {
    try {
      // Get room data
      const { data: roomData, error: roomError } = await supabase
        .from('rooms')
        .select('*')
        .eq('room_code', roomCode)
        .single();

      if (roomError || !roomData) {
        toast({
          title: "Room not found",
          description: "The room code you entered doesn't exist.",
          variant: "destructive",
        });
        navigate('/play-options');
        return;
      }

      setRoom(roomData);

      // Get participants
      const { data: participantsData } = await supabase
        .from('room_participants')
        .select(`
          user_id,
          profiles!inner (
            username,
            avatar_url
          )
        `)
        .eq('room_id', roomData.id);

      setParticipants(participantsData || []);

      // Get or create conversation
      const { data: existingConversation } = await supabase
        .from('conversations')
        .select('*')
        .eq('room_id', roomData.id)
        .single();

      if (existingConversation) {
        setConversation(existingConversation);
      } else if (roomData.status === 'active') {
        // Create new conversation when room becomes active
        const participantIds = participantsData?.map(p => p.user_id) || [];
        const participantUsernames = participantsData?.map(p => (p as any).profiles?.username || 'Unknown') || [];
        
        const { data: newConversation, error: convError } = await supabase
          .from('conversations')
          .insert({
            room_id: roomData.id,
            participants: {
              user_ids: participantIds,
              usernames: participantUsernames
            }
          })
          .select()
          .single();

        if (!convError && newConversation) {
          setConversation(newConversation);
        }
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load room data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadDoodles = async () => {
    if (!conversation?.id) return;

    const { data: doodlesData } = await supabase
      .from('doodles')
      .select(`
        *,
        profiles (
          username
        )
      `)
      .eq('conversation_id', conversation.id)
      .order('created_at', { ascending: true });

    if (doodlesData) {
      const formattedDoodles = doodlesData.map(doodle => ({
        id: doodle.id,
        imageData: doodle.image_data,
        timestamp: new Date(doodle.created_at),
        sender: (doodle as any).profiles?.username || 'Unknown',
        isOwn: doodle.sender_id === currentUser?.id
      }));
      setDoodles(formattedDoodles);
    }
  };

  const handleSendDoodle = async (canvasData: string) => {
    if (!conversation?.id || !currentUser?.id) return;

    try {
      const { error } = await supabase
        .from('doodles')
        .insert({
          conversation_id: conversation.id,
          sender_id: currentUser.id,
          image_data: canvasData
        });

      if (error) throw error;

      // The doodle will be added to the list via the real-time subscription
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send doodle",
        variant: "destructive",
      });
    }
  };

  const handleEndConversation = async () => {
    if (!conversation?.id) return;

    try {
      await supabase
        .from('conversations')
        .update({ 
          status: 'completed',
          ended_at: new Date().toISOString()
        })
        .eq('id', conversation.id);

      await supabase
        .from('rooms')
        .update({ status: 'completed' })
        .eq('id', room?.id);

      toast({
        title: "Conversation ended",
        description: "The conversation has been saved to your history.",
      });

      navigate("/");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to end conversation",
        variant: "destructive",
      });
    }
  };

  const copyRoomCode = () => {
    if (room?.room_code) {
      navigator.clipboard.writeText(room.room_code);
      toast({
        title: "Copied!",
        description: "Room code copied to clipboard",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-dark flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary shadow-glow"></div>
          <p className="text-muted-foreground mt-4 text-xl">Loading room...</p>
        </div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-screen bg-gradient-dark flex items-center justify-center">
        <Card className="p-8 shadow-floating bg-gradient-card border-glass backdrop-blur-sm">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Room not found</h2>
            <p className="text-muted-foreground mb-6">The room you're looking for doesn't exist.</p>
            <Button onClick={() => navigate('/play-options')}>
              Back to Play Options
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-dark">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8 p-4 bg-glass rounded-lg border border-glass backdrop-blur-sm animate-slide-in">
          <div className="flex items-center space-x-4">
            <Button
              onClick={() => navigate('/play-options')}
              variant="outline"
              size="sm"
              className="border-glass bg-glass backdrop-blur-sm hover:bg-accent transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            
            <div>
              <h1 className="text-3xl font-bold bg-gradient-main bg-clip-text text-transparent">
                Drawing Room
              </h1>
              <div className="flex items-center space-x-4 mt-1">
                <div className="flex items-center space-x-2">
                  <code className="px-3 py-1 bg-gradient-main/10 rounded text-primary font-mono text-lg font-bold">
                    {room.room_code}
                  </code>
                  <Button
                    onClick={copyRoomCode}
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="flex items-center space-x-2 text-muted-foreground">
                  <Users className="w-4 h-4" />
                  <span>{participants.length}/{room.max_players} players</span>
                </div>
              </div>
            </div>
          </div>
          
          {room.status === 'active' && conversation && (
            <Button
              onClick={handleEndConversation}
              variant="outline"
              className="text-destructive hover:bg-destructive/10 border-destructive/30 hover:border-destructive transition-colors"
            >
              End Conversation
            </Button>
          )}
        </div>

        {room.status === 'waiting' ? (
          <Card className="p-12 shadow-floating bg-gradient-card border-glass backdrop-blur-sm text-center">
            <h2 className="text-4xl font-bold mb-4">Waiting for players...</h2>
            <p className="text-muted-foreground text-xl mb-8">
              Share the room code with your friend to start drawing together
            </p>
            <div className="flex justify-center items-center space-x-4">
              <div className="text-3xl font-mono font-bold px-6 py-3 bg-gradient-main/20 rounded-lg border border-primary/30">
                {room.room_code}
              </div>
              <Button onClick={copyRoomCode} variant="outline">
                <Copy className="w-4 h-4 mr-2" />
                Copy Code
              </Button>
            </div>
          </Card>
        ) : (
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="animate-slide-up">
              <DrawingCanvas 
                onSendDoodle={handleSendDoodle}
                currentPlayer={currentUser?.profile?.username || 'You'}
              />
            </div>
            <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <ChatTimeline doodles={doodles} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};