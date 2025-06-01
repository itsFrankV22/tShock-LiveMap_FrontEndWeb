import { Player, ChatMessage } from "@shared/schema";
import { UseMapControlsReturn } from "@/hooks/useMapControls";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  players: Player[];
  chatMessages: ChatMessage[];
  mapControls: UseMapControlsReturn;
}

export default function Sidebar({ isOpen, onClose, players, chatMessages, mapControls }: SidebarProps) {
  const formatTimestamp = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      
      if (diffMins < 1) return 'just now';
      if (diffMins < 60) return `${diffMins} minutes ago`;
      
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours} hours ago`;
      
      return date.toLocaleDateString();
    } catch {
      return 'recently';
    }
  };

  const getPlayerColor = (index: number) => {
    const colors = ['neon-green', 'neon-blue', 'neon-yellow', 'neon-red'];
    return colors[index % colors.length];
  };

  const sidebarContent = (
    <>
      {/* Map Controls */}
      <div className="p-4 border-b border-gaming-lighter">
        <div className="flex items-center justify-between mb-4 lg:mb-3">
          <h3 className="text-lg font-semibold text-neon-green">Map Controls</h3>
          <button 
            className="lg:hidden p-2 hover:bg-gaming-lighter rounded-lg"
            onClick={onClose}
          >
            <i className="fas fa-times text-slate-400"></i>
          </button>
        </div>
        
        {/* Zoom Controls */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-slate-400">Zoom Level</span>
          <div className="flex items-center space-x-2">
            <button 
              className="p-2 bg-gaming-slate hover:bg-neon-blue/20 rounded-lg transition-all duration-200 hover:scale-110"
              onClick={mapControls.zoomOut}
            >
              <i className="fas fa-minus text-neon-blue"></i>
            </button>
            <span className="text-sm font-mono bg-gaming-slate px-3 py-1 rounded">
              {Math.round(mapControls.zoom * 100)}%
            </span>
            <button 
              className="p-2 bg-gaming-slate hover:bg-neon-blue/20 rounded-lg transition-all duration-200 hover:scale-110"
              onClick={mapControls.zoomIn}
            >
              <i className="fas fa-plus text-neon-blue"></i>
            </button>
          </div>
        </div>
        
        {/* Map Options */}
        <div className="space-y-3">
          <label className="flex items-center space-x-3 cursor-pointer">
            <input 
              type="checkbox" 
              checked={mapControls.showPlayers} 
              onChange={(e) => mapControls.setShowPlayers(e.target.checked)}
              className="sr-only" 
            />
            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
              mapControls.showPlayers 
                ? 'bg-neon-green border-neon-green' 
                : 'bg-transparent border-slate-400'
            }`}>
              {mapControls.showPlayers && (
                <i className="fas fa-check text-gaming-dark text-xs"></i>
              )}
            </div>
            <span className="text-sm">Show Players</span>
          </label>
          
          <label className="flex items-center space-x-3 cursor-pointer">
            <input 
              type="checkbox" 
              checked={mapControls.showGrid} 
              onChange={(e) => mapControls.setShowGrid(e.target.checked)}
              className="sr-only" 
            />
            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
              mapControls.showGrid 
                ? 'bg-neon-green border-neon-green' 
                : 'bg-transparent border-slate-400'
            }`}>
              {mapControls.showGrid && (
                <i className="fas fa-check text-gaming-dark text-xs"></i>
              )}
            </div>
            <span className="text-sm">Show Grid</span>
          </label>
        </div>
      </div>
      
      {/* Player List */}
      <div className="p-4 border-b border-gaming-lighter">
        <h3 className="text-lg font-semibold mb-3 text-neon-blue">Online Players</h3>
        <div className="space-y-2">
          {players.length > 0 ? players.map((player, index) => (
            <div key={`${player.name}-${index}`} className="flex items-center space-x-3 p-2 bg-gaming-slate/50 rounded-lg">
              <div className={`w-3 h-3 bg-${getPlayerColor(index)} rounded-full`} />
              <span className="text-sm font-medium">{player.name}</span>
              <span className="text-xs text-slate-400 ml-auto">
                X: {Math.round(player.x)}, Y: {Math.round(player.y)}
              </span>
            </div>
          )) : (
            <div className="text-sm text-slate-400 text-center py-4">
              No players online
            </div>
          )}
        </div>
      </div>
      
      {/* Player Actions */}
      <div className="flex-1 p-4 flex flex-col min-h-0">
        <h3 className="text-lg font-semibold mb-3 text-neon-purple">Acciones</h3>
        <div className="space-y-3">
          <button 
            className="w-full p-3 bg-neon-green/20 hover:bg-neon-green/30 rounded-lg border border-neon-green/50 transition-all duration-200"
            onClick={mapControls.centerMap}
          >
            <i className="fas fa-home mr-2 text-neon-green"></i>
            <span className="text-neon-green font-medium">Centrar Mapa</span>
          </button>
          
          <div className="bg-gaming-slate/50 p-3 rounded-lg">
            <h4 className="text-sm font-medium text-slate-300 mb-2">Estadísticas</h4>
            <div className="space-y-1 text-xs text-slate-400">
              <div>Chunks cargados: <span className="text-neon-blue">--</span></div>
              <div>Última actualización: <span className="text-neon-green">Ahora</span></div>
            </div>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="w-80 glass-effect border-r border-gaming-lighter flex-col hidden lg:flex">
        {sidebarContent}
      </aside>

      {/* Mobile Sidebar Overlay */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          onClick={onClose}
        >
          <div 
            className="w-80 h-full glass-effect ml-auto flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
