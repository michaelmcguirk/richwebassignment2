'use strict';

/* App Module */

var geoImgApp = angular.module('geoImgApp', [
  'firebase',
    'auth0',
    'angular-storage',
    'angular-jwt',
    'ngRoute',
  'appControllers'
]);

geoImgApp.run(function($rootScope, auth, store, jwtHelper, $location) {
  // This events gets triggered on refresh or URL change
    $rootScope.userAuth = auth;
    $rootScope.isAuth = auth.isAuthenticated;
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
    
    $rootScope.logout = function(){
        auth.signout();
        store.remove('profile');
        store.remove('token');
    }
});

geoImgApp.config(['$routeProvider',
  function ($routeProvider, authprovider, $locationProvider) {
        $routeProvider.
        when('/images', {
            templateUrl: 'partials/imglist.html',
            controller: 'ImageSearchCtrl',
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
        when('/user-profile', {
            templateUrl: 'partials/user-profile.html',
            controller: 'UserProfileController'
        }).
        
        otherwise({
            redirectTo: '/images'
        });
  }]);

geoImgApp.config(function (authProvider) {
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