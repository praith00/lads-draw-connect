import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Clock, Users, Image } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ConversationHistory {
  id: string;
  participants: any;
  started_at: string;
  ended_at: string | null;
  doodle_count: number;
  room_code: string;
}

export const HistoryPageNew = () => {
  const navigate = useNavigate();
  const [conversations, setConversations] = useState<ConversationHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadConversationHistory();
  }, []);

  const loadConversationHistory = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: conversationsData, error } = await supabase
        .from('conversations')
        .select(`
          id,
          participants,
          started_at,
          ended_at,
          rooms (
            room_code
          )
        `)
        .eq('status', 'completed')
        .contains('participants', { user_ids: [user.id] })
        .order('ended_at', { ascending: false });

      if (error) throw error;

      // Get doodle counts for each conversation
      const conversationsWithCounts = await Promise.all(
        (conversationsData || []).map(async (conv) => {
          const { count } = await supabase
            .from('doodles')
            .select('*', { count: 'exact', head: true })
            .eq('conversation_id', conv.id);

          return {
            ...conv,
            doodle_count: count || 0,
            room_code: (conv as any).rooms?.room_code || ((conv.participants as any)?.mode === 'custom' ? 'CUSTOM' : 'N/A')
          };
        })
      );

      setConversations(conversationsWithCounts);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load conversation history",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewConversation = (conversationId: string) => {
    navigate(`/history/${conversationId}`);
  };

  const handleBackHome = () => {
    navigate("/");
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
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
          <p className="text-muted-foreground mt-4 text-xl">Loading history...</p>
        </div>
      </div>
    );
  }

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

        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold bg-gradient-main bg-clip-text text-transparent mb-4">
              Drawing History
            </h1>
            <p className="text-muted-foreground text-xl">
              Review your past drawing conversations
            </p>
            <div className="w-20 h-1 bg-gradient-main mx-auto rounded-full mt-6 shadow-glow"></div>
          </div>

          {conversations.length === 0 ? (
            <Card className="p-12 shadow-floating bg-gradient-card border-glass backdrop-blur-sm text-center">
              <div className="w-16 h-16 bg-gradient-main/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Clock className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold mb-4">No conversations yet</h2>
              <p className="text-muted-foreground mb-8">
                Start drawing with friends to see your conversation history here
              </p>
              <Button
                onClick={() => navigate("/play-options")}
                className="bg-gradient-main hover:shadow-glow transition-spring hover:scale-105"
              >
                Start Drawing
              </Button>
            </Card>
          ) : (
            <div className="grid gap-6">
              {conversations.map((conversation, index) => (
                <Card
                  key={conversation.id}
                  className="p-6 shadow-floating bg-gradient-card border-glass backdrop-blur-sm hover:scale-105 transition-spring cursor-pointer animate-slide-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                  onClick={() => handleViewConversation(conversation.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-main rounded-full flex items-center justify-center shadow-glow">
                        <Users className="w-6 h-6 text-white" />
                      </div>
                      
                      <div>
                        <h3 className="text-xl font-bold mb-1">
                          {getParticipantNames(conversation.participants)}
                        </h3>
                        <div className="flex items-center space-x-4 text-muted-foreground">
                          <div className="flex items-center space-x-1">
                            <Clock className="w-4 h-4" />
                            <span>{formatDate(conversation.ended_at || conversation.started_at)}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Image className="w-4 h-4" />
                            <span>{conversation.doodle_count} doodles</span>
                          </div>
                          <code className="px-2 py-1 bg-primary/10 rounded text-primary text-sm">
                            {conversation.room_code}
                          </code>
                        </div>
                      </div>
                    </div>
                    
                    <Button variant="ghost" size="sm">
                      View →
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};