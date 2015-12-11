angular.module('mealform.controllers', ['ionic.rating'])


.controller('MealFormCtrl', function($scope, $window, $location, $http, APIServer, $state) {
  $scope.data = {};

  $scope.newMeal = function() {


    var pickupFixed = new Date($scope.data.mealDate.getFullYear(), $scope.data.mealDate.getMonth(), $scope.data.mealDate.getDate(), 
               $scope.data.pickup.getHours(), $scope.data.pickup.getMinutes(), $scope.data.pickup.getSeconds());
    
    var orderDeadlineFixed = new Date($scope.data.mealDate.getFullYear(), $scope.data.mealDate.getMonth(), $scope.data.mealDate.getDate(), 
               $scope.data.orderDeadline.getHours(), $scope.data.orderDeadline.getMinutes(), $scope.data.orderDeadline.getSeconds());




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
        orderDeadline: orderDeadlineFixed,
        pickup: pickupFixed,
        price: $scope.data.price,
        maxOrder: $scope.data.maxOrder,
        numOrder: $scope.data.numOrder,
        mealLocation: $scope.data.mealLocation,
        ingredients: $scope.data.ingredients,
        name: $scope.data.name
      }
    }).then(function (response) {
        alert("Meal Prepared");
        console.log(response);
        $state.go("preapp.dashboard");

    })
  }


})