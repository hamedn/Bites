angular.module('settings.controllers', ['ionic-ratings'])

.controller("SettingsCtrl", function($scope, $rootScope, $state, $stateParams, localStorage, APIServer, $http, $ionicPopup) {
  
$scope.isChef = {checked:true};


  $scope.$on('$ionicView.enter', function(e) {
    chef = localStorage.get("isChef");
    console.log(chef);

    isChef = (chef == "true")


    $scope.isChef = {checked:isChef};


  });



  

  $scope.toggleChef = function () {
    chef = localStorage.get("isChef");

    if (chef=="true") {
      console.log("I just tried to not be a chef");
      $scope.isChef.checked = true;



var confirmPopup = $ionicPopup.confirm({
         title: 'Are you sure?',
         template: 'Are you sure you want to remove your chef status'
       });
       confirmPopup.then(function(res) {
         if(res) {
                    
          $http({
                  method: 'POST',
                  url: APIServer.url() + '/users/changechef',
                  headers: {'Content-Type': 'application/x-www-form-urlencoded'},

                  transformRequest: function(obj) {
                      var str = [];
                      for(var p in obj)
                      str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
                      return str.join("&");
                  },

                  data:  {
                    accessToken: localStorage.get("userToken"),
                    isChef: false
                  }
              }).then (function (response) {

                if (response.data == "success") {
                    $scope.isChef.checked = false;
                    localStorage.set("isChef","false");
                }
                else {
                  alert("Server error");
                }



              })


         } 
       });



    }
    else {
      console.log("I just tried to BECOME a chef");
      $scope.isChef.checked = false;

      var confirmPopup = $ionicPopup.confirm({
         title: 'Agreement',
         template: 'I have read and agree to the chef terms of service'
       });
       confirmPopup.then(function(res) {
         if(res) {

          $http({
                  method: 'POST',
                  url: APIServer.url() + '/users/changechef',
                  headers: {'Content-Type': 'application/x-www-form-urlencoded'},

                  transformRequest: function(obj) {
                      var str = [];
                      for(var p in obj)
                      str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
                      return str.join("&");
                  },

                  data:  {
                    accessToken: localStorage.get("userToken"),
                    isChef: true
                  }
              }).then (function (response) {

                if (response.data == "success") {
                    $scope.isChef.checked = true;
                    localStorage.set("isChef","true");
                }
                else {
                  alert("Server error");
                }



              })

         } 
       });



    }

  }

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