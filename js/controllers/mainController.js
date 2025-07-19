angular.module('liveWindowApp')
    .controller('MainController', ['$scope', '$location', 'DisplayService', function($scope, $location, DisplayService) {
        $scope.leftDisplay = DisplayService.getLeftDisplay();
        $scope.rightDisplay = DisplayService.getRightDisplay();
        $scope.editButtonHidden = false; // Track if edit button is hidden
        
        // Navigation function
        $scope.goToEdit = function() {
            $location.path('/edit');
        };
        
        // Function to hide the edit button temporarily
        $scope.hideEditButton = function() {
            $scope.editButtonHidden = true;
        };
        
        // Watch for changes in the display service
        $scope.$watch(function() {
            return DisplayService.getLeftDisplay();
        }, function(newVal) {
            $scope.leftDisplay = newVal;
        }, true);
        
        $scope.$watch(function() {
            return DisplayService.getRightDisplay();
        }, function(newVal) {
            $scope.rightDisplay = newVal;
        }, true);
        
        // Initialize displays
        DisplayService.initializeDisplays();
    }]);
