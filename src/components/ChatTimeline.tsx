import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";

interface Doodle {
  id: string;
  imageData: string;
  timestamp: Date;
  sender: string;
  isOwn: boolean;
}

interface ChatTimelineProps {
  doodles: Doodle[];
}

export const ChatTimeline = ({ doodles }: ChatTimelineProps) => {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Card className="p-6 shadow-floating border-glass bg-gradient-card backdrop-blur-sm h-fit">
      <h3 className="text-lg font-semibold mb-6 text-foreground flex items-center gap-3">
        <div className="w-8 h-8 bg-gradient-main rounded-full flex items-center justify-center">
          <span className="text-white text-sm">💬</span>
        </div>
        Drawing Timeline
      </h3>
      
      <ScrollArea className="h-[500px] pr-4">
        {doodles.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground animate-scale-in">
            <div className="w-20 h-20 bg-gradient-main/10 rounded-full flex items-center justify-center mx-auto mb-6 animate-float">
              <span className="text-3xl">🎨</span>
            </div>
            <h4 className="text-lg font-semibold mb-2 text-foreground">No doodles yet!</h4>
            <p className="text-sm">Start drawing to see the conversation timeline here.</p>
            <div className="w-12 h-1 bg-gradient-main mx-auto rounded-full mt-4 opacity-50"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {doodles.map((doodle, index) => (
              <div 
                key={doodle.id} 
                className="flex gap-4 animate-slide-in opacity-0"
                style={{ 
                  animation: `slide-in 0.5s ease-out ${index * 0.1}s forwards`,
                }}
              >
                <Avatar className="w-12 h-12 bg-gradient-main text-white flex items-center justify-center text-sm font-bold shadow-glow ring-2 ring-primary/20">
                  {doodle.sender.charAt(0).toUpperCase()}
                </Avatar>
                
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <span className="font-semibold text-foreground bg-glass px-3 py-1 rounded-full border border-glass">
                      {doodle.sender}
                    </span>
                    <span className="text-muted-foreground">•</span>
                    <span className="text-primary font-medium">{formatTime(doodle.timestamp)}</span>
                  </div>
                  
                  <div className="bg-glass rounded-xl p-4 border border-glass shadow-glass backdrop-blur-sm hover:shadow-glow transition-all duration-300 max-w-sm group">
                    <img 
                      src={doodle.imageData} 
                      alt={`Doodle by ${doodle.sender}`}
                      className="w-full h-auto rounded-lg shadow-md group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </Card>
  );
};