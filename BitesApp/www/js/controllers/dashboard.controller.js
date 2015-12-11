angular.module('dashboard.controllers', ['ionic-ratings'])

// Work on the Following, Need to get the Post Requests
// Up and runnin

//.controller('MealCtrl', function($scope, $window, $location, $http, APIServer, $state) {




.controller('DashCtrl',  function($scope,$rootScope, $state, $stateParams, Meals, currentMeal, localStorage, APIServer, $http) {
  $scope.$on('$ionicView.enter', function(e) {
    $scope.meal = currentMeal.meal;


    var acc = localStorage.get("userToken");

    $http.get(APIServer.url() + '/users/byToken',{headers:{'accesstoken': acc }}).then(function(resp) {
      localStorage.set("oid",resp.data._id)

    });

  })

  $scope.doRefresh = function() {

    req = Meals.getMeals();

    req.then(function(result) {  // this is only run after $http completes
       $scope.meals = result.data;

       console.log($scope.meals[0]);

       console.log({ssd:new Date()});
       //console.log(result.data);
       //currentMeal.meals = result.data;
       //console.log(currentMeal.meals);
        $scope.$broadcast('scroll.refreshComplete');
    });

   
  }

  $scope.doRefresh();

  $scope.goMeal = function() {
    $state.go("preapp.newmeal");    
  }



  $scope.toMeal = function(mealCurrent) {
    currentMeal.meal = mealCurrent;
    console.log(currentMeal.meal)
    $state.go("preapp.meal",{meal:mealCurrent})
  }

  $scope.tabs = [{
    title: 'About',
    url: 'about.html',
    style: 'left-active'
  }, {
    title: 'Ingredients',
    url: 'ingredients.html',
    style: 'right'
  }];

  $scope.currentTab = 'about.html';

  $scope.onClickTab = function(tab) {
    $scope.currentTab = tab.url;
    if (tab.url == 'about.html') {
      tab.style = 'left-active';
      $scope.tabs[1].style = 'right';
    }

    if (tab.url == 'ingredients.html') {
      tab.style = 'right-active';
      $scope.tabs[0].style = 'left';
    }
  }

  $scope.isActiveTab = function(tabUrl) {
    return tabUrl == $scope.currentTab;
  }

  $scope.goDash = function() {
    $state.go("preapp.dashboard");
  }

  $scope.findMeal = function() {

    for (meal in Object) {
      
      if (p.hasOwnProperty(key)) {
        alert(key + " -> " + p[key]);
      }

      if (meal._id == $stateParams.id) {
        $scope.meal = meal._id;
      }
    }
  }

  $scope.submitRating = function() {
    console.log($scope.rate);
    console.log($scope.meal._id);

    $http({
      method: 'POST',
      url: APIServer.url() + '/meals/rating',
      headers: {'Content-Type': 'application/x-www-form-urlencoded'},

      
      // I have no idea if this is necessary
      transformRequest: function(obj) {
        var str = [];
        for(var p in obj)
        str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
        return str.join("&");
      },
      

      data: {
        rating: $scope.ratingsObject.rating,
        oid: $scope.meal._id
      }

    }).then(function (response) {
        alert("Rating Submitted");
    })
  }
  // Setting the rating variables
  $scope.ratingsObject = {
    iconOn : 'ion-ios-star',
    iconOff : 'ion-ios-star-outline',
    iconOnColor: 'rgb(200, 200, 100)',
    iconOffColor: 'rgb(200, 100, 100)',
    rating: 3,
    minRating: 1,
    callback: function(rating) {
      $scope.ratingsCallback(rating);
    }
  };

  $scope.ratingsCallback = function(rating) {
    console.log('Selected rating is : ', rating);
    $scope.ratingsObject.rating = rating;
  };
})
