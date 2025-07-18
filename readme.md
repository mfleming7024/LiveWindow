# LiveWindow - Multi-Instance Dual Display Controller

LiveWindow is an AngularJS-based web application designed for controlling content across dual extended displays with **real-time multi-instance synchronization**. Control any number of display instances from any computer on your network!

## 🚀 Key Features

### Multi-Instance Control
- **Real-time Synchronization**: Control all display instances from any edit interface
- **Cross-Computer Control**: Manage displays on different computers from a single control panel
- **WebSocket Communication**: Instant updates across all connected instances
- **Connection Status**: Visual indicators showing multi-instance connectivity

### Dual Display Management
- **Split-Screen Layout**: Browser window stretches across both monitors (50% width each)
- **Independent Control**: Each display can show different content independently
- **Synchronized Mode**: Option to mirror content across both displays
- **Real-time Updates**: Instant content switching without page refreshes

### Content Types
- **Static Images**: SVG-based demo images with various themes (geometric, landscapes, abstract)
- **Animated Content**: HTML/CSS-based animations (waves, particles, matrix, fluid effects, etc.)
- **Video Support**: Ready for video content integration
- **Blank Display**: Clean black screen option

### Control Interface (`/#/edit` route)
- **Intuitive Grid Layout**: Visual thumbnails for easy content selection
- **Timing Controls**: Adjustable display duration and transition times
- **Auto-Advance**: Automatic slideshow functionality through content
- **Sync Management**: Toggle between independent and synchronized display modes
- **Real-time Status**: Current display status and connection indicators

## 🏗️ Architecture

### Server (Node.js + Socket.IO)
- **WebSocket Server**: Real-time communication between instances
- **State Management**: Centralized display state synchronization
- **Express Server**: Serves static files and handles HTTP requests

### Client (AngularJS + Socket.IO)
- **DisplayService**: Core display management with WebSocket integration
- **WebSocketService**: Handles real-time communication
- **Responsive UI**: Optimized for various screen sizes and orientations

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- Modern web browser
- Network connectivity for multi-instance control

### Installation & Setup

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Start the Server**:
   ```bash
   npm start
   # OR
   ./start.sh
   # OR
   node server.js
   ```

3. **Access the Application**:
   - **Main Display**: `http://localhost:3000`
   - **Edit Interface**: `http://localhost:3000/#/edit`

### Multi-Computer Setup

1. **Find Server IP**: Get the IP address of the computer running the server
2. **Access from Other Computers**: Replace `localhost` with the server IP
   - Example: `http://192.168.1.100:3000`
3. **Control Everything**: Use any edit interface to control all connected displays

## 📱 Usage Scenarios

### Single Computer Setup
1. Start the server on your Orange Pi 5
2. Open browser across dual monitors: `http://localhost:3000`
3. Use edit mode for local control: `http://localhost:3000/#/edit`

### Multi-Computer Setup
1. **Display Computer** (Orange Pi 5): 
   - Run: `node server.js`
   - Open: `http://localhost:3000` (stretched across dual monitors)

2. **Control Computer** (Any device on network):
   - Open: `http://[ORANGE_PI_IP]:3000/#/edit`
   - Control all displays remotely

3. **Additional Displays** (Optional):
   - Connect to: `http://[ORANGE_PI_IP]:3000`
   - All instances sync automatically

### Distributed Setup
- **Multiple Orange Pi devices** each running displays
- **Central control station** managing all displays
- **Real-time synchronization** across all instances

## 🎮 Control Features

### Global Controls
- **Sync Toggle**: Enable/disable synchronized display mode
- **Copy Left→Right**: Manual synchronization action
- **Clear All**: Master clear for all displays
- **Connection Status**: Real-time connectivity indicator

### Individual Display Controls
- **Content Selection**: Choose images or animations per display
- **Clear Display**: Individual display clearing
- **Real-time Preview**: See changes instantly

### Automation
- **Auto-Advance**: Automatic content rotation
- **Timing Controls**: Customize display duration and transitions
- **Synchronized Timing**: Coordinated timing across all instances