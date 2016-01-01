angular.module('splash.controllers', ['ionic-ratings'])

.controller("SplashCtrl", function($scope, $rootScope, $state, $stateParams, localStorage, APIServer, $http) {
  $scope.$on('$ionicView.enter', function(e) {
    console.log("USER LOGGED IN STATUS: " + localStorage.get("loggedIn"));
    if (localStorage.get("loggedIn") == "true") {
      console.log("TRANSITION TO DASHBOARD");
      $state.go("preapp.dashboard");

    }
  });

})