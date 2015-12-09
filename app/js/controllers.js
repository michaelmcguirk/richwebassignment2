'use strict';

/* Controllers */

var appControllers = angular.module('appControllers', []);

appControllers.controller('ImageSearchCtrl', ['$rootScope', '$scope', '$http',
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

appControllers.controller('PhoneDetailCtrl', ['$rootScope', '$scope', '$routeParams', '$http', '$firebaseArray', 'auth',
  function ($rootScope, $scope, $routeParams, $http, $firebaseArray, auth) {
        $scope.imageID = $routeParams.imageid;
        $scope.auth = auth;

        //Declare API reuest components
        var restURL = "https://api.flickr.com/services/rest/?api_key=";
        var apiKey = "d3f8273ffd169b9c0dd20da6f8e09f6e";
        var method = "&method=flickr.photos.getInfo&format=json&jsoncallback=JSON_CALLBACK";

        //Declare Firebase Instances and variables.
        var ref = new Firebase("https://mmcguirkrichweb.firebaseio.com/");
        
        var commentRef = ref.child("comments");
        $scope.imageRef = commentRef.child($scope.imageID);
        $scope.commentArray = $firebaseArray($scope.imageRef); //convert JSON to array for ng-repeat.
      
        $scope.userImageRef = ref.child("users").child($scope.auth.profile.user_id).child($scope.imageID);

        
        //Get promise object from Flickr API endpoint.
        var promise = $http.jsonp(restURL + apiKey + '&photo_id=' + $scope.imageID + method);

        //Get data from promise
        promise.success(function (data) {
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
        
        $scope.addComment = function (e) {
            if (e.keyCode === 13 && $scope.comment) {
                //The flickr Image ID is used as a key, and all comments are stored as sub-documents of that key.
                $scope.imageRef.push().set({
                    userID: auth.profile.user_id,
                    username: auth.profile.nickname,
                    userImg: auth.profile.picture,
                    message: $scope.comment
                });
                
                /*
                *The "users" key holds a list of all images that a user has commented on.
                *In order to minimise the amount of API calls in the user profile section,
                *the image URL is associated with each user comment. The use profile just
                *displays images by looping through an array of image URL's, rather than
                *having to make an API call for each, using the imageID.
                */
                $scope.userImageRef.set({
                    imageID: $scope.imageID,
                    imageURL: $scope.imageURL,
                    imageTitle: $scope.imageTitle
                });
                
                //Clear comment text box after comment has been saved.
                $scope.comment = " ";
            }
        }
                }]);

//Controller for #/user-profile
appControllers.controller('UserProfileController', ['$rootScope', '$scope', '$routeParams', '$http', '$firebaseArray', 'auth',
  function ($rootScope, $scope, $routeParams, $http, $firebaseArray, auth) {
        $scope.imageID = $routeParams.imageid;
        $scope.auth = auth;
        var userID = auth.profile.user_id;


        //Declare Firebase Instances and variables.
        var ref = new Firebase("https://mmcguirkrichweb.firebaseio.com/");
        $scope.imageRef = ref.child("users").child(userID);
        $scope.userImages = $firebaseArray($scope.imageRef); 

                }]);

appControllers.controller('LoginCtrl', ['$scope', '$http', 'auth', 'store', '$location',
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