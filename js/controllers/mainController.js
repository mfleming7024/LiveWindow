angular.module('liveWindowApp')
    .controller('MainController', ['$scope', '$location', 'DisplayService', function ($scope, $location, DisplayService) {
        $scope.leftDisplay = DisplayService.getLeftDisplay();
        $scope.rightDisplay = DisplayService.getRightDisplay();
        $scope.initiativeTracker = DisplayService.getInitiativeTracker();
        $scope.editButtonHidden = false; // Track if edit button is hidden

        // Navigation function
        $scope.goToEdit = function () {
            $location.path('/edit');
        };

        // Function to hide the edit button temporarily
        $scope.hideEditButton = function () {
            $scope.editButtonHidden = true;
        };

        $scope.getOverlayUrl = function (display) {
            if (!display || !display.overlay) return '';
            var url = display.overlay;
            // Append background image if present so overlay can distort it
            if (display.type === 'image' && display.content) {
                url += '?bg=' + encodeURIComponent(display.content);
            }
            return url;
        };

        // Watch for changes in the display service
        $scope.$watch(function () {
            return DisplayService.getLeftDisplay();
        }, function (newVal) {
            $scope.leftDisplay = newVal;
        }, true);

        $scope.$watch(function () {
            return DisplayService.getRightDisplay();
        }, function (newVal) {
            $scope.rightDisplay = newVal;
        }, true);

        $scope.$watch(function () {
            return DisplayService.getInitiativeTracker();
        }, function (newVal) {
            $scope.initiativeTracker = newVal;
        }, true);

        // Initialize displays
        DisplayService.initializeDisplays();
    }]);
