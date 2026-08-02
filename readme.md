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
- **Real-time Updates**: Instant content switching without page refreshes

### Content Types
- **Static Images**: SVG-based demo images with various themes (geometric, landscapes, abstract)
- **Animated Content**: HTML/CSS-based animations (waves, particles, matrix, fluid effects, etc.)
- **Blank Display**: Clean black screen option

### Control Interface (`/#/edit` route)
- **Intuitive Grid Layout**: Visual thumbnails for easy content selection
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

### 📖 Developer Documentation & Overlay System
For detailed technical specifications on building visual overlays, background texture pass-through, overlay registration (`js/services/displayService.js`), and generating theme thumbnails via `npm run thumbnails`, see [GEMINI.md](file:///Users/Michael/Desktop/projects/LiveWindow/GEMINI.md).


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
- **Clear All**: Master clear for all displays
- **Connection Status**: Real-time connectivity indicator

### Individual Display Controls
- **Content Selection**: Choose images or animations per display
- **Clear Display**: Individual display clearing
- **Real-time Preview**: See changes instantly

## Future Improvements

Here are some recommendations for future development:

- **Modernize the Frontend**: The current implementation uses AngularJS, which is now outdated. Migrating to a modern framework like **React**, **Vue**, or a recent version of **Angular** would improve performance, maintainability, and the developer experience.

- **Component-Based Architecture**: Refactor the frontend into smaller, reusable components. This will make the codebase easier to manage and scale.

- **UI/UX Enhancements**: The control panel could be improved with a more intuitive and visually appealing design. Consider adding features like drag-and-drop, content search, and live previews.

- **Dynamic Content Loading**: Instead of hardcoding the list of overlays, they could be loaded dynamically from the `overlays` directory, similar to how images are loaded.

- **Video Support**: Extend the application to support video playback on the displays. This would require adding a video player and controls for playback.

- **API for Content Management**: Create a RESTful API for managing content (images, overlays, videos). This would allow for a more robust content management system, potentially with a dedicated admin interface.

- **Authentication**: Secure the control panel with a login system to prevent unauthorized access.

- **Improved State Management**: For more complex scenarios, consider using a state management library like Redux or MobX on the frontend to handle application state more predictably.

- **Testing**: Implement a testing strategy with unit tests for services and controllers, and end-to-end tests for user flows.
