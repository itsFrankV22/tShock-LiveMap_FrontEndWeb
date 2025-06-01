# LiveMap FrontEnd (by AI Copilot)

This project is a **complete example of a modern frontend** for visualizing the live map and player activity from a Terraria server using the [LiveMap for tShock](https://github.com/itsFrankV22/tShock-LiveMap) plugin. All code, structure, and documentation were generated and reviewed by an AI agent (GitHub Copilot) to serve as an educational reference for implementing a frontend that integrates with the LiveMap tShock backend.

---

## What is this?

- A **web application** in TypeScript/React that connects to your Terraria server's API and WebSocket (via tShock's LiveMap plugin).
- Displays the live map and player locations, live chat, and interactive controls.
- Example of professional frontend architecture: component separation, state management, and real-time communication.

---

## General Architecture

### 1. Communication with the LiveMap Backend

- Connects to the `/ws` WebSocket endpoint for real-time map and player updates.
- Uses REST API endpoints `/api/playerlocations` and `/api/chatlog` for periodic data (fallback/refresh).
- Does NOT store or expose real addresses/tokens, only examples:
  ```ts
  // Example WebSocket connection
  const ws = new WebSocket("wss://<YOUR_ADDRESS>/ws");
  // Example REST API fetch
  fetch("https://<YOUR_ADDRESS>/api/playerlocations")
  ```

### 2. Main Components

- `LiveMap`: The main page, handles global state and orchestrates the UI.
- `MapCanvas`: Renders the map and players, draws chunks received via WebSocket.
- `Sidebar`: Player list and chat.
- `Header`: Connection status and controls.
- Custom hooks, example: `useMapControls` for zoom/pan.

---

## Project Structure

```
client/
  src/
    components/
      MapCanvas.tsx      // Dynamic map & player rendering
      PlayerMarker.tsx   // Individual player markers
      Sidebar.tsx        // Chat & player list
      Header.tsx
    pages/
      livemap.tsx        // Main page
    hooks/
      useMapControls.ts  // Zoom/pan/grid logic
    lib/
      websocket.ts       // Hook for WebSocket connection
    assets/
      ... fonts, images ...
    main.tsx
  index.html
server/
  routes.ts              // REST API and WebSocket proxy to Terraria backend
```

---

## Example: Connection & Data Handling

### WebSocket Connection (no real address exposed)

```tsx
const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
const wsUrl = `${protocol}//${window.location.host}/ws`;
const ws = new WebSocket(wsUrl);

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  if (data.type === "chunk_update") {
    // Update map chunk
  } else if (data.type === "player_update") {
    // Update player positions
  }
  // ...
};
```

### Example REST API Query

```ts
const response = await fetch("/api/playerlocations");
const data = await response.json();
console.log(data.Players); // Array with player data
```

---

## Example: Map Rendering

```tsx
<MapCanvas 
  players={players}
  mapControls={mapControls}
  connectionStatus={connectionStatus}
/>
```

- The canvas updates in real time with map "chunks" from the backend.
- Players are rendered as markers on the map.

---

## Security

- **NEVER** put your real address or tokens in the frontend.
- For examples, use environment variables or placeholders (`<YOUR_ADDRESS>`).
- This project is intended as a safe reference example and does not contain any sensitive data.

---

## Customization

- You can modify styles using CSS or Tailwind.
- Endpoints and logic are easily adaptable to any backend compatible with the LiveMap tShock protocol.

---

## Credits

Developed with help from **GitHub Copilot** (AI) as a didactic example for the Terraria/tShock community.

---

## License

MIT — Use it as a base for your own projects.

---
