angular.module('settings.controllers', ['ionic-ratings'])

.controller("SettingsCtrl", function($scope, $rootScope, $state, $stateParams, localStorage, APIServer, $http) {
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
})