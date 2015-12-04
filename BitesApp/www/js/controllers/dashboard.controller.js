angular.module('dashboard.controllers', ['ionic.rating'])

// Work on the Following, Need to get the Post Requests
// Up and runnin

//.controller('MealCtrl', function($scope, $window, $location, $http, APIServer, $state) {




.controller('DashCtrl',  function($scope,$rootScope, $state, $stateParams, Meals, currentMeal, localStorage, APIServer, $http) {
  $scope.$on('$ionicView.enter', function(e) {
    $scope.meal = currentMeal.meal;


    var acc = localStorage.get("userToken");
    console.log(acc);

    $http.get(APIServer.url() + '/users/byToken',{headers:{'accesstoken': acc }}).then(function(resp) {
      localStorage.set("oid",resp.data._id)
       console.log(localStorage.get("oid"));

    });

  })

  $scope.doRefresh = function() {

    req = Meals.getMeals();

    req.then(function(result) {  // this is only run after $http completes
       $scope.meals = result.data;
       //console.log(result.data);
       //currentMeal.meals = result.data;
       //console.log(currentMeal.meals);
        $scope.$broadcast('scroll.refreshComplete');
    });

    console.log(localStorage.get("userToken",0));
   
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
        console.log(currentMeal.meal)

    console.log("TRYING TO FIND MEAL")

    for (meal in Object) {
      console.log("Going through the Loop!");
      
      if (p.hasOwnProperty(key)) {
        alert(key + " -> " + p[key]);
      }

      if (meal._id == $stateParams.id) {
        $scope.meal = meal._id;
        console.log("FOudn it");
      }
    }
  }

  // Setting the rating variables
  $scope.rate = 3;
  $scope.max = 5;
})
