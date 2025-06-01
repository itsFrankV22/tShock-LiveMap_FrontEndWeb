import { useEffect, useState } from "react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import MapCanvas from "@/components/MapCanvas";
import { useWebSocket } from "@/lib/websocket";
import { useMapControls } from "@/hooks/useMapControls";
import { Player, ChatMessage, ConnectionStatus } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";

export default function LiveMap() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [players, setPlayers] = useState<Player[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    connected: false,
    playerCount: 0
  });

  const mapControls = useMapControls();

  // Fetch chat log
  const { data: chatData, refetch: refetchChat } = useQuery({
    queryKey: ['/api/chatlog'],
    refetchInterval: 5000,
  });

  // Fetch player locations
  const { data: playerData, refetch: refetchPlayers } = useQuery({
    queryKey: ['/api/playerlocations'],
    refetchInterval: 2000,
  });

  // WebSocket connection for real-time updates
  const { isConnected, lastMessage } = useWebSocket();

  // Update connection status based on WebSocket
  useEffect(() => {
    setConnectionStatus(prev => ({
      ...prev,
      connected: isConnected,
    }));
  }, [isConnected]);

  // Handle WebSocket messages
  useEffect(() => {
    if (lastMessage) {
      try {
        const data = JSON.parse(lastMessage);
        
        if (data.type === 'player_update') {
          setPlayers(data.players || []);
        } else if (data.type === 'chunk_update') {
          // Handle map chunk updates
          console.log('Received chunk update:', data);
        } else if (data.type === 'connection_status') {
          setConnectionStatus(prev => ({
            ...prev,
            connected: data.connected
          }));
        }
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    }
  }, [lastMessage]);

  // Update players from API data
  useEffect(() => {
    if (playerData && typeof playerData === 'object') {
      try {
        // The API returns { Players: [...] }
        const apiPlayers = (playerData as any).Players || [];
        const parsedPlayers = Array.isArray(apiPlayers) ? apiPlayers.map((p: any) => ({
          name: p.PlayerName || p.Name || p.name || 'Unknown',
          x: p.X || p.x || 0,
          y: p.Y || p.y || 0,
          active: p.Active !== undefined ? p.Active : (p.active !== undefined ? p.active : true)
        })) : [];
        console.log('Parsed players:', parsedPlayers);
        setPlayers(parsedPlayers);
        setConnectionStatus(prev => ({
          ...prev,
          playerCount: parsedPlayers.length
        }));
      } catch (error) {
        console.error('Failed to parse player data:', error);
      }
    }
  }, [playerData]);

  const chatMessages: ChatMessage[] = chatData && (chatData as any).Messages ? 
    (chatData as any).Messages.map((msg: any) => ({
      player: msg.PlayerName,
      message: msg.Message,
      timestamp: msg.Timestamp
    })).slice(-15) : [];

  return (
    <div className="h-screen flex flex-col bg-gaming-dark text-slate-50 font-inter overflow-hidden">
      <Header 
        connectionStatus={connectionStatus}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />
      
      <div className="flex-1 flex relative">
        <main className="flex-1 relative">
          <MapCanvas 
            players={players}
            mapControls={mapControls}
            connectionStatus={connectionStatus}
          />
        
        <Sidebar 
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          players={players}
          chatMessages={chatMessages}
          mapControls={mapControls}
        />
          
          {/* Mobile Controls */}
          <div className="absolute bottom-4 right-4 flex flex-col space-y-2">
            <button 
              className="p-3 glass-effect rounded-lg hover:bg-neon-blue/20 transition-all duration-200 neon-glow"
              onClick={mapControls.zoomIn}
            >
              <i className="fas fa-plus text-neon-blue"></i>
            </button>
            <button 
              className="p-3 glass-effect rounded-lg hover:bg-neon-blue/20 transition-all duration-200 neon-glow"
              onClick={mapControls.zoomOut}
            >
              <i className="fas fa-minus text-neon-blue"></i>
            </button>
            <button 
              className="p-3 glass-effect rounded-lg hover:bg-neon-green/20 transition-all duration-200 neon-glow"
              onClick={mapControls.centerMap}
            >
              <i className="fas fa-crosshairs text-neon-green"></i>
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className="lg:hidden absolute top-4 left-4 p-3 glass-effect rounded-lg hover:bg-neon-green/20 transition-all duration-200 neon-glow z-20"
            onClick={() => setSidebarOpen(true)}
          >
            <i className="fas fa-bars text-neon-green"></i>
          </button>

          {/* Map Info Panel */}
          <div className="absolute top-4 right-4 glass-effect rounded-lg p-3 hidden md:block z-20">
            <div className="text-xs text-slate-400 space-y-1">
              <div>Zoom: <span className="text-neon-blue font-mono">{Math.round(mapControls.zoom * 100)}%</span></div>
              <div>Players: <span className="text-neon-green font-mono">{connectionStatus.playerCount}</span></div>
              <div>Ping: <span className="text-neon-yellow font-mono">{connectionStatus.ping || '--'}ms</span></div>
            </div>
          </div>

          {/* Chat Panel - Mobile and Desktop */}
          <div className="absolute bottom-4 left-4 w-80 max-w-[calc(100vw-2rem)] md:max-w-sm glass-effect rounded-lg z-20">
            <div className="p-3 border-b border-gaming-lighter">
              <h3 className="text-sm font-semibold text-neon-yellow flex items-center">
                <i className="fas fa-comments mr-2"></i>
                Chat en Vivo
              </h3>
            </div>
            <div className="h-48 overflow-y-auto p-3 space-y-2">
              {chatMessages.length > 0 ? chatMessages.map((message, index) => (
                <div key={index} className="chat-message text-xs">
                  <span className="text-neon-blue font-medium">{message.player}:</span>
                  <span className="text-slate-300 ml-1">{message.message}</span>
                </div>
              )) : (
                <div className="text-xs text-slate-400 text-center py-4">
                  No hay mensajes de chat
                </div>
              )}
            </div>
          </div>


        </main>
      </div>
    </div>
  );
}
