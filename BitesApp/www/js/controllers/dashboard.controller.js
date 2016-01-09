
angular.module('dashboard.controllers', ['ionic-ratings'])

// Work on the Following, Need to get the Post Requests
// Up and runnin

//.controller('MealCtrl', function($scope, $window, $location, $http, APIServer, $state) {




.controller('DashCtrl',  function($scope, $ionicScrollDelegate ,$rootScope, $state, $stateParams, $ionicPopup, $timeout, Camera, pastChefMeals, currentChefMeals, Meals, hStars, halfStar, uhStars, currentProfile, currentMeal, localStorage, APIServer, $http, $ionicSideMenuDelegate) {
  $scope.$on('$ionicView.enter', function(e) {
    $scope.meal = currentMeal.meal;
    $scope.chef = currentProfile.data;
    $scope.hStars = hStars.data;
    $scope.uhStars = uhStars.data;
    $scope.halfStars = halfStar.data;
    $scope.currentChefMeals = currentChefMeals.data;
    $scope.pastChefMeals = pastChefMeals.data;
    $scope.yourAccount = currentChefMeals.yourAccount;
    
    $scope.doRefresh();


/*
    var pickupUgly = $scope.meal.deadline
    var pickupPretty = "Sunday"
    console.log("uuu" + pickupUgly);
    
    $scope.meal.pickupPretty = pickupPretty;
*/
    var acc = localStorage.get("userToken");

    $http.get(APIServer.url() + '/users/byToken',{headers:{'accesstoken': acc }}).then(function(resp) {
      localStorage.set("oid",resp.data._id);
      localStorage.set("name",resp.data.name);
      localStorage.set("isChef",resp.data.isChef);

    });

  })

  $scope.formatMealLocation = function(mealLocation) {
    if (mealLocation) {
      if (mealLocation.length > 11) {
        return mealLocation.substring(0, 11) + "...";
      } else {
        return mealLocation;
      }
    } else {
      return "Loading...";
    }
  }

  $scope.doRefresh = function() {

    req = Meals.getMeals();

    req.then(function(result) {  // this is only run after $http completes
      var meals = result.data;
      for (i = 0; i < meals.length; i++) {
        var individualMeal = meals[i];
        if (individualMeal.photo) {
          individualMeal.photo = APIServer.url() +"/"+individualMeal.photo;
        }
        else {
          individualMeal.photo = "img/foodcard.jpg";
        }
      }

       $scope.meals = meals;
       //console.log(result.data);
       //currentMeal.meals = result.data;
       //console.log(currentMeal.meals);
        $scope.$broadcast('scroll.refreshComplete');
    });

   
  }

  $scope.getChefMeals = function() {
    currentChefMeals.data = [];
    pastChefMeals.data = [];
    //if (currentProfile.data.mealArray.length != 0) {
      var now = new Date();
      console.log("First Meal: " + currentProfile.data.mealArray[0]);
      for (var i = 0; i < currentProfile.data.mealArray.length; i++) {
        $http.get(APIServer.url() + '/meals/search/' + currentProfile.data.mealArray[i]).then(function(resp) {
          var fixedDate = new Date(resp.data.pickup);

          var timeDif = fixedDate - now;

          if (timeDif > 0 ) {
            currentChefMeals.data.push(resp.data);
          } else {
            resp.data.rating = (Math.round(resp.data.rating * 2) / 2).toFixed(1);
            pastChefMeals.data.push(resp.data);

          }
        })
      }
    //} else {
    //  return 0
    //}
  }

  $scope.deleteMeal = function(oid) {
    var confirmPopup = $ionicPopup.confirm({
       title: 'Are you sure?',
       template: 'Are you sure you want to delete the Meal?'
     });
     confirmPopup.then(function(res) {
      if(res) {
        $http({
          method: 'POST',
          url: APIServer.url() + '/meals/delete/' + oid,
          headers: {'Content-Type': 'application/x-www-form-urlencoded'},
    
            
            // I have no idea if this is necessary
            transformRequest: function(obj) {
              var str = [];
              for(var p in obj)
              str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
              return str.join("&");
            }
          }).then(function (response) {
              var myPopup = $ionicPopup.show({
                title: "Meal Deleted",
                scope: $scope
              });
          
              $timeout(function() {
                myPopup.close(); 
              }, 1250);
              $state.go($state.current, {}, {reload: true});
        })
      }
    });
  }

  $scope.calculateRatingStars = function(rating) {
    hStars.data = [];
    uhStars.data = [];
    halfStar.data = [];
    

    var decimal = rating - Math.round(rating);
    console.log("Var Decimal: " + decimal);

    //console.log("Stars to put: " + rating);
    for (var i = 0; i < Math.round(rating); i++) {
      hStars.data.push(i);
    }

    if (decimal > .25 && decimal < .75) {
      halfStar.data.push(1);
    }

    if (hStars.data.length < 5) {
      var x = 5 - hStars.data.length;
      //console.log("Stars to put: " + x);
    }

    for (var i = 0; i < x; i++) {
      uhStars.data.push(i)
    }

    if (halfStar.data.length == 1) {
      uhStars.data.splice(0, 1);
    }

  }

  $scope.doRefresh();

  $scope.goMeal = function() {
    $state.go("preapp.newmeal");    
  }

  // Placeholder goChef function
  $scope.goChef = function(oid) {
    currentChefMeals.yourAccount = false;
    if (oid == 'null') {
      oid = localStorage.get("oid");
      currentChefMeals.yourAccount = true;
    }


    currentProfile.oid = oid;

    $http.get(APIServer.url() + '/users/individual/' + oid).then(function(resp) {
      
      currentProfile.data = resp.data;

      $scope.calculateRatingStars(currentProfile.data.rating);
      $scope.getChefMeals();

      $state.go("preapp.chef");

    });

  }

  // Settings goSettings function
  $scope.goSettings = function() {
    $state.go("preapp.settings")
  }

  $scope.goMyOrders = function() {
    $state.go("preapp.myorders");
  }
  
  $scope.toMeal = function(mealCurrent) {
    currentMeal.meal = mealCurrent;
    console.log(currentMeal.meal)
    $state.go("preapp.meal")
  }


  // Get the Photo
  $scope.getPhoto = function() {
    Camera.getPicture().then(function(imageURI) {
      return imageURI
      console.log(imageURI);
    }, function(err) {
      console.err(err);
    });
  };

  $scope.tabs = [{
    title: 'About',
    url: 'about.html',
    style: 'left-active'
  }, {
    title: 'Ingredients',
    url: 'ingredients.html',
    style: 'right'
  }];

  $scope.chefTabs = [{
    title: 'Now Cooking',
    url: 'current.html',
    style: 'left-active'
  }, {
    title: 'Past Meals',
    url: 'past.html',
    style: 'right'
  }];

  $scope.currentTab = 'about.html';

  $scope.currentChefTab = 'current.html';

  $scope.onClickChefTab = function(tab) {
    $scope.currentChefTab = tab.url;
    if (tab.url == 'current.html') {
      tab.style = 'left-active';
      $scope.chefTabs[1].style = 'right';
    }

    if (tab.url == 'past.html') {
      tab.style = 'right-active';
      $scope.chefTabs[0].style = 'left';
    }

                      $scope.$apply();
                      $ionicScrollDelegate.$getByHandle("scrollArea2").resize();

  }

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

    console.log("adjut scroll");
    $scope.$apply();
    $ionicScrollDelegate.$getByHandle("scrollArea").resize();

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

  $scope.toggleLeft = function() {
    $ionicSideMenuDelegate.toggleLeft();
  }

  function handleOpenURL(url) {

    console.log(url);
    var body = document.getElementsByTagName("body")[0];
    var mainController = angular.element(body).scope();
    mainController.reportAppLaunched("http://www.bitesapp.com");


  }

  $scope.pushNotification = function() {
      console.log(localStorage.get("token"));
      var notification = {
        //"user_ids": ["568b81139fee5b1100ad1acb"],
        "tokens": [localStorage.get("token")],
        "notification": {
          "alert": "Hello World!",
          "scheduled": new Date() + 10000,
          "ios":{
            "badge":1,
            "sound":"ping.aiff",
            "expiry": 1423238641,
            "priority": 10,
            "contentAvailable": 1,
            "payload":{
              "key1":"value",
              "key2":"value"
            }
          },
          "android":{
            "collapseKey":"foo",
            "delayWhileIdle":true,
            "timeToLive":300,
            "payload":{
              "key1":"value",
              "key2":"value"
            }
          }
        }    
      };

    var dataString = JSON.stringify(notification);

    // Here's our App's PRIVATE API KEY, must be encoded for Authroization
    var encodedAPIKey = btoa("0855bb2ee64bd357b02fe4be9dab13849a0ef847389961be" + ":");

    var config = {
      headers: {
        "Content-Type": "application/json", 
        "X-Ionic-Application-Id": "b24a5ed6", 
        'Authorization' : 'basic ' + encodedAPIKey
      }
    }

    $http.post("https://push.ionic.io/api/v1/push", dataString, config)
    .success(function(data, status, headers, config) {
      console.log(data);
      console.log(status);
      console.log(headers);
      console.log(config);
      console.log("Push Success");
    })
    .error(function (data, status, header, config) {
      console.log(data);
    })
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
      var myPopup = $ionicPopup.show({
        title: "Rating Submitted",
        scope: $scope
      });
  
      $timeout(function() {
        myPopup.close(); 
      }, 1250);     
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

  $scope.toOrder = function() {
    console.log("in to order, price = " + $scope.meal.price);

    //POST data to /makeTransaction
    //......

    //POST data to save for myorders
    $http({
          method: 'POST',
          url: APIServer.url() + '/saveOrder',
          headers: {'Content-Type': 'application/x-www-form-urlencoded'},

          transformRequest: function(obj) {
            var str = [];
            for(var p in obj)
            str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
            return str.join("&");
          },

          data:  {
            orderName: $scope.meal.title,
            mealUsername: $scope.meal.userName,
            orderDate: $scope.meal.deadline,
            pickupDate: $scope.meal.pickup,
            price: $scope.meal.price,
            chefName: $scope.meal.userName,
            description: $scope.meal.description,
            userToken: localStorage.get("userToken")
          }
            
          }).then (function(response) {

              $ionicLoading.hide();

              if (response.data.message == "SUCCESS") {
                console.log(response);
                $state.go("preapp.dashboard");
              } else {
                  console.log(response.data);
                  alert("Error: " + response.data.reason.message);
                }
          });

  }
})
