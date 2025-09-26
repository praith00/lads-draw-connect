import { useEffect, useRef, useState } from "react";
import { Canvas as FabricCanvas, PencilBrush } from "fabric";
import { Button } from "@/components/ui/button";
import { Palette, Undo, Trash2, Send } from "lucide-react";
import { toast } from "sonner";

interface DrawingCanvasProps {
  onSendDoodle: (canvasData: string) => void;
  currentPlayer?: string;
}

const COLORS = [
  "#8B5CF6", "#A855F7", "#9333EA", "#7C3AED",
  "#000000", "#EF4444", "#10B981", "#F59E0B"
];

export const DrawingCanvas = ({ onSendDoodle, currentPlayer }: DrawingCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<FabricCanvas | null>(null);
  const [activeColor, setActiveColor] = useState("#8B5CF6");
  const [showColorPicker, setShowColorPicker] = useState(false);

  useEffect(() => {
    if (!canvasRef.current) {
      console.log("No canvas ref");
      return;
    }

    console.log("Creating canvas...");
    const canvas = new FabricCanvas(canvasRef.current, {
      width: 500,
      height: 400,
      backgroundColor: "#fafafa",
    });

    console.log("Canvas created:", canvas);

    // Set up drawing mode
    canvas.isDrawingMode = true;
   
    // Create and configure the pencil brush
    const brush = new PencilBrush(canvas);
    brush.color = activeColor;
    brush.width = 4;
    canvas.freeDrawingBrush = brush;
   
    console.log("Drawing mode enabled:", canvas.isDrawingMode);
    console.log("Brush configured:", brush);

    setFabricCanvas(canvas);

    return () => {
      console.log("Disposing canvas");
      canvas.dispose();
    };
  }, []);

  useEffect(() => {
    if (!fabricCanvas) return;
   
    console.log("Updating brush color:", activeColor);
    fabricCanvas.freeDrawingBrush.color = activeColor;
    fabricCanvas.renderAll();
  }, [activeColor, fabricCanvas]);

  const handleClear = () => {
    if (!fabricCanvas) return;
    fabricCanvas.clear();
    fabricCanvas.backgroundColor = "#fafafa";
    fabricCanvas.renderAll();
    toast("Canvas cleared!");
  };

  const handleUndo = () => {
    if (!fabricCanvas) return;
    const objects = fabricCanvas.getObjects();
    if (objects.length > 0) {
      fabricCanvas.remove(objects[objects.length - 1]);
      fabricCanvas.renderAll();
    }
  };

  const handleSend = () => {
    if (!fabricCanvas) return;
   
    const objects = fabricCanvas.getObjects();
    if (objects.length === 0) {
      toast("Draw something first!");
      return;
    }

    const canvasData = fabricCanvas.toDataURL({
      format: 'png',
      quality: 0.8,
      multiplier: 1
    });
   
    onSendDoodle(canvasData);
    handleClear();
    toast("Doodle sent! 🎨");
  };

  return (
    <div className="bg-card rounded-xl p-6 shadow-card border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">Draw Your Doodle</h3>
        {currentPlayer && (
          <div className="text-sm text-primary font-medium bg-primary/10 px-3 py-1 rounded-full">
            {currentPlayer}'s Turn
          </div>
        )}
      </div>
     
      <div className="border-2 border-border rounded-lg overflow-hidden mb-6 bg-white">
        <canvas ref={canvasRef} className="block" />
      </div>

      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowColorPicker(!showColorPicker)}
              className="w-12 h-12 p-0 border-2"
              style={{ backgroundColor: activeColor }}
            >
              <Palette className="w-4 h-4 text-white drop-shadow-sm" />
            </Button>
           
            {showColorPicker && (
              <div className="absolute top-14 left-0 bg-popover border rounded-lg p-3 shadow-lg z-10">
                <div className="grid grid-cols-4 gap-2">
                  {COLORS.map((color) => (
                    <button
                      key={color}
                      className="w-8 h-8 rounded-md border-2 border-border hover:scale-110 transition-transform"
                      style={{ backgroundColor: color }}
                      onClick={() => {
                        setActiveColor(color);
                        setShowColorPicker(false);
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          <Button variant="outline" size="sm" onClick={handleUndo}>
            <Undo className="w-4 h-4" />
          </Button>

          <Button variant="outline" size="sm" onClick={handleClear}>
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>

        <Button
          onClick={handleSend}
          className="bg-gradient-main hover:shadow-glow transition-all duration-300"
        >
          <Send className="w-4 h-4 mr-2" />
          Send Doodle
        </Button>
      </div>
    </div>
  );
};