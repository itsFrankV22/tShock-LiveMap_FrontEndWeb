import { ConnectionStatus } from "@shared/schema";

interface HeaderProps {
  connectionStatus: ConnectionStatus;
  onToggleSidebar: () => void;
}

export default function Header({ connectionStatus, onToggleSidebar }: HeaderProps) {
  const openFrankV22Profile = () => {
    window.open('https://youtube.com/@FrankV22', '_blank');
  };

  const openDiscord = () => {
    window.open('https://discord.gg/frankv22', '_blank');
  };

  return (
    <header className="glass-effect border-b border-gaming-lighter p-4 z-50 relative">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <i className="fas fa-map-marked-alt text-neon-green text-2xl"></i>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-neon-green to-neon-blue bg-clip-text text-transparent">
              LiveMap byFrankV22
            </h1>
          </div>
          
          {/* Server Info */}
          <div className="hidden md:flex items-center space-x-2 bg-gaming-slate/50 px-3 py-1 rounded-lg border border-neon-yellow/30">
            <i className="fas fa-server text-neon-yellow text-sm"></i>
            <span className="text-neon-yellow font-semibold text-sm">
              terralatamworld.mcst.pro - 7777
            </span>
          </div>
        </div>
        
        {/* Connection Status & Social Links */}
        <div className="flex items-center space-x-4">
          {/* Connection Status */}
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${
              connectionStatus.connected 
                ? 'bg-neon-green animate-pulse' 
                : 'bg-neon-red'
            }`} />
            <span className="text-sm text-slate-400">
              {connectionStatus.connected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
          
          {/* Social Links */}
          <div className="flex items-center space-x-2">
            <button 
              className="p-2 bg-gaming-slate hover:bg-gaming-lighter rounded-lg transition-colors duration-200 neon-glow hover:shadow-neon-red"
              onClick={openFrankV22Profile}
            >
              <i className="fab fa-youtube text-neon-red"></i>
            </button>
            <button 
              className="p-2 bg-gaming-slate hover:bg-gaming-lighter rounded-lg transition-colors duration-200 neon-glow hover:shadow-neon-blue"
              onClick={openDiscord}
            >
              <i className="fab fa-discord text-neon-blue"></i>
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile Server Info */}
      <div className="md:hidden mt-2 flex items-center justify-center">
        <div className="flex items-center space-x-2 bg-gaming-slate/50 px-3 py-1 rounded-lg border border-neon-yellow/30">
          <i className="fas fa-server text-neon-yellow text-sm"></i>
          <span className="text-neon-yellow font-semibold text-sm">
            terralatamworld.mcst.pro - 7777
          </span>
        </div>
      </div>
    </header>
  );
}
