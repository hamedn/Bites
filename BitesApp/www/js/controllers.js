angular.module('starter.controllers', [])

.controller('DashCtrl', function($scope,$rootScope, Meals) {
  $scope.doRefresh = function() {


    $scope.meals = Meals.getMeals();


    $scope.$broadcast('scroll.refreshComplete');
  }

  $scope.doRefresh();
})

.controller('LoginCtrl', function($scope, $window, $location, $http, APIServer, $state, localStorage) {
   $scope.data = {};


    document.addEventListener("deviceready", onDeviceReady, false);
    function onDeviceReady() {
        window.open = cordova.InAppBrowser.open;
    }



  $scope.registerLocal = function () {



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
            alert(token);

            //Logged in, change screen and pass token in
          }
        })

  }

})

.controller('ChatsCtrl', function($scope, Chats) {
  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //
  //$scope.$on('$ionicView.enter', function(e) {
  //});

  $scope.chats = Chats.all();
  $scope.remove = function(chat) {
    Chats.remove(chat);
  };
})

.controller('ChatDetailCtrl', function($scope, $stateParams, Chats) {
  $scope.chat = Chats.get($stateParams.chatId);
})

.controller('AccountCtrl', function($scope) {
  $scope.settings = {
    enableFriends: true
  };
})

