angular.module('liveWindowApp')
    .service('DisplayService', ['$rootScope', '$injector', function($rootScope, $injector) {
        var leftDisplay = {
            type: null,
            content: null
        };
        
        var rightDisplay = {
            type: null,
            content: null
        };
        
        var syncMode = false;
        var autoAdvanceInterval = null;
        var isRemoteControlled = false;
        
        var timing = {
            duration: 5,
            transition: 1
        };
        
        // Listen for remote state updates
        $rootScope.$on('websocket:stateUpdate', function(event, data) {
            console.log('Applying remote state update:', data);
            isRemoteControlled = true;
            
            leftDisplay = data.leftDisplay || { type: null, content: null };
            rightDisplay = data.rightDisplay || { type: null, content: null };
            syncMode = data.syncMode || false;
            timing = data.timing || { duration: 5, transition: 1 };
            
            $rootScope.$apply();
            isRemoteControlled = false;
        });
        
        var images = [
            { name: 'Demo Image 1', path: 'images/demo1.svg' },
            { name: 'Demo Image 2', path: 'images/demo2.svg' },
            { name: 'Demo Image 3', path: 'images/demo3.svg' },
            { name: 'Demo Image 4', path: 'images/demo4.svg' },
            { name: 'Landscape 1', path: 'images/landscape1.svg' },
            { name: 'Landscape 2', path: 'images/landscape2.svg' },
            { name: 'Abstract 1', path: 'images/abstract1.svg' },
            { name: 'Abstract 2', path: 'images/abstract2.svg' }
        ];
        
        var animations = [
            { name: 'Mystical Energies', path: 'animations/waves.html', preview: 'thumbnails/waves-preview.svg' },
            { name: 'Spell Casting', path: 'animations/particles.html', preview: 'thumbnails/particles-preview.svg' },
            { name: 'Elemental Crystals', path: 'animations/geometric.html', preview: 'thumbnails/geometric-preview.svg' },
            { name: 'Portal Vortex', path: 'animations/spiral.html', preview: 'thumbnails/spiral-preview.svg' },
            { name: 'Ancient Tome', path: 'animations/matrix.html', preview: 'thumbnails/matrix-preview.svg' },
            { name: 'Mystical Mists', path: 'animations/fluid.html', preview: 'thumbnails/fluid-preview.svg' }
        ];
        
        return {
            // Getters
            getLeftDisplay: function() {
                return leftDisplay;
            },
            
            getRightDisplay: function() {
                return rightDisplay;
            },
            
            getSyncMode: function() {
                return syncMode;
            },
            
            getTiming: function() {
                return timing;
            },
            
            getImages: function() {
                return images;
            },
            
            getAnimations: function() {
                return animations;
            },
            
            // Display setters
            setLeftContent: function(type, content) {
                leftDisplay.type = type;
                leftDisplay.content = content;
                
                if (syncMode) {
                    rightDisplay.type = type;
                    rightDisplay.content = content;
                }
                
                // Broadcast change if not from remote
                if (!isRemoteControlled) {
                    this.broadcastChange('updateDisplay', {
                        side: syncMode ? 'both' : 'left',
                        type: type,
                        content: content
                    });
                }
            },
            
            setRightContent: function(type, content) {
                rightDisplay.type = type;
                rightDisplay.content = content;
                
                if (syncMode) {
                    leftDisplay.type = type;
                    leftDisplay.content = content;
                }
                
                // Broadcast change if not from remote
                if (!isRemoteControlled) {
                    this.broadcastChange('updateDisplay', {
                        side: syncMode ? 'both' : 'right',
                        type: type,
                        content: content
                    });
                }
            },
            
            // Clear functions
            clearLeft: function() {
                leftDisplay.type = null;
                leftDisplay.content = null;
                
                if (!isRemoteControlled) {
                    this.broadcastChange('clearDisplay', { side: 'left' });
                }
            },
            
            clearRight: function() {
                rightDisplay.type = null;
                rightDisplay.content = null;
                
                if (!isRemoteControlled) {
                    this.broadcastChange('clearDisplay', { side: 'right' });
                }
            },
            
            clearBoth: function() {
                leftDisplay.type = null;
                leftDisplay.content = null;
                rightDisplay.type = null;
                rightDisplay.content = null;
                
                if (!isRemoteControlled) {
                    this.broadcastChange('clearDisplay', { side: 'both' });
                }
            },
            
            // Sync functions
            toggleSync: function() {
                syncMode = !syncMode;
                
                if (!isRemoteControlled) {
                    this.broadcastChange('updateSync', { syncMode: syncMode });
                }
            },
            
            syncDisplays: function() {
                rightDisplay.type = leftDisplay.type;
                rightDisplay.content = leftDisplay.content;
                
                if (!isRemoteControlled) {
                    this.broadcastChange('syncDisplays');
                }
            },
            
            // Timing
            setTiming: function(newTiming) {
                timing = angular.copy(newTiming);
                
                if (!isRemoteControlled) {
                    this.broadcastChange('updateTiming', { timing: timing });
                }
            },
            
            // Auto-advance
            startAutoAdvance: function() {
                var self = this;
                if (autoAdvanceInterval) {
                    clearInterval(autoAdvanceInterval);
                }
                
                autoAdvanceInterval = setInterval(function() {
                    // Auto-advance through images
                    var currentIndex = -1;
                    for (var i = 0; i < images.length; i++) {
                        if (images[i].path === leftDisplay.content) {
                            currentIndex = i;
                            break;
                        }
                    }
                    
                    var nextIndex = (currentIndex + 1) % images.length;
                    self.setLeftContent('image', images[nextIndex].path);
                }, timing.duration * 1000);
            },
            
            stopAutoAdvance: function() {
                if (autoAdvanceInterval) {
                    clearInterval(autoAdvanceInterval);
                    autoAdvanceInterval = null;
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
                        } else if (action === 'updateSync') {
                            WebSocketService.updateSync(data.syncMode);
                        } else if (action === 'updateTiming') {
                            WebSocketService.updateTiming(data.timing);
                        } else if (action === 'syncDisplays') {
                            WebSocketService.syncDisplays();
                        }
                    }
                } catch (e) {
                    console.log('WebSocket service not available');
                }
            }
        };
    }]);
