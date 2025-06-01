import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import rateLimit from "express-rate-limit";

const BASE_URL = process.env.TERRARIA_BASE_URL || 'http://IP:PORT';
const TOKEN = process.env.TERRARIA_TOKEN || 'yourtoken';
// const WS_REAL_URL = process.env.TERRARIA_WS_URL || 'ws://localhost:8585/map/ws/';
const WS_REAL_URL = process.env.TERRARIA_WS_URL || 'ws://IP:PORT/map/ws/';

// Rate limiting for API endpoints
const apiLimiter = rateLimit({
  windowMs: 1000, // 1 second
  max: 10, // limit each IP to 10 requests per windowMs
  message: { error: 'Too many requests' }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Apply rate limiting to all API routes
  app.use('/api', apiLimiter);

  // Proxy for chat log API
  app.get('/api/chatlog', async (req, res) => {
    try {
      const response = await fetch(`${BASE_URL}/chatlog?count=15&token=${TOKEN}`);
      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`);
      }
      const data = await response.text();
      res.setHeader('Content-Type', 'application/json');
      res.send(data);
    } catch (error) {
      console.error('Error fetching chat log:', error);
      res.status(500).json({ error: 'Failed to fetch chat log' });
    }
  });

  // Proxy for player locations API
  app.get('/api/playerlocations', async (req, res) => {
    try {
      const response = await fetch(`${BASE_URL}/playerlocations?token=${TOKEN}`);
      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`);
      }
      const data = await response.text();
      res.setHeader('Content-Type', 'application/json');
      res.send(data);
    } catch (error) {
      console.error('Error fetching player locations:', error);
      res.status(500).json({ error: 'Failed to fetch player locations' });
    }
  });

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  const httpServer = createServer(app);

  // WebSocket server for real-time map updates
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  let terrariaWs: WebSocket | null = null;
  const clients = new Set<WebSocket>();

  // Connect to Terraria WebSocket server
  function connectToTerrariaWs() {
    try {
      terrariaWs = new WebSocket(WS_REAL_URL);

      terrariaWs.on('open', () => {
        console.log('Connected to Terraria WebSocket server');
      });

      terrariaWs.on('message', (data) => {
        // Forward messages to all connected clients
        const message = data.toString();
        console.log('Forwarding Terraria message to', clients.size, 'clients');
        
        clients.forEach(client => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(message);
          }
        });
      });

      terrariaWs.on('close', () => {
        console.log('Disconnected from Terraria WebSocket server, attempting to reconnect...');
        setTimeout(connectToTerrariaWs, 5000); // Reconnect after 5 seconds
      });

      terrariaWs.on('error', (error) => {
        console.error('Terraria WebSocket error:', error);
      });
    } catch (error) {
      console.error('Failed to connect to Terraria WebSocket:', error);
      setTimeout(connectToTerrariaWs, 5000);
    }
  }

  // Handle client WebSocket connections
  wss.on('connection', (ws) => {
    console.log('Client connected to WebSocket');
    clients.add(ws);

    // Send initial connection status
    ws.send(JSON.stringify({
      type: 'connection_status',
      connected: terrariaWs?.readyState === WebSocket.OPEN,
      timestamp: new Date().toISOString()
    }));

    ws.on('close', () => {
      console.log('Client disconnected from WebSocket');
      clients.delete(ws);
    });

    ws.on('error', (error) => {
      console.error('Client WebSocket error:', error);
      clients.delete(ws);
    });
  });

  // Initialize Terraria WebSocket connection
  connectToTerrariaWs();

  return httpServer;
}
