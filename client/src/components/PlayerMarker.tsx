import { Player } from "@shared/schema";

interface PlayerMarkerProps {
  player: Player;
  index: number;
  containerStyle: React.CSSProperties;
}

export default function PlayerMarker({ player, index, containerStyle }: PlayerMarkerProps) {
  const getPlayerColor = (index: number) => {
    const colors = ['neon-green', 'neon-blue', 'neon-yellow', 'neon-red'];
    return colors[index % colors.length];
  };

  // Convert Terraria coordinates to canvas position
  // Map dimensions from WebSocket data
  const mapWidth = 4200; // Map width in blocks  
  const mapHeight = 1200; // Map height in blocks
  
  // Convert player position (in pixels) to block coordinates
  const blockX = player.x / 16; // Convert pixels to blocks (16 pixels per block)
  const blockY = player.y / 16;
  
  // Calculate position relative to canvas with same scaling as map
  const container = containerStyle.transform;
  const scaleMatch = container?.match(/scale\(([^)]+)\)/);
  const panXMatch = container?.match(/translate\(([^,]+)px,/);
  const panYMatch = container?.match(/translate\([^,]+px,\s*([^)]+)px\)/);
  
  const currentScale = scaleMatch ? parseFloat(scaleMatch[1]) : 1;
  const panX = panXMatch ? parseFloat(panXMatch[1]) : 0;
  const panY = panYMatch ? parseFloat(panYMatch[1]) : 0;
  
  // Calculate base scale from canvas size
  const canvasWidth = window.innerWidth;
  const canvasHeight = window.innerHeight;
  const baseScale = Math.min(canvasWidth / mapWidth, canvasHeight / mapHeight) * 0.9;
  const totalScale = baseScale * currentScale;
  
  // Position player marker correctly on the map
  const mapPixelWidth = mapWidth * totalScale;
  const mapPixelHeight = mapHeight * totalScale;
  const centerX = canvasWidth / 2;
  const centerY = canvasHeight / 2;
  const mapOffsetX = centerX - mapPixelWidth / 2 + panX;
  const mapOffsetY = centerY - mapPixelHeight / 2 + panY;
  
  const screenX = mapOffsetX + (blockX * totalScale);
  const screenY = mapOffsetY + (blockY * totalScale);

  return (
    <div 
      className="absolute transform -translate-x-1/2 -translate-y-1/2 z-10"
      style={{
        left: `${screenX}px`,
        top: `${screenY}px`,
      }}
    >
      <div className="relative">
        <div className={`w-4 h-4 bg-${getPlayerColor(index)} rounded-full border-2 border-white shadow-lg animate-pulse`} />
        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gaming-dark/90 px-2 py-1 rounded text-xs font-medium whitespace-nowrap">
          {player.name}
        </div>
      </div>
    </div>
  );
}
