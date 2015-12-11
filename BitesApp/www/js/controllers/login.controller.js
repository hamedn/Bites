angular.module('login.controllers', ['ionic-ratings'])

// Work on the Following, Need to get the Post Requests
// Up and runnin

//.controller('MealCtrl', function($scope, $window, $location, $http, APIServer, $state) {



.controller('LoginCtrl', function($scope, $window, $location, $http, APIServer, $state, localStorage) {
   $scope.data = {};


    document.addEventListener("deviceready", onDeviceReady, false);
    function onDeviceReady() {
        window.open = cordova.InAppBrowser.open;
    }



  $scope.registerLocal = function () {

    if ($scope.data.password == $scope.data.confirm && $scope.data.agreedToTerms == true) {
      if (typeof $scope.data.chef == "undefined")
        $scope.data.chef = false;
      
      console.log("isChef: " + $scope.data.chef);
      

    $http({
        method: 'POST',
        url: APIServer.url() + '/signup',
        headers: {'Content-Type': 'application/x-www-form-urlencoded'},

        transformRequest: function(obj) {
            var str = [];
            for(var p in obj)
            str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
            return str.join("&");
        },

        data:  {
          name: $scope.data.realname,
          email: $scope.data.email,
          password: $scope.data.password,
          isChef: $scope.data.chef
        }
    }).then (function (response) {
        console.log(response.data);

        if (response.data.accessToken) {
          alert("Login Successful!!!!");
          localStorage.set("userToken", response.data.accessToken);
          console.log(response.data);
          $state.go("preapp.dashboard"); 

        }
        else {
          alert(response.data.message);
        }

    })


  }

  else if ($scope.data.agreedToTerms == false || typeof $scope.data.agreedToTerms == "undefined") {
    alert("Must Agree to Terms of Service");
  }
  else {
    alert("Passwords don't match!")
  }
}




  $scope.loginLocal = function () {

    $http({
        method: 'POST',
        url: APIServer.url() + '/login',
        headers: {'Content-Type': 'application/x-www-form-urlencoded'},

        transformRequest: function(obj) {
            var str = [];
            for(var p in obj)
            str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
            return str.join("&");
        },

        data:  {
          email: $scope.data.email,
          password: $scope.data.password
        }
    }).then (function (response) {
        console.log(response.data);

         if (response.data.accessToken) {
          alert("Login Successful!!!!");
          localStorage.set("userToken", response.data.accessToken);
          $state.go("preapp.dashboard");
        }
        else {
          alert(response.data.message);
        }


    })
  }

  $scope.loginFacebook = function() {



    url = APIServer.url() + '/auth/facebook';
        loginWindow = $window.open(url, '_blank', 'location=no,toolbar=no,hidden=no');

        loginWindow.addEventListener('loadstart', function (event) {
          hasToken = event.url.indexOf('?oauth_token=');
          if(hasToken > -1) {
            token = event.url.match("oauth_token=(.*)")[1];
            loginWindow.close();
            $location.path('/');
            localStorage.set("userToken", token);
            $state.go("preapp.dashboard");

            //Logged in, change screen and pass token in
          }
        })

  }

  $scope.registerFacebook = function() {



    url = APIServer.url() + '/auth/facebook';
        loginWindow = $window.open(url, '_blank', 'location=no,toolbar=no,hidden=no');

        loginWindow.addEventListener('loadstart', function (event) {
          hasToken = event.url.indexOf('?oauth_token=');
          if(hasToken > -1) {
            token = event.url.match("oauth_token=(.*)")[1];
            loginWindow.close();
            $location.path('/');
            localStorage.set("userToken", token);
            $state.go("preapp.registerfacebook");

            //Logged in, change screen and pass token in
          }
        })

  }

  $scope.facebookFinish = function() {

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
          isChef: $scope.data.chef
        }
    }).then (function (response) {

      if (response.data == "success") {
          $state.go("preapp.dashboard");
      }
      else {
        alert("error connecting to server");
      }



    })


}




})