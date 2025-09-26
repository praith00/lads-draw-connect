import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChatTimeline } from "@/components/ChatTimeline";
import { ArrowLeft, Users, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Doodle {
  id: string;
  imageData: string;
  timestamp: Date;
  sender: string;
  isOwn: boolean;
}

interface ConversationData {
  id: string;
  participants: any;
  started_at: string;
  ended_at: string | null;
  room_code: string;
}

export const ConversationViewPage = () => {
  const { conversationId } = useParams<{ conversationId: string }>();
  const navigate = useNavigate();
  const [conversation, setConversation] = useState<ConversationData | null>(null);
  const [doodles, setDoodles] = useState<Doodle[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (!conversationId) return;
    
    loadConversationData();
    getCurrentUser();
  }, [conversationId]);

  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUser(user);
  };

  const loadConversationData = async () => {
    try {
      // Get conversation data
      const { data: conversationData, error: convError } = await supabase
        .from('conversations')
        .select(`
          id,
          participants,
          started_at,
          ended_at,
          rooms!inner (
            room_code
          )
        `)
        .eq('id', conversationId)
        .single();

      if (convError || !conversationData) {
        toast({
          title: "Conversation not found",
          description: "The conversation you're looking for doesn't exist.",
          variant: "destructive",
        });
        navigate('/history');
        return;
      }

      setConversation({
        ...conversationData,
        room_code: (conversationData as any).rooms?.room_code || 'Unknown'
      });

      // Get doodles
      const { data: doodlesData, error: doodlesError } = await supabase
        .from('doodles')
        .select(`
          *,
          profiles!inner (
            username
          )
        `)
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (doodlesError) throw doodlesError;

      if (doodlesData) {
        const formattedDoodles = doodlesData.map(doodle => ({
          id: doodle.id,
          imageData: doodle.image_data,
          timestamp: new Date(doodle.created_at),
          sender: (doodle as any).profiles?.username || 'Unknown',
          isOwn: false // All are historical, so none are "own"
        }));
        setDoodles(formattedDoodles);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load conversation",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getParticipantNames = (participants: any) => {
    if (participants?.usernames) {
      return participants.usernames.join(' & ');
    }
    return 'Unknown participants';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-dark flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary shadow-glow"></div>
          <p className="text-muted-foreground mt-4 text-xl">Loading conversation...</p>
        </div>
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className="min-h-screen bg-gradient-dark flex items-center justify-center">
        <Card className="p-8 shadow-floating bg-gradient-card border-glass backdrop-blur-sm">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Conversation not found</h2>
            <p className="text-muted-foreground mb-6">The conversation you're looking for doesn't exist.</p>
            <Button onClick={() => navigate('/history')}>
              Back to History
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
              onClick={() => navigate('/history')}
              variant="outline"
              size="sm"
              className="border-glass bg-glass backdrop-blur-sm hover:bg-accent transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to History
            </Button>
            
            <div>
              <h1 className="text-3xl font-bold bg-gradient-main bg-clip-text text-transparent">
                Drawing Conversation
              </h1>
              <div className="flex items-center space-x-4 mt-1 text-muted-foreground">
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4" />
                  <span>{getParticipantNames(conversation.participants)}</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4" />
                  <span>{formatDate(conversation.ended_at || conversation.started_at)}</span>
                </div>
                
                <code className="px-2 py-1 bg-primary/10 rounded text-primary">
                  {conversation.room_code}
                </code>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
          <Card className="p-6 shadow-floating bg-gradient-card border-glass backdrop-blur-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Conversation Timeline</h2>
              <div className="text-muted-foreground">
                {doodles.length} doodles
              </div>
            </div>
            
            <ChatTimeline doodles={doodles} />
          </Card>
        </div>
      </div>
    </div>
  );
};