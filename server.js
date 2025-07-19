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
    leftDisplay: { type: null, content: null, overlay: null },
    rightDisplay: { type: null, content: null, overlay: null }
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
            displayState.leftDisplay = { type: data.type, content: data.content, overlay: displayState.leftDisplay.overlay };
        } else if (data.side === 'right') {
            displayState.rightDisplay = { type: data.type, content: data.content, overlay: displayState.rightDisplay.overlay };
        } else if (data.side === 'both') {
            displayState.leftDisplay = { type: data.type, content: data.content, overlay: displayState.leftDisplay.overlay };
            displayState.rightDisplay = { type: data.type, content: data.content, overlay: displayState.rightDisplay.overlay };
        }
        
        // Broadcast to all connected clients
        io.emit('stateUpdate', displayState);
    });
    
    // Handle clear commands
    socket.on('clearDisplay', (data) => {
        console.log('Clear display:', data);
        
        if (data.side === 'left') {
            displayState.leftDisplay = { type: null, content: null, overlay: null };
        } else if (data.side === 'right') {
            displayState.rightDisplay = { type: null, content: null, overlay: null };
        } else if (data.side === 'both') {
            displayState.leftDisplay = { type: null, content: null, overlay: null };
            displayState.rightDisplay = { type: null, content: null, overlay: null };
        }
        
        io.emit('stateUpdate', displayState);
    });
    
    // Handle overlay updates
    socket.on('updateOverlay', (data) => {
        console.log('Overlay update received:', data);
        
        // Update server state
        if (data.side === 'left') {
            displayState.leftDisplay.overlay = data.overlay;
        } else if (data.side === 'right') {
            displayState.rightDisplay.overlay = data.overlay;
        } else if (data.side === 'both') {
            displayState.leftDisplay.overlay = data.overlay;
            displayState.rightDisplay.overlay = data.overlay;
        }
        
        // Broadcast to all connected clients
        io.emit('stateUpdate', displayState);
    });
    
    // Handle clear overlay commands
    socket.on('clearOverlay', (data) => {
        console.log('Clear overlay:', data);
        
        if (data.side === 'left') {
            displayState.leftDisplay.overlay = null;
        } else if (data.side === 'right') {
            displayState.rightDisplay.overlay = null;
        } else if (data.side === 'both') {
            displayState.leftDisplay.overlay = null;
            displayState.rightDisplay.overlay = null;
        }
        
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
