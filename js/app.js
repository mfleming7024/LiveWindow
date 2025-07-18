angular.module('liveWindowApp', ['ngRoute'])
    .config(['$routeProvider', function($routeProvider) {
        $routeProvider
            .when('/', {
                templateUrl: 'views/main.html',
                controller: 'MainController'
            })
            .when('/edit', {
                templateUrl: 'views/edit.html',
                controller: 'EditController'
            })
            .otherwise({
                redirectTo: '/'
            });
    }]);
