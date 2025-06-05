// server.js
import http from 'http';
import { parse } from 'url';
import next from 'next';
import { Server } from 'socket.io';
import { IncomingMessage, ServerResponse } from 'http';
import { UrlWithParsedQuery } from 'url';

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
	const httpServer: http.Server = http.createServer(
		(req: IncomingMessage, res: ServerResponse) => {
			const parsedUrl: UrlWithParsedQuery = parse(req.url || '', true);
			handle(req, res, parsedUrl);
		},
	);

	// Initialize Socket.io
	const io = new Server(httpServer, {
		cors: {
			origin: '*',
			methods: ['GET', 'POST'],
		},
	});

	// Socket.io connection handler
	io.on('connection', (socket) => {
		console.log('A client connected:', socket.id);

		// Handle events from clients
		socket.on('dashboardDataRequest', () => {
			// Send initial data to the client
			socket.emit('dashboardData', {
				/* your dashboard data */
			});
		});

		// Handle updates to dashboard data
		socket.on('updateDashboardItem', async (data) => {
			// Process and save update
			// ...

			// Broadcast to all connected clients (except sender)
			socket.broadcast.emit('dashboardItemUpdated', data);
		});

		socket.on('disconnect', () => {
			console.log('Client disconnected:', socket.id);
		});
	});

	const PORT = process.env.PORT || 3000;
	httpServer.listen(PORT, () => {
		console.log(`> Server listening on port ${PORT}`);
	});
});
