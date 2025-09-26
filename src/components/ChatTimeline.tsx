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
    <Card className="p-6 shadow-card border h-fit">
      <h3 className="text-lg font-semibold mb-4 text-foreground">Drawing Timeline</h3>
      
      <ScrollArea className="h-[400px] pr-4">
        {doodles.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              🎨
            </div>
            <p>No doodles yet!</p>
            <p className="text-sm">Start drawing to see the conversation here.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {doodles.map((doodle, index) => (
              <div key={doodle.id} className="flex gap-4">
                <Avatar className="w-10 h-10 bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                  {doodle.sender.charAt(0).toUpperCase()}
                </Avatar>
                
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium text-foreground">{doodle.sender}</span>
                    <span className="text-muted-foreground">•</span>
                    <span className="text-muted-foreground">{formatTime(doodle.timestamp)}</span>
                  </div>
                  
                  <div className="bg-secondary rounded-lg p-3 max-w-sm">
                    <img 
                      src={doodle.imageData} 
                      alt={`Doodle by ${doodle.sender}`}
                      className="w-full h-auto rounded-md shadow-sm"
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