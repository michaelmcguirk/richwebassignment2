'use strict';

/* App Module */

var phonecatApp = angular.module('phonecatApp', [
  'auth0',
    'angular-storage',
    'angular-jwt',
    'ngRoute',
  'phonecatControllers',
  'phonecatFilters'
]);

phonecatApp.run(function($rootScope, auth, store, jwtHelper, $location) {
  // This events gets triggered on refresh or URL change
  $rootScope.$on('$locationChangeStart', function() {
    var token = store.get('token');
    if (token) {
      if (!jwtHelper.isTokenExpired(token)) {
        if (!auth.isAuthenticated) {
          auth.authenticate(store.get('profile'), token);
        }
      } else {
        // Either show the login page or use the refresh token to get a new idToken
        $location.path('/');
      }
    }
  });
});

phonecatApp.config(['$routeProvider',
  function ($routeProvider, authprovider, $locationProvider) {
        $routeProvider.
        when('/images', {
            templateUrl: 'partials/imglist.html',
            controller: 'PhoneListCtrl',
            requiresLogin: true
        }).
        when('/images/:imageid', {
            templateUrl: 'partials/img-details.html',
            controller: 'PhoneDetailCtrl'
        }).
        when('/login', {
            templateUrl: 'partials/login.html',
            controller: 'LoginCtrl'
        }).
        otherwise({
            redirectTo: '/images'
        });
  }]);

phonecatApp.config(function (authProvider) {
        authProvider.init({
            domain: 'mmcguirk.eu.auth0.com',
            clientID: '4vtABY7DNkxRNY6m6hWfXyN2pymjNs6M',
            callbackURL: location.href,
            // Here include the URL to redirect to if the user tries to access a resource when not authenticated.
            loginUrl: '/login'
        });
    })
    .run(function (auth) {
        // This hooks al auth events to check everything as soon as the app starts
        auth.hookEvents();
    });