import { useEffect, useState, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { LiveBroadcastState, CelebrationAlert } from '@/lib/types';

export function useSocket() {
  const [state, setState] = useState<LiveBroadcastState | null>(null);
  const [connected, setConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // 1. Initial State Fetch via HTTP fallback for instant load
    fetch('/api/live-data')
      .then((res) => res.json())
      .then((resData) => {
        const payload = resData.data ? resData.data : resData;
        if (payload && payload.teamA) {
          setState(payload);
        }
      })
      .catch((err) => console.error('Initial state fetch error:', err));

    // 2. Connect to Socket.io with auto-reconnect
    const socket = io({
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 20,
      reconnectionDelay: 1000,
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      setConnected(true);
      console.log('[Socket.io Client] Connected to broadcast server');
    });

    socket.on('disconnect', () => {
      setConnected(false);
      console.log('[Socket.io Client] Disconnected from broadcast server');
    });

    socket.on('broadcast:state_update', (data: LiveBroadcastState) => {
      setState(data);
    });

    socket.on('broadcast:alert', (alert: CelebrationAlert) => {
      setState((prev) => (prev ? { ...prev, celebrationAlert: alert } : prev));
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const updateState = useCallback(async (partial: Partial<LiveBroadcastState>) => {
    // 1. Optimistic immediate local UI update
    setState((prev) => (prev ? { ...prev, ...partial } : null));

    // 2. Instant low-latency push via Socket.io WebSocket (<1ms)
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit('controller:update_state', partial);
    }

    // 3. Reliable REST API backup sync
    try {
      await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(partial),
      });
    } catch (err) {
      console.error('Failed to sync state via API:', err);
    }
  }, []);

  const triggerAlert = useCallback(
    async (alert: {
      type: 'GOAL' | 'YELLOW_CARD' | 'RED_CARD' | 'FOUL' | 'TIMEOUT' | 'WWCD' | 'CUSTOM';
      teamType?: 'TEAM_A' | 'TEAM_B';
      teamName?: string;
      title: string;
      subtitle?: string;
      durationMs?: number;
    }) => {
      // 1. Instant push via Socket.io WebSocket
      if (socketRef.current && socketRef.current.connected) {
        socketRef.current.emit('controller:trigger_alert', alert);
      }

      // 2. REST API backup
      try {
        await fetch('/api/alert', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(alert),
        });
      } catch (err) {
        console.error('Failed to trigger alert via API:', err);
      }
    },
    []
  );

  return {
    state,
    connected,
    updateState,
    triggerAlert,
  };
}
