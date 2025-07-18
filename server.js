const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Serve static files
app.use(express.static(path.join(__dirname)));

// Store current display state
let displayState = {
    leftDisplay: { type: null, content: null },
    rightDisplay: { type: null, content: null },
    syncMode: false,
    timing: { duration: 5, transition: 1 }
};

// Socket.IO connection handling
io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
    
    // Send current state to newly connected client
    socket.emit('stateUpdate', displayState);
    
    // Handle display updates from edit clients
    socket.on('updateDisplay', (data) => {
        console.log('Display update received:', data);
        
        // Update server state
        if (data.side === 'left') {
            displayState.leftDisplay = { type: data.type, content: data.content };
        } else if (data.side === 'right') {
            displayState.rightDisplay = { type: data.type, content: data.content };
        } else if (data.side === 'both') {
            displayState.leftDisplay = { type: data.type, content: data.content };
            displayState.rightDisplay = { type: data.type, content: data.content };
        }
        
        // Broadcast to all connected clients
        io.emit('stateUpdate', displayState);
    });
    
    // Handle clear commands
    socket.on('clearDisplay', (data) => {
        console.log('Clear display:', data);
        
        if (data.side === 'left') {
            displayState.leftDisplay = { type: null, content: null };
        } else if (data.side === 'right') {
            displayState.rightDisplay = { type: null, content: null };
        } else if (data.side === 'both') {
            displayState.leftDisplay = { type: null, content: null };
            displayState.rightDisplay = { type: null, content: null };
        }
        
        io.emit('stateUpdate', displayState);
    });
    
    // Handle sync mode changes
    socket.on('updateSync', (data) => {
        console.log('Sync update:', data);
        displayState.syncMode = data.syncMode;
        io.emit('stateUpdate', displayState);
    });
    
    // Handle timing updates
    socket.on('updateTiming', (data) => {
        console.log('Timing update:', data);
        displayState.timing = data.timing;
        io.emit('stateUpdate', displayState);
    });
    
    // Handle sync displays action
    socket.on('syncDisplays', () => {
        console.log('Syncing displays');
        displayState.rightDisplay = { ...displayState.leftDisplay };
        io.emit('stateUpdate', displayState);
    });
    
    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});

const PORT = process.env.PORT || 8765;
server.listen(PORT, () => {
    console.log(`LiveWindow Server running on http://localhost:${PORT}`);
    console.log('Multiple instances can now be controlled from any edit interface!');
});
