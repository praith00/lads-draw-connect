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
  "#8B5CF6", "#A855F7", "#9333EA", "#7C3AED", "#6366F1", "#3B82F6",
  "#EF4444", "#F97316", "#F59E0B", "#EAB308", "#84CC16", "#22C55E",
  "#10B981", "#14B8A6", "#06B6D4", "#0EA5E9", "#8B5CF6", "#A855F7",
  "#EC4899", "#F43F5E", "#000000", "#374151", "#6B7280", "#FFFFFF"
];

const BRUSH_SIZES = [2, 4, 8, 16, 24, 32];

const BRUSH_TYPES = [
  { name: "Pencil", type: "pencil" },
  { name: "Brush", type: "brush" },
  { name: "Marker", type: "marker" },
];

export const DrawingCanvas = ({ onSendDoodle, currentPlayer }: DrawingCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<FabricCanvas | null>(null);
  const [activeColor, setActiveColor] = useState("#8B5CF6");
  const [brushSize, setBrushSize] = useState(4);
  const [brushType, setBrushType] = useState("pencil");
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showBrushOptions, setShowBrushOptions] = useState(false);
  const [currentTool, setCurrentTool] = useState<"draw" | "erase">("draw");

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
   
    console.log("Updating brush properties:", { activeColor, brushSize, brushType, currentTool });
    
    if (currentTool === "erase") {
      fabricCanvas.freeDrawingBrush.color = "#FFFFFF";
    } else {
      fabricCanvas.freeDrawingBrush.color = activeColor;
    }
    
    fabricCanvas.freeDrawingBrush.width = brushSize;
    fabricCanvas.renderAll();
  }, [activeColor, brushSize, brushType, currentTool, fabricCanvas]);

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

  const addShape = (shapeType: "rectangle" | "circle") => {
    if (!fabricCanvas) return;
    
    const { Rect, Circle } = require("fabric");
    
    if (shapeType === "rectangle") {
      const rect = new Rect({
        left: 100,
        top: 100,
        fill: activeColor,
        width: 100,
        height: 80,
        stroke: activeColor,
        strokeWidth: 2,
      });
      fabricCanvas.add(rect);
    } else if (shapeType === "circle") {
      const circle = new Circle({
        left: 100,
        top: 100,
        fill: "transparent",
        radius: 50,
        stroke: activeColor,
        strokeWidth: brushSize,
      });
      fabricCanvas.add(circle);
    }
    fabricCanvas.renderAll();
  };

  return (
    <div className="bg-gradient-card rounded-xl p-6 shadow-floating border border-glass backdrop-blur-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">Draw Your Doodle</h3>
        {currentPlayer && (
          <div className="text-sm text-primary font-medium bg-gradient-main text-white px-4 py-2 rounded-full shadow-glow animate-pulse-glow">
            {currentPlayer}'s Turn
          </div>
        )}
      </div>
     
      <div className="border-2 border-glass rounded-lg overflow-hidden mb-6 bg-white shadow-glass">
        <canvas ref={canvasRef} className="block" />
      </div>

      {/* Enhanced Toolbar */}
      <div className="space-y-4">
        {/* Tool Selection */}
        <div className="flex items-center gap-2 p-2 bg-glass rounded-lg border border-glass">
          <Button
            variant={currentTool === "draw" ? "default" : "outline"}
            size="sm"
            onClick={() => setCurrentTool("draw")}
            className={currentTool === "draw" ? "bg-gradient-main" : ""}
          >
            Draw
          </Button>
          <Button
            variant={currentTool === "erase" ? "default" : "outline"}
            size="sm"
            onClick={() => setCurrentTool("erase")}
            className={currentTool === "erase" ? "bg-gradient-main" : ""}
          >
            Erase
          </Button>
          <div className="w-px h-6 bg-border mx-2" />
          <Button
            variant="outline"
            size="sm"
            onClick={() => addShape("rectangle")}
            className="hover:bg-accent transition-colors"
          >
            □
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => addShape("circle")}
            className="hover:bg-accent transition-colors"
          >
            ○
          </Button>
        </div>

        {/* Main Controls */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {/* Color Picker */}
            <div className="relative">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowColorPicker(!showColorPicker)}
                className="w-12 h-12 p-0 border-2 transition-spring hover:scale-110"
                style={{ backgroundColor: activeColor }}
              >
                <Palette className="w-4 h-4 text-white drop-shadow-sm" />
              </Button>
             
              {showColorPicker && (
                <div className="absolute top-14 left-0 bg-glass border border-glass rounded-lg p-4 shadow-floating z-20 backdrop-blur-md animate-scale-in">
                  <div className="grid grid-cols-6 gap-2 mb-3">
                    {COLORS.map((color) => (
                      <button
                        key={color}
                        className="w-8 h-8 rounded-full border-2 border-border hover:scale-110 transition-spring shadow-md"
                        style={{ backgroundColor: color }}
                        onClick={() => {
                          setActiveColor(color);
                          setShowColorPicker(false);
                        }}
                      />
                    ))}
                  </div>
                  <div className="text-xs text-muted-foreground text-center">
                    Click to select color
                  </div>
                </div>
              )}
            </div>

            {/* Brush Options */}
            <div className="relative">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowBrushOptions(!showBrushOptions)}
                className="px-3 hover:bg-accent transition-colors"
              >
                {brushSize}px
              </Button>
             
              {showBrushOptions && (
                <div className="absolute top-14 left-0 bg-glass border border-glass rounded-lg p-4 shadow-floating z-20 backdrop-blur-md animate-scale-in">
                  <div className="space-y-3">
                    <div>
                      <div className="text-xs text-muted-foreground mb-2">Brush Size</div>
                      <div className="flex gap-2">
                        {BRUSH_SIZES.map((size) => (
                          <button
                            key={size}
                            className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs transition-spring hover:scale-110 ${
                              brushSize === size 
                                ? "border-primary bg-primary text-white" 
                                : "border-border hover:border-primary"
                            }`}
                            onClick={() => {
                              setBrushSize(size);
                              setShowBrushOptions(false);
                            }}
                          >
                            {size}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-xs text-muted-foreground mb-2">Brush Type</div>
                      <div className="flex gap-2">
                        {BRUSH_TYPES.map((brush) => (
                          <button
                            key={brush.type}
                            className={`px-3 py-1 rounded-md text-xs transition-colors ${
                              brushType === brush.type
                                ? "bg-primary text-white"
                                : "bg-secondary hover:bg-accent"
                            }`}
                            onClick={() => {
                              setBrushType(brush.type);
                              setShowBrushOptions(false);
                            }}
                          >
                            {brush.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <Button variant="outline" size="sm" onClick={handleUndo} className="hover:bg-accent transition-colors">
              <Undo className="w-4 h-4" />
            </Button>

            <Button variant="outline" size="sm" onClick={handleClear} className="hover:bg-destructive/10 hover:text-destructive transition-colors">
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>

          <Button
            onClick={handleSend}
            className="bg-gradient-main hover:shadow-glow transition-spring hover:scale-105 px-6"
          >
            <Send className="w-4 h-4 mr-2" />
            Send Doodle
          </Button>
        </div>
      </div>
    </div>
  );
};