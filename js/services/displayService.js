angular.module('liveWindowApp')
    .service('DisplayService', ['$rootScope', '$injector', function ($rootScope, $injector) {
        var leftDisplay = {
            type: null,
            content: null,
            overlay: null
        };
        
        var rightDisplay = {
            type: null,
            content: null,
            overlay: null
        };
        
        var syncMode = false;
        var isRemoteControlled = false;
        
        // Listen for remote state updates
        $rootScope.$on('websocket:stateUpdate', function (event, data) {
            console.log('Applying remote state update:', data);
            isRemoteControlled = true;
            
            leftDisplay = data.leftDisplay || { type: null, content: null, overlay: null };
            rightDisplay = data.rightDisplay || { type: null, content: null, overlay: null };
            
            $rootScope.$apply();
            isRemoteControlled = false;
        });
        
        var images = [
            { name: 'Stained Glass', path: 'images/default-left.png' },
            { name: 'Stained Glass', path: 'images/default-right.png' },
            { name: 'Day', path: 'images/day-left.png' },
            { name: 'Day', path: 'images/day-right.png' },
            { name: 'Night', path: 'images/night-left.png' },
            { name: 'Night', path: 'images/night-right.png' },
            { name: 'Forest', path: 'images/forest-left.png' },
            { name: 'Forest', path: 'images/forest-right.png' },
            { name: 'Forest - Night', path: 'images/forest-night-left.png' },
            { name: 'Forest - Night', path: 'images/forest-night-right.png' },
            { name: 'Town', path: 'images/town-left.png' },
            { name: 'Town', path: 'images/town-right.png' },
            { name: 'Bar', path: 'images/bar-left.png' },
            { name: 'Bar', path: 'images/bar-right.png' },
			{ name: 'Cave', path: 'images/cave-left.png' },
			{ name: 'Cave', path: 'images/cave-right.png' }
        ];
        
        var overlays = [
            { name: 'Cave Fireflies', path: 'overlays/cave-fireflies.html', emoji: '✨', description: 'Tiny glowing fireflies dancing in the darkness', theme: 'cave' },
            { name: 'Rain Drops', path: 'overlays/rain-drops.html', emoji: '🌧️', description: 'Gentle rain falling in a rhythmic pattern', theme: 'all' },
            { name: 'Floating Embers', path: 'overlays/floating-embers.html', emoji: '🔥', description: 'Warm glowing embers drifting upward', theme: 'all' },
            { name: 'Sunbeams', path: 'overlays/sunbeams.html', emoji: '☀️', description: 'Radiant beams of sunlight streaming through', theme: 'all' },
            { name: 'Fog Overlay', path: 'overlays/fog-overlay.html', emoji: '🌫️', description: 'Mystical fog drifting across the bottom of the screen', theme: 'all' }
        ];
        
        return {
            // Getters
            getLeftDisplay: function() {
                return leftDisplay;
            },
            
            getRightDisplay: function() {
                return rightDisplay;
            },
            
            getImages: function() {
                return images;
            },
            
            getLeftImages: function() {
                return images.filter(function(image) {
                    return image.path.includes('-left');
                });
            },
            
            getRightImages: function() {
                return images.filter(function(image) {
                    return image.path.includes('-right');
                });
            },
            
            getOverlays: function() {
                return overlays;
            },
            
            getOverlaysForTheme: function(imagePath) {
                if (!imagePath) return overlays.filter(function(overlay) { return overlay.theme === 'all'; });
                
                var theme = 'all';
                if (imagePath.includes('forest')) theme = 'forest';
                else if (imagePath.includes('cave')) theme = 'cave';
                else if (imagePath.includes('default')) theme = 'default';
                
                return overlays.filter(function(overlay) {
                    return overlay.theme === theme || overlay.theme === 'all';
                });
            },
            
            // Display setters
            setLeftContent: function(type, content) {
                leftDisplay.type = type;
                leftDisplay.content = content;
                
                // Broadcast change if not from remote
                if (!isRemoteControlled) {
                    this.broadcastChange('updateDisplay', {
                        side: 'left',
                        type: type,
                        content: content
                    });
                }
            },
            
            setRightContent: function(type, content) {
                rightDisplay.type = type;
                rightDisplay.content = content;
                
                // Broadcast change if not from remote
                if (!isRemoteControlled) {
                    this.broadcastChange('updateDisplay', {
                        side: 'right',
                        type: type,
                        content: content
                    });
                }
            },
            
            // Overlay setters
            setLeftOverlay: function(overlayPath) {
                leftDisplay.overlay = overlayPath;
                
                // Broadcast change if not from remote
                if (!isRemoteControlled) {
                    this.broadcastChange('updateOverlay', {
                        side: 'left',
                        overlay: overlayPath
                    });
                }
            },
            
            setRightOverlay: function(overlayPath) {
                rightDisplay.overlay = overlayPath;
                
                // Broadcast change if not from remote
                if (!isRemoteControlled) {
                    this.broadcastChange('updateOverlay', {
                        side: 'right',
                        overlay: overlayPath
                    });
                }
            },
            
            clearLeftOverlay: function() {
                leftDisplay.overlay = null;
                
                if (!isRemoteControlled) {
                    this.broadcastChange('clearOverlay', { side: 'left' });
                }
            },
            
            clearRightOverlay: function() {
                rightDisplay.overlay = null;
                
                if (!isRemoteControlled) {
                    this.broadcastChange('clearOverlay', { side: 'right' });
                }
            },
            
            // Clear functions
            clearLeft: function() {
                leftDisplay.type = null;
                leftDisplay.content = null;
                leftDisplay.overlay = null;
                
                if (!isRemoteControlled) {
                    this.broadcastChange('clearDisplay', { side: 'left' });
                }
            },
            
            clearRight: function() {
                rightDisplay.type = null;
                rightDisplay.content = null;
                rightDisplay.overlay = null;
                
                if (!isRemoteControlled) {
                    this.broadcastChange('clearDisplay', { side: 'right' });
                }
            },
            
            // Initialize
            initializeDisplays: function() {
                // Set default content if needed
                if (!leftDisplay.type && !rightDisplay.type) {
                    // Start with blank displays
                }
                
                // Initialize WebSocket connection
                this.initWebSocket();
            },
            
            // WebSocket helper methods
            initWebSocket: function() {
                // Lazy load WebSocket service to avoid circular dependencies
                try {
                    var WebSocketService = $injector.get('WebSocketService');
                    WebSocketService.connect();
                } catch (e) {
                    console.log('WebSocket service not available, running in standalone mode');
                }
            },
            
            broadcastChange: function(action, data) {
                // Lazy load WebSocket service
                try {
                    var WebSocketService = $injector.get('WebSocketService');
                    if (WebSocketService.isConnected()) {
                        if (action === 'updateDisplay') {
                            WebSocketService.updateDisplay(data.side, data.type, data.content);
                        } else if (action === 'clearDisplay') {
                            WebSocketService.clearDisplay(data.side);
                        } else if (action === 'updateOverlay') {
                            WebSocketService.updateOverlay(data.side, data.overlay);
                        } else if (action === 'clearOverlay') {
                            WebSocketService.clearOverlay(data.side);
                        }
                    }
                } catch (e) {
                    console.log('WebSocket service not available');
                }
            }
        };
    }]);
