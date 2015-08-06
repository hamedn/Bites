angular.module('starter.controllers', [])

.controller('DashCtrl', function($scope) {

})

.controller('LoginCtrl', function($scope, $window, $location) {
  
    document.addEventListener("deviceready", onDeviceReady, false);
    function onDeviceReady() {
        window.open = cordova.InAppBrowser.open;
    }



  $scope.loginFacebook = function() {



    url = 'http://localhost:3000' + '/auth/facebook';
        loginWindow = $window.open(url, '_blank', 'location=no,toolbar=no,hidden=no');

        loginWindow.addEventListener('loadstart', function (event) {
          hasToken = event.url.indexOf('?oauth_token=');
          if(hasToken > -1) {
            token = event.url.match("oauth_token=(.*)")[1];
            loginWindow.close();
            //Auth.updateUserAndToken(token);
            $location.path('/');
            alert(token);
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

