angular.module('liveWindowApp')
    .service('DisplayService', ['$rootScope', '$injector', '$http', function ($rootScope, $injector, $http) {
        var leftDisplay = {
            type: null,
            content: null,
            overlay: null,
            windowPane: false
        };
        
        var rightDisplay = {
            type: null,
            content: null,
            overlay: null,
            windowPane: false
        };
        
        var syncMode = false;
        var isRemoteControlled = false;
        var images = []; // Will be loaded dynamically
        
        // Listen for remote state updates
        $rootScope.$on('websocket:stateUpdate', function (event, data) {
            console.log('Applying remote state update:', data);
            isRemoteControlled = true;
            
            leftDisplay = data.leftDisplay || { type: null, content: null, overlay: null, windowPane: false };
            rightDisplay = data.rightDisplay || { type: null, content: null, overlay: null, windowPane: false };
            
            $rootScope.$apply();
            isRemoteControlled = false;
        });
        
        // Load images dynamically from server
        function loadImages() {
            $http.get('/api/images').then(function(response) {
                images = response.data;
                console.log('Loaded', images.length, 'images dynamically from filesystem');
                $rootScope.$broadcast('imagesLoaded', images);
            }).catch(function(error) {
                console.error('Failed to load images from server:', error);
                images = [];
                $rootScope.$broadcast('imagesLoadError', error);
            });
        }
        
        var overlays = [
            { name: 'Cave Fireflies', path: 'overlays/cave-fireflies.html', emoji: '✨', description: 'Tiny glowing fireflies dancing in the darkness' },
            { name: 'Rain Drops', path: 'overlays/rain-drops.html', emoji: '🌧️', description: 'Gentle rain falling in a rhythmic pattern' },
            { name: 'Floating Embers', path: 'overlays/floating-embers.html', emoji: '🔥', description: 'Warm glowing embers drifting upward' },
            { name: 'Sunbeams', path: 'overlays/sunbeams.html', emoji: '☀️', description: 'Radiant beams of sunlight streaming through' },
            { name: 'Fog Overlay', path: 'overlays/fog-overlay.html', emoji: '🌫️', description: 'Mystical fog drifting across the bottom of the screen' }
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
            
            // Utility method to refresh image list
            refreshImages: function() {
                loadImages();
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
            
            // Window pane controls
            toggleLeftWindowPane: function() {
                leftDisplay.windowPane = !leftDisplay.windowPane;
                
                if (!isRemoteControlled) {
                    this.broadcastChange('updateWindowPane', { 
                        side: 'left', 
                        windowPane: leftDisplay.windowPane 
                    });
                }
            },
            
            toggleRightWindowPane: function() {
                rightDisplay.windowPane = !rightDisplay.windowPane;
                
                if (!isRemoteControlled) {
                    this.broadcastChange('updateWindowPane', { 
                        side: 'right', 
                        windowPane: rightDisplay.windowPane 
                    });
                }
            },
            
            // Clear functions
            clearLeft: function() {
                leftDisplay.type = null;
                leftDisplay.content = null;
                leftDisplay.overlay = null;
                leftDisplay.windowPane = false;
                
                if (!isRemoteControlled) {
                    this.broadcastChange('clearDisplay', { side: 'left' });
                }
            },
            
            clearRight: function() {
                rightDisplay.type = null;
                rightDisplay.content = null;
                rightDisplay.overlay = null;
                rightDisplay.windowPane = false;
                
                if (!isRemoteControlled) {
                    this.broadcastChange('clearDisplay', { side: 'right' });
                }
            },
            
            // Initialize
            initializeDisplays: function() {
                // Load images dynamically
                loadImages();
                
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
                        } else if (action === 'updateWindowPane') {
                            WebSocketService.updateWindowPane(data.side, data.windowPane);
                        }
                    }
                } catch (e) {
                    console.log('WebSocket service not available');
                }
            }
        };
    }]);
