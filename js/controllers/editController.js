angular.module('liveWindowApp')
    .controller('EditController', ['$scope', '$location', '$interval', 'DisplayService', function($scope, $location, $interval, DisplayService) {
        // Initialize scope variables
        $scope.themes = DisplayService.getThemes();
        $scope.overlays = DisplayService.getOverlays();
        $scope.leftDisplay = DisplayService.getLeftDisplay();
        $scope.rightDisplay = DisplayService.getRightDisplay();
        $scope.connectionStatus = null;
        
        // Listen for images loaded event to refresh themes
        $scope.$on('imagesLoaded', function() {
            $scope.themes = DisplayService.getThemes();
        });

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

        // Unified theme control
        $scope.setTheme = function(theme) {
            DisplayService.setTheme(theme);
            $scope.leftDisplay = DisplayService.getLeftDisplay();
            $scope.rightDisplay = DisplayService.getRightDisplay();
        };

        // Unified overlay controls
        $scope.setBothOverlays = function(overlayPath) {
            DisplayService.setBothOverlays(overlayPath);
            $scope.leftDisplay = DisplayService.getLeftDisplay();
            $scope.rightDisplay = DisplayService.getRightDisplay();
        };

        $scope.clearBothOverlays = function() {
            DisplayService.clearBothOverlays();
            $scope.leftDisplay = DisplayService.getLeftDisplay();
            $scope.rightDisplay = DisplayService.getRightDisplay();
        };

        // Unified window pane toggle
        $scope.toggleBothWindowPanes = function() {
            DisplayService.toggleBothWindowPanes();
            $scope.leftDisplay = DisplayService.getLeftDisplay();
            $scope.rightDisplay = DisplayService.getRightDisplay();
        };

        // Unified clear
        $scope.clearBoth = function() {
            DisplayService.clearBoth();
            $scope.leftDisplay = DisplayService.getLeftDisplay();
            $scope.rightDisplay = DisplayService.getRightDisplay();
        };

        $scope.getOverlays = function() {
            return DisplayService.getOverlays();
        };

        // Unified utility functions
        $scope.isThemeActive = function(theme) {
            return DisplayService.isThemeActive(theme);
        };

        $scope.isOverlayActiveOnBoth = function(overlayPath) {
            return DisplayService.isOverlayActiveOnBoth(overlayPath);
        };

        $scope.areWindowPanesActive = function() {
            return DisplayService.areWindowPanesActive();
        };
    }]);
