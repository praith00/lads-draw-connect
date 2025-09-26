import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Image, Calendar } from "lucide-react";

// Mock data for now - in a real app this would come from Supabase
const mockConversations = [
  {
    id: "1",
    player1: "Alice",
    player2: "Bob", 
    date: "2024-01-20",
    doodleCount: 8,
    preview: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='60'%3E%3Crect width='100' height='60' fill='%23f8f9fa'/%3E%3Ctext x='50' y='35' text-anchor='middle' fill='%23666'%3EPreview%3C/text%3E%3C/svg%3E"
  },
  {
    id: "2", 
    player1: "Charlie",
    player2: "Diana",
    date: "2024-01-19",
    doodleCount: 12,
    preview: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='60'%3E%3Crect width='100' height='60' fill='%23f8f9fa'/%3E%3Ctext x='50' y='35' text-anchor='middle' fill='%23666'%3EPreview%3C/text%3E%3C/svg%3E"
  }
];

export const HistoryPage = () => {
  const navigate = useNavigate();
  const [conversations, setConversations] = useState<typeof mockConversations>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading from database
    setTimeout(() => {
      setConversations(mockConversations);
      setLoading(false);
    }, 1000);
  }, []);

  const handleBackHome = () => {
    navigate("/");
  };

  const handleViewConversation = (conversationId: string) => {
    // This would navigate to a detailed conversation view
    console.log("Viewing conversation:", conversationId);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground mt-4">Loading conversation history...</p>
        </div>
      </div>
    );
  }

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

        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-primary mb-2">Conversation History</h1>
            <p className="text-muted-foreground">View your past drawing conversations</p>
          </div>

          {conversations.length === 0 ? (
            <Card className="p-12 text-center shadow-card">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Image className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No conversations yet</h3>
              <p className="text-muted-foreground mb-6">
                Start your first drawing conversation to see it here!
              </p>
              <Button
                onClick={() => navigate("/play")}
                className="bg-gradient-main hover:shadow-glow transition-all duration-300"
              >
                Start Drawing
              </Button>
            </Card>
          ) : (
            <div className="grid gap-4">
              {conversations.map((conversation) => (
                <Card 
                  key={conversation.id} 
                  className="p-6 shadow-card hover:shadow-glow transition-all duration-300 cursor-pointer"
                  onClick={() => handleViewConversation(conversation.id)}
                >
                  <div className="flex items-center gap-6">
                    <img 
                      src={conversation.preview} 
                      alt="Conversation preview"
                      className="w-20 h-12 rounded-lg bg-muted object-cover"
                    />
                    
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold mb-2">
                        {conversation.player1} vs {conversation.player2}
                      </h3>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(conversation.date).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-1">
                          <Image className="w-4 h-4" />
                          {conversation.doodleCount} doodles
                        </div>
                      </div>
                    </div>
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