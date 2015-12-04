angular.module('mealform.controllers', ['ionic.rating'])


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
        mealDate: $scope.data.mealDate,
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