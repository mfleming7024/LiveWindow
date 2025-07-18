#!/bin/bash

echo "🚀 Starting LiveWindow Multi-Instance Controller..."
echo ""
echo "Features:"
echo "✅ Multi-Computer Control"
echo "✅ Real-time Synchronization" 
echo "✅ WebSocket Communication"
echo ""
echo "Access your application at:"
echo "🌐 Main Display: http://localhost:8765"
echo "⚙️  Edit Interface: http://localhost:8765/#/edit"
echo ""
echo "To control from another computer on the same network:"
echo "Replace 'localhost' with this computer's IP address"
echo ""

node server.js
