angular.module('settings.controllers', ['ionic-ratings'])

.controller("SettingsCtrl", function($scope, $rootScope, $state, $stateParams, localStorage, APIServer, $http, $ionicPopup) {
  $scope.$on('$ionicView.enter', function(e) {
    chef = localStorage.get("isChef");
    console.log(chef);
    if (chef) {
    	$scope.chef = "Want to Stop Being a Chef?";
    } else {
    	$scope.chef = "Want to be a Chef?";
    }
  });

  $scope.goDash = function() {
    $state.go("preapp.dashboard");
  }

  $scope.logOut = function () {

    var confirmPopup = $ionicPopup.confirm({
       title: 'Confirm Logout',
       template: 'Are you sure you want to log out?'
     });
     confirmPopup.then(function(res) {
       if(res) {
          localStorage.set("loggedIn","false");
           $state.go("preapp.splashscreen");
       } 
     });

   
  }

})