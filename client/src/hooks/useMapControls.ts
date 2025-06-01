import { useState, useCallback } from 'react';

export interface UseMapControlsReturn {
  zoom: number;
  pan: { x: number; y: number };
  showPlayers: boolean;
  showGrid: boolean;
  zoomIn: () => void;
  zoomOut: () => void;
  setPan: React.Dispatch<React.SetStateAction<{ x: number; y: number }>>;
  setShowPlayers: (show: boolean) => void;
  setShowGrid: (show: boolean) => void;
  centerMap: () => void;
}

export function useMapControls(): UseMapControlsReturn {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [showPlayers, setShowPlayers] = useState(true);
  const [showGrid, setShowGrid] = useState(true);

  const zoomIn = useCallback(() => {
    setZoom(prev => Math.min(prev * 1.2, 5));
  }, []);

  const zoomOut = useCallback(() => {
    setZoom(prev => Math.max(prev / 1.2, 0.1));
  }, []);

  const centerMap = useCallback(() => {
    setPan({ x: 0, y: 0 });
    setZoom(1);
  }, []);

  return {
    zoom,
    pan,
    showPlayers,
    showGrid,
    zoomIn,
    zoomOut,
    setPan,
    setShowPlayers,
    setShowGrid,
    centerMap,
  };
}
