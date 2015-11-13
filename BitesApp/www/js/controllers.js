angular.module('starter.controllers', [])

// Work on the Following, Need to get the Post Requests
// Up and running
.controller('MealFormCtrl', function($scope, $window, $location, $http, APIServer, $state) {
  $scope.data = {};

  $scope.newMeal = function() {

    $http({
      method: 'POST',
      url: APIServer.url() + '/meals',
      headers: {'Content-Type': 'application/x-www-form-urlencoded'},

      
      // I have no idea if this is necessary
      transformRequest: function(obj) {
        var str = [];
        for(var p in obj)
        str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
        return str.join("&");
      },
      

      data: {
        title: $scope.data.title,
        description: $scope.data.description,
        orderDeadline: $scope.data.orderDeadline,
        pickup: $scope.data.pickup,
        price: $scope.data.price,
        maxOrder: $scope.data.maxOrder,
        numOrder: $scope.data.numOrder,
        mealLocation: $scope.data.mealLocation,
        ingredients: $scope.data.ingredients,
        name: $scope.data.name
      }
    }).then(function (response) {
        alert("Meal Prepared");
        $state.go("preapp.dashboard");

    })
  }


})

//.controller('MealCtrl', function($scope, $window, $location, $http, APIServer, $state) {




.controller('DashCtrl', function($scope,$rootScope, $state, Meals) {
  $scope.doRefresh = function() {

    req = Meals.getMeals();

    req.then(function(result) {  // this is only run after $http completes
       $scope.meals = result.data;
       console.log(result.data);
        $scope.$broadcast('scroll.refreshComplete');
    });

   
  }

  $scope.doRefresh();

  $scope.goMeal = function() {
    $state.go("preapp.newmeal");    
  }

  $scope.toMeal = function(id) {
    $state.go("preapp.meal", {id: id})
  }

  $scope.tabs = [{
    title: 'About',
    url: 'about.html',
    style: 'left'
  }, {
    title: 'Ingredients',
    url: 'ingredients.html',
    style: 'right'
  }];

  $scope.currentTab = 'about.html';

  $scope.onClickTab = function(tab) {
    $scope.currentTab = tab.url;
  }

  $scope.isActiveTab = function(tabUrl) {
    return tabUrl == $scope.currentTab;
  }

  $scope.goDash = function() {
    $state.go("preapp.dashboard");
  }

  $scope.findMeal = function(id) {
    for (var i = 0; i < $scope.meals; i++) {
      if ($scope.meal._id == id)
        $scope.meal = $scope.meal._id;
    }
  }
})

.controller('LoginCtrl', function($scope, $window, $location, $http, APIServer, $state, localStorage) {
   $scope.data = {};


    document.addEventListener("deviceready", onDeviceReady, false);
    function onDeviceReady() {
        window.open = cordova.InAppBrowser.open;
    }



  $scope.registerLocal = function () {
    if ($scope.data.password == $scope.data.confirm) {


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
          name: $scope.data.realname
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

