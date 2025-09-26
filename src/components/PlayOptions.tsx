import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Users, Shuffle, UserPlus, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const PlayOptions = () => {
  const navigate = useNavigate();
  const [selectedOption, setSelectedOption] = useState<"random" | "friends" | null>(null);
  const [friendOption, setFriendOption] = useState<"join" | "create" | null>(null);
  const [roomCode, setRoomCode] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleBackHome = () => {
    navigate("/");
  };

  const handleRandomMatch = async () => {
    setLoading(true);
    try {
      // Look for available rooms with waiting status
      const { data: availableRooms, error: queryError } = await supabase
        .from('rooms')
        .select('*')
        .eq('status', 'waiting')
        .lt('current_players', 2)
        .limit(1);

      if (queryError) throw queryError;

      if (availableRooms && availableRooms.length > 0) {
        // Join existing room
        const room = availableRooms[0];
        const { error: joinError } = await supabase
          .from('room_participants')
          .insert({ room_id: room.id, user_id: (await supabase.auth.getUser()).data.user?.id });

        if (joinError) throw joinError;

        // Update room player count
        await supabase
          .from('rooms')
          .update({ current_players: 2, status: 'active' })
          .eq('id', room.id);

        navigate(`/play/${room.room_code}`);
      } else {
        // Create new room for random matching
        const { data: roomCodeData, error: roomCodeError } = await supabase.rpc('generate_room_code');
        if (roomCodeError) throw roomCodeError;

        const { data: newRoom, error: createError } = await supabase
          .from('rooms')
          .insert({
            room_code: roomCodeData,
            creator_id: (await supabase.auth.getUser()).data.user?.id,
            status: 'waiting'
          })
          .select()
          .single();

        if (createError) throw createError;

        // Add creator as participant
        await supabase
          .from('room_participants')
          .insert({ room_id: newRoom.id, user_id: (await supabase.auth.getUser()).data.user?.id });

        toast({
          title: "Waiting for match...",
          description: "Looking for another player to join your room.",
        });

        navigate(`/play/${newRoom.room_code}`);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to find match",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRoom = async () => {
    if (!roomCode.trim()) return;

    setLoading(true);
    try {
      // Find room by code
      const { data: room, error: findError } = await supabase
        .from('rooms')
        .select('*')
        .eq('room_code', roomCode.toUpperCase())
        .single();

      if (findError || !room) {
        toast({
          title: "Room not found",
          description: "Please check the room code and try again.",
          variant: "destructive",
        });
        return;
      }

      if (room.current_players >= room.max_players) {
        toast({
          title: "Room is full",
          description: "This room is already at capacity.",
          variant: "destructive",
        });
        return;
      }

      // Join room
      const { error: joinError } = await supabase
        .from('room_participants')
        .insert({ room_id: room.id, user_id: (await supabase.auth.getUser()).data.user?.id });

      if (joinError) throw joinError;

      // Update room player count
      await supabase
        .from('rooms')
        .update({ 
          current_players: room.current_players + 1,
          status: room.current_players + 1 >= room.max_players ? 'active' : 'waiting'
        })
        .eq('id', room.id);

      navigate(`/play/${room.room_code}`);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to join room",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRoom = async () => {
    setLoading(true);
    try {
      const { data: roomCodeData, error: roomCodeError } = await supabase.rpc('generate_room_code');
      if (roomCodeError) throw roomCodeError;

      const { data: newRoom, error: createError } = await supabase
        .from('rooms')
        .insert({
          room_code: roomCodeData,
          creator_id: (await supabase.auth.getUser()).data.user?.id,
          status: 'waiting'
        })
        .select()
        .single();

      if (createError) throw createError;

      // Add creator as participant
      await supabase
        .from('room_participants')
        .insert({ room_id: newRoom.id, user_id: (await supabase.auth.getUser()).data.user?.id });

      toast({
        title: "Room created!",
        description: `Share code: ${newRoom.room_code}`,
      });

      navigate(`/play/${newRoom.room_code}`);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create room",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

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

        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold bg-gradient-main bg-clip-text text-transparent mb-4">
              Start Drawing
            </h1>
            <p className="text-muted-foreground text-xl">
              Choose how you want to play
            </p>
            <div className="w-20 h-1 bg-gradient-main mx-auto rounded-full mt-6 shadow-glow"></div>
          </div>

          {!selectedOption && (
            <div className="grid md:grid-cols-2 gap-8 animate-fade-in">
              <Card 
                className="p-8 shadow-floating bg-gradient-card border-glass backdrop-blur-sm cursor-pointer hover:scale-105 transition-spring group"
                onClick={() => setSelectedOption("random")}
              >
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-main rounded-full flex items-center justify-center mx-auto mb-6 group-hover:shadow-glow transition-all">
                    <Shuffle className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold mb-4">Random Match</h2>
                  <p className="text-muted-foreground">
                    Get matched with a random player and start drawing together
                  </p>
                </div>
              </Card>

              <Card 
                className="p-8 shadow-floating bg-gradient-card border-glass backdrop-blur-sm cursor-pointer hover:scale-105 transition-spring group"
                onClick={() => setSelectedOption("friends")}
              >
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-main rounded-full flex items-center justify-center mx-auto mb-6 group-hover:shadow-glow transition-all">
                    <Users className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold mb-4">With Friends</h2>
                  <p className="text-muted-foreground">
                    Create a room or join your friends using a room code
                  </p>
                </div>
              </Card>
            </div>
          )}

          {selectedOption === "random" && (
            <Card className="p-8 shadow-floating bg-gradient-card border-glass backdrop-blur-sm animate-scale-in">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-main rounded-full flex items-center justify-center mx-auto mb-6 shadow-glow">
                  <Shuffle className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl font-bold mb-4">Random Match</h2>
                <p className="text-muted-foreground mb-8">
                  We'll find another player for you to draw with
                </p>
                <Button
                  onClick={handleRandomMatch}
                  className="bg-gradient-main hover:shadow-glow transition-spring hover:scale-105 px-8 py-3 text-lg"
                  disabled={loading}
                >
                  {loading ? "Finding match..." : "Find Random Player"}
                </Button>
              </div>
            </Card>
          )}

          {selectedOption === "friends" && !friendOption && (
            <div className="grid md:grid-cols-2 gap-8 animate-scale-in">
              <Card 
                className="p-8 shadow-floating bg-gradient-card border-glass backdrop-blur-sm cursor-pointer hover:scale-105 transition-spring group"
                onClick={() => setFriendOption("join")}
              >
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-main rounded-full flex items-center justify-center mx-auto mb-6 group-hover:shadow-glow transition-all">
                    <UserPlus className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold mb-4">Join Room</h2>
                  <p className="text-muted-foreground">
                    Enter a 6-character code to join your friend's room
                  </p>
                </div>
              </Card>

              <Card 
                className="p-8 shadow-floating bg-gradient-card border-glass backdrop-blur-sm cursor-pointer hover:scale-105 transition-spring group"
                onClick={() => setFriendOption("create")}
              >
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-main rounded-full flex items-center justify-center mx-auto mb-6 group-hover:shadow-glow transition-all">
                    <Plus className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold mb-4">Create Room</h2>
                  <p className="text-muted-foreground">
                    Create a room and get a code to share with friends
                  </p>
                </div>
              </Card>
            </div>
          )}

          {friendOption === "join" && (
            <Card className="p-8 shadow-floating bg-gradient-card border-glass backdrop-blur-sm animate-scale-in">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-main rounded-full flex items-center justify-center mx-auto mb-6 shadow-glow">
                  <UserPlus className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl font-bold mb-4">Join Room</h2>
                <p className="text-muted-foreground mb-8">
                  Enter the 6-character room code from your friend
                </p>
                
                <div className="max-w-sm mx-auto space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="room-code">Room Code</Label>
                    <Input
                      id="room-code"
                      placeholder="ABC123"
                      value={roomCode}
                      onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                      className="bg-glass border-glass backdrop-blur-sm focus:border-primary transition-colors text-center text-xl font-mono"
                      maxLength={6}
                    />
                  </div>
                  
                  <Button
                    onClick={handleJoinRoom}
                    className="w-full bg-gradient-main hover:shadow-glow transition-spring hover:scale-105 py-3"
                    disabled={loading || roomCode.length !== 6}
                  >
                    {loading ? "Joining..." : "Join Room"}
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {friendOption === "create" && (
            <Card className="p-8 shadow-floating bg-gradient-card border-glass backdrop-blur-sm animate-scale-in">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-main rounded-full flex items-center justify-center mx-auto mb-6 shadow-glow">
                  <Plus className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl font-bold mb-4">Create Room</h2>
                <p className="text-muted-foreground mb-8">
                  Create a room and share the code with your friends
                </p>
                
                <Button
                  onClick={handleCreateRoom}
                  className="bg-gradient-main hover:shadow-glow transition-spring hover:scale-105 px-8 py-3 text-lg"
                  disabled={loading}
                >
                  {loading ? "Creating room..." : "Create Room"}
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};