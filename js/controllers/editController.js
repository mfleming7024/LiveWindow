angular.module('liveWindowApp')
    .controller('EditController', ['$scope', '$location', '$interval', 'DisplayService', function($scope, $location, $interval, DisplayService) {
        // Initialize scope variables
        $scope.themes = DisplayService.getThemes();
        $scope.overlays = DisplayService.getOverlays();
        $scope.leftDisplay = DisplayService.getLeftDisplay();
        $scope.rightDisplay = DisplayService.getRightDisplay();
        $scope.initiativeTracker = DisplayService.getInitiativeTracker();
        $scope.newCombatant = { name: '', init: null, dbId: null };
        
        $scope.players = [
            { id: "142137149", name: "Silas Rook" },
            { id: "143192353", name: "Coda" },
            { id: "142330441", name: "Pip" },
            { id: "142145157", name: "Sigvar Valgrim" },
            { id: "165819563", name: "Tiff" }
        ];

        $scope.onPlayerSelect = function() {
            if ($scope.newCombatant.dbId) {
                const player = $scope.players.find(p => p.id === $scope.newCombatant.dbId);
                if (player) {
                    $scope.newCombatant.name = player.name;
                }
            }
        };

        $scope.isPlayerInTracker = function(playerId) {
            if (!$scope.initiativeTracker || !$scope.initiativeTracker.combatants) return false;
            return $scope.initiativeTracker.combatants.some(c => c.dbId === playerId);
        };

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

        // Initiative Tracker Controls
        $scope.addCombatant = function() {
            if ($scope.newCombatant.name && $scope.newCombatant.init !== null) {
                DisplayService.addCombatant($scope.newCombatant.name, $scope.newCombatant.init, $scope.newCombatant.dbId);
                $scope.newCombatant.name = '';
                $scope.newCombatant.init = null;
                $scope.newCombatant.dbId = null;
            }
        };

        $scope.syncCharacterData = function() {
            DisplayService.syncCharacterData();
        };

        $scope.removeCombatant = function(index) {
            DisplayService.removeCombatant(index);
        };

        $scope.sortInitiative = function() {
            DisplayService.sortInitiative();
        };

        $scope.toggleInitiativeVisibility = function() {
            DisplayService.toggleInitiativeVisibility();
        };

        $scope.clearInitiative = function() {
            DisplayService.clearInitiative();
        };

        // Watch for initiative tracker updates from the service
        $scope.$watch(function() {
            return DisplayService.getInitiativeTracker();
        }, function(newVal) {
            $scope.initiativeTracker = newVal;
        }, true);

        // Initialize displays
        DisplayService.initializeDisplays();
    }]);
