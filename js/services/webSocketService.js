angular.module('liveWindowApp')
    .service('WebSocketService', ['$rootScope', function($rootScope) {
        var socket = null;
        var connected = false;
        
        // Initialize connection
        var connect = function() {
            if (!socket) {
                // Connect to the server (adjust URL as needed)
                socket = io(window.location.origin);
                
                socket.on('connect', function() {
                    connected = true;
                    console.log('Connected to LiveWindow server');
                    $rootScope.$broadcast('websocket:connected');
                });
                
                socket.on('disconnect', function() {
                    connected = false;
                    console.log('Disconnected from LiveWindow server');
                    $rootScope.$broadcast('websocket:disconnected');
                });
                
                socket.on('stateUpdate', function(data) {
                    console.log('State update received:', data);
                    $rootScope.$broadcast('websocket:stateUpdate', data);
                });
                
                socket.on('connect_error', function(error) {
                    console.log('Connection error:', error);
                    $rootScope.$broadcast('websocket:error', error);
                });
            }
        };
        
        return {
            connect: connect,
            
            isConnected: function() {
                return connected;
            },
            
            // Send display update
            updateDisplay: function(side, type, content) {
                if (socket && connected) {
                    socket.emit('updateDisplay', {
                        side: side,
                        type: type,
                        content: content
                    });
                }
            },
            
            // Send clear command
            clearDisplay: function(side) {
                if (socket && connected) {
                    socket.emit('clearDisplay', {
                        side: side
                    });
                }
            },
            
            // Send sync update
            updateSync: function(syncMode) {
                if (socket && connected) {
                    socket.emit('updateSync', {
                        syncMode: syncMode
                    });
                }
            },
            
            // Send timing update
            updateTiming: function(timing) {
                if (socket && connected) {
                    socket.emit('updateTiming', {
                        timing: timing
                    });
                }
            },
            
            // Send sync displays command
            syncDisplays: function() {
                if (socket && connected) {
                    socket.emit('syncDisplays');
                }
            },
            
            // Get connection status
            getConnectionStatus: function() {
                return {
                    connected: connected,
                    socketId: socket ? socket.id : null
                };
            }
        };
    }]);
