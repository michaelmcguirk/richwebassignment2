'use strict';

/* Controllers */

var phonecatControllers = angular.module('phonecatControllers', []);

phonecatControllers.controller('PhoneListCtrl', ['$rootScope', '$scope', '$http',
  function ($rootScope, $scope, $http) {
    $scope.lng = "-6.2597";
    $scope.lat = "55.3478";

    $scope.locationSearch = function () {
        var locationPromise = $http.get('http://maps.googleapis.com/maps/api/geocode/json?address=' + $scope.search);

        locationPromise.success(function (data) {
            var result = data.results;
            $scope.lat = result[0].geometry.location.lat;
            $scope.lng = result[0].geometry.location.lng;
            $scope.location = result[0].formatted_address;
            getImages();
        });
    }

    var getImages = function () {

        var apiKey = "d3f8273ffd169b9c0dd20da6f8e09f6e";
        var method = "flickr.photos.search&format=json&jsoncallback=JSON_CALLBACK";



        var flickrPromise = $http.jsonp('https://api.flickr.com/services/rest/?api_key=' + apiKey + '&lat=' + $scope.lat + '&lon=' + $scope.lng + '&radius=10&radius_units=km&method=' + method);

        flickrPromise.success(function (data) {
            $scope.images = data.photos.photo.splice(0, 18);
            $rootScope.imgURLs = [];
            for (var i = 0; i < $scope.images.length; i++) {
                var farm = $scope.images[i].farm;
                var server = $scope.images[i].server;
                var imgID = $scope.images[i].id;
                var imgSecret = $scope.images[i].secret;
                var imgURL = "https://farm" + farm + ".staticflickr.com/" + server + "/" + imgID + "_" + imgSecret + ".jpg";
                var title = $scope.images[i].title;
                if (title === "") {
                    title = "No Title";
                }
                $scope.imgURLs.push({
                    "id": imgID,
                    "imgURL": imgURL,
                    "title": title
                });
            }
        });
    }
        





}]);

phonecatControllers.controller('PhoneDetailCtrl', ['$rootScope', '$scope', '$routeParams', '$http',
  function ($rootScope, $scope, $routeParams, $http) {
        $scope.imageID = $routeParams.imageid;
        var apiKey = "d3f8273ffd169b9c0dd20da6f8e09f6e";
        var method = "flickr.photos.getInfo&format=json&jsoncallback=JSON_CALLBACK";

        $http.jsonp('https://api.flickr.com/services/rest/?api_key=' + apiKey + '&photo_id=' + $scope.imageID + '&method=' + method).success(function (data) {
            var farm = data.photo.farm;
            var server = data.photo.server;
            var imgID = data.photo.id;
            var imgSecret = data.photo.secret;
            $scope.imageURL = "https://farm" + farm + ".staticflickr.com/" + server + "/" + imgID + "_" + imgSecret + ".jpg";
            $scope.imageTitle = data.photo.title._content;
            if ($scope.imageTitle === "") {
                $scope.imageTitle = "No Title";
            }
            $scope.imageOwner = data.photo.owner.realname;
            $scope.imageDescription = data.photo.description._content;
            if ($scope.imageDescription === "") {
                $scope.imageDescription = "No Description";
            }
            $scope.imageLocation = data.photo.owner.location;

        });

                }]);

phonecatControllers.controller('LoginCtrl', ['$scope', '$http', 'auth', 'store', '$location',
function ($scope, $http, auth, store, $location) {
        $scope.login = function () {
            auth.signin({}, function (profile, token) {
                // Success callback
                store.set('profile', profile);
                store.set('token', token);
                $location.path('/');
            }, function () {
                // Error callback
            });
        }
}]);