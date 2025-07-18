angular.module('liveWindowApp')
    .controller('EditController', ['$scope', '$location', '$interval', 'DisplayService', function($scope, $location, $interval, DisplayService) {
        // Initialize scope variables
        $scope.images = DisplayService.getImages();
        $scope.animations = DisplayService.getAnimations();
        $scope.leftDisplay = DisplayService.getLeftDisplay();
        $scope.rightDisplay = DisplayService.getRightDisplay();
        $scope.syncMode = DisplayService.getSyncMode();
        $scope.timing = DisplayService.getTiming();
        $scope.connectionStatus = null;
        
        // Check connection status periodically
        var checkConnection = function() {
            try {
                var WebSocketService = angular.element(document).injector().get('WebSocketService');
                $scope.connectionStatus = WebSocketService.getConnectionStatus();
            } catch (e) {
                $scope.connectionStatus = { connected: false, socketId: null };
            }
        };
        
        // Initial connection check
        checkConnection();
        
        // Check connection status every 2 seconds
        var connectionInterval = $interval(checkConnection, 2000);
        
        // Clean up interval on scope destroy
        $scope.$on('$destroy', function() {
            if (connectionInterval) {
                $interval.cancel(connectionInterval);
            }
        });
        
        // Navigation
        $scope.goToMain = function() {
            $location.path('/');
        };
        
        // Display content selection
        $scope.setLeftContent = function(type, content) {
            DisplayService.setLeftContent(type, content);
            $scope.leftDisplay = DisplayService.getLeftDisplay();
        };
        
        $scope.setRightContent = function(type, content) {
            DisplayService.setRightContent(type, content);
            $scope.rightDisplay = DisplayService.getRightDisplay();
        };
        
        // Clear displays
        $scope.clearLeft = function() {
            DisplayService.clearLeft();
            $scope.leftDisplay = DisplayService.getLeftDisplay();
        };
        
        $scope.clearRight = function() {
            DisplayService.clearRight();
            $scope.rightDisplay = DisplayService.getRightDisplay();
        };
        
        $scope.clearBoth = function() {
            DisplayService.clearBoth();
            $scope.leftDisplay = DisplayService.getLeftDisplay();
            $scope.rightDisplay = DisplayService.getRightDisplay();
        };
        
        // Sync controls
        $scope.toggleSync = function() {
            DisplayService.toggleSync();
            $scope.syncMode = DisplayService.getSyncMode();
        };
        
        $scope.syncDisplays = function() {
            DisplayService.syncDisplays();
            $scope.leftDisplay = DisplayService.getLeftDisplay();
            $scope.rightDisplay = DisplayService.getRightDisplay();
        };
        
        // Timing controls
        $scope.updateTiming = function() {
            DisplayService.setTiming($scope.timing);
        };
        
        // Auto-advance controls
        $scope.startAutoAdvance = function() {
            DisplayService.startAutoAdvance();
        };
        
        $scope.stopAutoAdvance = function() {
            DisplayService.stopAutoAdvance();
        };
        
        // Utility functions
        $scope.isActiveLeft = function(type, content) {
            return $scope.leftDisplay.type === type && $scope.leftDisplay.content === content;
        };
        
        $scope.isActiveRight = function(type, content) {
            return $scope.rightDisplay.type === type && $scope.rightDisplay.content === content;
        };
        
        // Watch for changes in the display service
        $scope.$watch(function() {
            return DisplayService.getSyncMode();
        }, function(newVal) {
            $scope.syncMode = newVal;
        });
        
        $scope.$watch(function() {
            return DisplayService.getTiming();
        }, function(newVal) {
            $scope.timing = newVal;
        }, true);
    }]);
