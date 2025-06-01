import { useEffect, useRef, useState, useCallback } from "react";
import { Player, ConnectionStatus } from "@shared/schema";
import { UseMapControlsReturn } from "@/hooks/useMapControls";
import PlayerMarker from "./PlayerMarker";

interface MapChunk {
  chunkX: number;
  chunkY: number;
  width: number;
  height: number;
  colors: string[];
  mapWidth: number;
  mapHeight: number;
}

interface MapCanvasProps {
  players: Player[];
  mapControls: UseMapControlsReturn;
  connectionStatus: ConnectionStatus;
}

export default function MapCanvas({ players, mapControls, connectionStatus }: MapCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [lastPosition, setLastPosition] = useState({ x: 0, y: 0 });
  const [mapChunks, setMapChunks] = useState<Map<string, MapChunk>>(new Map());
  const [mapDimensions, setMapDimensions] = useState({ width: 4200, height: 1200 });

  // Handle mouse/touch events for panning
  const handleStart = (clientX: number, clientY: number) => {
    setIsDragging(true);
    setLastPosition({ x: clientX, y: clientY });
  };

  const handleMove = (clientX: number, clientY: number) => {
    if (!isDragging) return;

    const deltaX = clientX - lastPosition.x;
    const deltaY = clientY - lastPosition.y;

    mapControls.setPan(prev => ({
      x: prev.x + deltaX,
      y: prev.y + deltaY
    }));

    setLastPosition({ x: clientX, y: clientY });
  };

  const handleEnd = () => {
    setIsDragging(false);
  };

  // Mouse events
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    handleStart(e.clientX, e.clientY);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    handleMove(e.clientX, e.clientY);
  };

  const handleMouseUp = () => {
    handleEnd();
  };

  // Touch events
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      handleStart(touch.clientX, touch.clientY);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      handleMove(touch.clientX, touch.clientY);
    }
  };

  const handleTouchEnd = () => {
    handleEnd();
  };

  // Zoom with mouse wheel
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      mapControls.zoomIn();
    } else {
      mapControls.zoomOut();
    }
  };

  // Handle WebSocket messages for map chunks
  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log('MapCanvas WebSocket connected - waiting for initial map data');
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === 'chunk_update') {
          console.log(`Received chunk at (${data.chunkX}, ${data.chunkY}) - Map: ${data.mapWidth}x${data.mapHeight}`);
          
          const chunk: MapChunk = {
            chunkX: data.chunkX,
            chunkY: data.chunkY,
            width: data.width,
            height: data.height,
            colors: data.colors,
            mapWidth: data.mapWidth,
            mapHeight: data.mapHeight
          };
          
          setMapChunks(prev => {
            const newChunks = new Map(prev);
            newChunks.set(`${chunk.chunkX}-${chunk.chunkY}`, chunk);
            return newChunks;
          });
          
          if (data.mapWidth && data.mapHeight) {
            setMapDimensions({ width: data.mapWidth, height: data.mapHeight });
          }
        } else if (data.type === 'connection_status') {
          console.log('Connection status update:', data);
        } else {
          console.log('Unknown WebSocket message type:', data.type);
        }
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
        console.log('Raw message:', event.data);
      }
    };

    ws.onerror = (error) => {
      console.error('MapCanvas WebSocket error:', error);
    };

    return () => {
      ws.close();
    };
  }, []);

  // Render map chunks to canvas
  const renderMapChunks = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size without device pixel ratio scaling to avoid blur
    const container = canvas.parentElement;
    if (container) {
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
      canvas.style.width = container.clientWidth + 'px';
      canvas.style.height = container.clientHeight + 'px';
    }

    // Clear canvas
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (mapChunks.size === 0) return;

    // Disable smoothing for crisp pixels
    ctx.imageSmoothingEnabled = false;

    // Calculate scale to fit the entire map with zoom control
    const baseScale = Math.min(
      canvas.width / mapDimensions.width,
      canvas.height / mapDimensions.height
    ) * 0.9; // 90% to leave margin

    const currentScale = baseScale * mapControls.zoom;
    
    // Apply pan offset
    const mapWidth = mapDimensions.width * currentScale;
    const mapHeight = mapDimensions.height * currentScale;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const offsetX = centerX - mapWidth / 2 + mapControls.pan.x;
    const offsetY = centerY - mapHeight / 2 + mapControls.pan.y;

    // Render each chunk with simple pixel drawing
    mapChunks.forEach((chunk) => {
      const chunkStartX = offsetX + (chunk.chunkX * chunk.width * currentScale);
      const chunkStartY = offsetY + (chunk.chunkY * chunk.height * currentScale);
      
      for (let i = 0; i < chunk.colors.length; i++) {
        const localX = i % chunk.width;
        const localY = Math.floor(i / chunk.width);
        
        const pixelX = chunkStartX + (localX * currentScale);
        const pixelY = chunkStartY + (localY * currentScale);
        
        // Only draw if pixel is visible on canvas
        if (pixelX >= -currentScale && pixelY >= -currentScale && 
            pixelX < canvas.width && pixelY < canvas.height) {
          ctx.fillStyle = chunk.colors[i];
          ctx.fillRect(pixelX, pixelY, Math.max(currentScale, 1), Math.max(currentScale, 1));
        }
      }
    });
  }, [mapChunks, mapDimensions, mapControls.zoom, mapControls.pan]);

  // Update canvas when chunks change
  useEffect(() => {
    renderMapChunks();
  }, [renderMapChunks]);

  // Global mouse events
  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        handleMove(e.clientX, e.clientY);
      }
    };

    const handleGlobalMouseUp = () => {
      if (isDragging) {
        handleEnd();
      }
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [isDragging, lastPosition]);

  const containerStyle = {
    transform: `translate(${mapControls.pan.x}px, ${mapControls.pan.y}px) scale(${mapControls.zoom})`,
    cursor: isDragging ? 'grabbing' : 'grab',
  };

  return (
    <div 
      ref={containerRef}
      className="w-full h-full map-container relative overflow-hidden"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onWheel={handleWheel}
    >
      {/* Terraria Map Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full object-contain"
        style={{
          imageRendering: 'pixelated',
          ...containerStyle
        }}
      />
      
      {/* Map Loading Indicator */}
      {mapChunks.size === 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-gaming-dark/80">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neon-green mx-auto mb-4"></div>
            <p className="text-neon-green">Cargando mapa de Terraria...</p>
            <p className="text-slate-400 text-sm mt-2">
              Chunks cargados: {mapChunks.size}
            </p>
            <p className="text-slate-400 text-xs mt-1">
              WebSocket: {connectionStatus.connected ? 'Conectado' : 'Desconectado'}
            </p>
          </div>
        </div>
      )}
      


      {/* Grid Overlay */}
      {mapControls.showGrid && (
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
              repeating-linear-gradient(0deg, transparent, transparent 19px, rgba(16, 185, 129, 0.3) 20px),
              repeating-linear-gradient(90deg, transparent, transparent 19px, rgba(16, 185, 129, 0.3) 20px)
            `,
            ...containerStyle
          }}
        />
      )}

      {/* Player Markers */}
      {mapControls.showPlayers && players.map((player, index) => (
        <PlayerMarker
          key={`${player.name}-${index}`}
          player={player}
          index={index}
          containerStyle={containerStyle}
        />
      ))}
    </div>
  );
}
