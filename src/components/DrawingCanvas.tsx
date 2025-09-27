import { useEffect, useRef, useState } from "react";
import { Canvas as FabricCanvas, PencilBrush } from "fabric";
import { Button } from "@/components/ui/button";
import { Palette, Undo, Trash2, Send, Square, Circle, Triangle, Minus, ArrowUp } from "lucide-react";
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

const SHAPE_TOOLS = [
  { name: "Rectangle", type: "rectangle", icon: Square },
  { name: "Circle", type: "circle", icon: Circle },
  { name: "Triangle", type: "triangle", icon: Triangle },
  { name: "Line", type: "line", icon: Minus },
  { name: "Arrow", type: "arrow", icon: ArrowUp },
];

export const DrawingCanvas = ({ onSendDoodle, currentPlayer }: DrawingCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<FabricCanvas | null>(null);
  const [activeColor, setActiveColor] = useState("#8B5CF6");
  const [brushSize, setBrushSize] = useState(4);
  const [brushType, setBrushType] = useState("pencil");
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showBrushOptions, setShowBrushOptions] = useState(false);
  const [currentTool, setCurrentTool] = useState<"draw" | "erase" | "shape">("draw");
  const [selectedShape, setSelectedShape] = useState<"rectangle" | "circle" | "triangle" | "line" | "arrow">("rectangle");
  const [isDrawingShape, setIsDrawingShape] = useState(false);
  const [shapeStartPoint, setShapeStartPoint] = useState<{ x: number; y: number } | null>(null);

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

    // Add shape drawing event listeners
    let tempShape: any = null;

    canvas.on('mouse:down', (e) => {
      if (currentTool === 'shape') {
        const pointer = canvas.getPointer(e.e);
        setShapeStartPoint({ x: pointer.x, y: pointer.y });
        setIsDrawingShape(true);
      }
    });

    canvas.on('mouse:move', (e) => {
      if (currentTool === 'shape' && isDrawingShape && shapeStartPoint) {
        const pointer = canvas.getPointer(e.e);
        
        if (tempShape) {
          canvas.remove(tempShape);
        }
        
        tempShape = createShape(selectedShape, shapeStartPoint, pointer, activeColor, brushSize);
        if (tempShape) {
          tempShape.selectable = false;
          canvas.add(tempShape);
          canvas.renderAll();
        }
      }
    });

    canvas.on('mouse:up', () => {
      if (currentTool === 'shape' && isDrawingShape) {
        setIsDrawingShape(false);
        setShapeStartPoint(null);
        if (tempShape) {
          tempShape.selectable = true;
        }
        tempShape = null;
      }
    });

    setFabricCanvas(canvas);

    return () => {
      console.log("Disposing canvas");
      canvas.dispose();
    };
  }, []);

  useEffect(() => {
    if (!fabricCanvas) return;
   
    console.log("Updating brush properties:", { activeColor, brushSize, brushType, currentTool });
    
    // Set drawing mode based on current tool
    fabricCanvas.isDrawingMode = currentTool === "draw" || currentTool === "erase";
    
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

  const createShape = (
    shapeType: string, 
    startPoint: { x: number; y: number }, 
    endPoint: { x: number; y: number },
    color: string,
    strokeWidth: number
  ) => {
    const { Rect, Circle, Polygon, Line } = require("fabric");
    
    const width = Math.abs(endPoint.x - startPoint.x);
    const height = Math.abs(endPoint.y - startPoint.y);
    const left = Math.min(startPoint.x, endPoint.x);
    const top = Math.min(startPoint.y, endPoint.y);
    
    switch (shapeType) {
      case "rectangle":
        return new Rect({
          left,
          top,
          width,
          height,
          fill: "transparent",
          stroke: color,
          strokeWidth,
        });
      
      case "circle":
        const radius = Math.min(width, height) / 2;
        return new Circle({
          left: left + width / 2 - radius,
          top: top + height / 2 - radius,
          radius,
          fill: "transparent",
          stroke: color,
          strokeWidth,
        });
      
      case "triangle":
        const centerX = left + width / 2;
        const points = [
          { x: centerX, y: top },
          { x: left, y: top + height },
          { x: left + width, y: top + height }
        ];
        return new Polygon(points, {
          fill: "transparent",
          stroke: color,
          strokeWidth,
        });
      
      case "line":
        return new Line([startPoint.x, startPoint.y, endPoint.x, endPoint.y], {
          stroke: color,
          strokeWidth,
        });
      
      case "arrow":
        const arrowLine = new Line([startPoint.x, startPoint.y, endPoint.x, endPoint.y], {
          stroke: color,
          strokeWidth,
        });
        
        // Calculate arrow head
        const angle = Math.atan2(endPoint.y - startPoint.y, endPoint.x - startPoint.x);
        const headLength = 20;
        const headAngle = Math.PI / 6;
        
        const arrowHead1 = new Line([
          endPoint.x,
          endPoint.y,
          endPoint.x - headLength * Math.cos(angle - headAngle),
          endPoint.y - headLength * Math.sin(angle - headAngle)
        ], {
          stroke: color,
          strokeWidth,
        });
        
        const arrowHead2 = new Line([
          endPoint.x,
          endPoint.y,
          endPoint.x - headLength * Math.cos(angle + headAngle),
          endPoint.y - headLength * Math.sin(angle + headAngle)
        ], {
          stroke: color,
          strokeWidth,
        });
        
        // Group the arrow parts
        const { Group } = require("fabric");
        return new Group([arrowLine, arrowHead1, arrowHead2]);
      
      default:
        return null;
    }
  };

  const addShape = (shapeType: "rectangle" | "circle" | "triangle" | "line" | "arrow") => {
    setSelectedShape(shapeType);
    setCurrentTool("shape");
    toast(`${shapeType.charAt(0).toUpperCase() + shapeType.slice(1)} tool selected! Click and drag to draw.`);
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
          
          {/* Shape Tools */}
          {SHAPE_TOOLS.map((shape) => {
            const IconComponent = shape.icon;
            return (
              <Button
                key={shape.type}
                variant={currentTool === "shape" && selectedShape === shape.type ? "default" : "outline"}
                size="sm"
                onClick={() => addShape(shape.type as any)}
                className={`hover:bg-accent transition-colors ${
                  currentTool === "shape" && selectedShape === shape.type ? "bg-gradient-main" : ""
                }`}
                title={shape.name}
              >
                <IconComponent className="w-4 h-4" />
              </Button>
            );
          })}
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