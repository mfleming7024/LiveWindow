angular.module('liveWindowApp')
    .controller('EditController', ['$scope', '$location', '$interval', 'DisplayService', function($scope, $location, $interval, DisplayService) {
        // Initialize scope variables
        $scope.leftImages = DisplayService.getLeftImages();
        $scope.rightImages = DisplayService.getRightImages();
        $scope.animations = DisplayService.getAnimations();
        $scope.overlays = DisplayService.getOverlays();
        $scope.leftDisplay = DisplayService.getLeftDisplay();
        $scope.rightDisplay = DisplayService.getRightDisplay();
        $scope.syncMode = DisplayService.getSyncMode();
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
        
        // Overlay controls
        $scope.setLeftOverlay = function(overlayPath) {
            DisplayService.setLeftOverlay(overlayPath);
            $scope.leftDisplay = DisplayService.getLeftDisplay();
        };
        
        $scope.setRightOverlay = function(overlayPath) {
            DisplayService.setRightOverlay(overlayPath);
            $scope.rightDisplay = DisplayService.getRightDisplay();
        };
        
        $scope.clearLeftOverlay = function() {
            DisplayService.clearLeftOverlay();
            $scope.leftDisplay = DisplayService.getLeftDisplay();
        };
        
        $scope.clearRightOverlay = function() {
            DisplayService.clearRightOverlay();
            $scope.rightDisplay = DisplayService.getRightDisplay();
        };
        
        $scope.getFilteredOverlays = function(side) {
            var display = side === 'left' ? $scope.leftDisplay : $scope.rightDisplay;
            return DisplayService.getOverlaysForTheme(display.content);
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
        
        // Utility functions
        $scope.isActiveLeft = function(type, content) {
            return $scope.leftDisplay.type === type && $scope.leftDisplay.content === content;
        };
        
        $scope.isActiveRight = function(type, content) {
            return $scope.rightDisplay.type === type && $scope.rightDisplay.content === content;
        };
        
        $scope.isActiveLeftOverlay = function(overlayPath) {
            return $scope.leftDisplay.overlay === overlayPath;
        };
        
        $scope.isActiveRightOverlay = function(overlayPath) {
            return $scope.rightDisplay.overlay === overlayPath;
        };
        
        // Watch for changes in the display service
        $scope.$watch(function() {
            return DisplayService.getSyncMode();
        }, function(newVal) {
            $scope.syncMode = newVal;
        });
    }]);
