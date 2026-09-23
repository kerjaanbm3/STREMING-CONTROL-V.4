import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import { Server as SocketIOServer } from 'socket.io';
import DataSyncService from './lib/data-sync';

const dev = process.env.NODE_ENV !== 'production';
const hostname = '0.0.0.0'; // Listen on all network interfaces for LAN Dual-PC setup
const port = parseInt(process.env.PORT || '3001', 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url!, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling request:', req.url, err);
      res.statusCode = 500;
      res.end('Internal Server Error');
    }
  });

  // Attach Socket.io Server
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  DataSyncService.setSocketIO(io);

  io.on('connection', (socket) => {
    console.log(`[Socket.io] Client connected: ${socket.id}`);

    // Send initial snapshot to newly connected client (Overlay or Admin)
    socket.emit('broadcast:state_update', DataSyncService.getState());

    // Allow controllers to push updates via WebSocket as well
    socket.on('controller:update_state', (payload) => {
      DataSyncService.syncAllChannels(payload);
    });

    socket.on('controller:trigger_alert', (alert) => {
      DataSyncService.triggerAlert(alert);
    });

    socket.on('disconnect', () => {
      console.log(`[Socket.io] Client disconnected: ${socket.id}`);
    });
  });

  // ==========================================
  // Timer Background Ticker (1 Second Interval)
  // ==========================================
  setInterval(() => {
    const state = DataSyncService.getState();
    if (state.isTimerRunning) {
      let nextSeconds = state.timerSeconds;
      if (state.timerDirection === 'DOWN') {
        nextSeconds = Math.max(0, state.timerSeconds - 1);
      } else {
        nextSeconds = state.timerSeconds + 1;
      }

      DataSyncService.syncAllChannels({
        timerSeconds: nextSeconds,
      });
    }
  }, 1000);

  // ==========================================
  // Sponsor Carousel Auto-Rotator (10s Interval)
  // ==========================================
  setInterval(() => {
    const state = DataSyncService.getState();
    if (state.sponsorCarouselVisible && state.sponsors && state.sponsors.length > 1) {
      const nextIndex = (state.currentSponsorIndex + 1) % state.sponsors.length;
      DataSyncService.syncAllChannels({
        currentSponsorIndex: nextIndex,
      });
    }
  }, 10000);

  httpServer.listen(port, () => {
    console.log(`> Broadcast Overlay System Ready!`);
    console.log(`> Local Web Panel: http://localhost:${port}/admin`);
    console.log(`> Scoreboard Overlay: http://localhost:${port}/overlay/scoreboard`);
    console.log(`> Pick & Ban Overlay: http://localhost:${port}/overlay/pick-ban`);
    console.log(`> BR Standings Overlay: http://localhost:${port}/overlay/standings`);
    console.log(`> Lower Third Overlay: http://localhost:${port}/overlay/lower-third`);
    console.log(`> vMix JSON Data Source: http://localhost:${port}/api/live-data`);
    console.log(`> LAN access enabled on all network interfaces (0.0.0.0:${port})`);
  });
});
