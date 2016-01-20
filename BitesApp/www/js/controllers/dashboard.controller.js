
angular.module('dashboard.controllers', ['ionic-ratings'])

// Work on the Following, Need to get the Post Requests
// Up and runnin

//.controller('MealCtrl', function($scope, $window, $location, $http, APIServer, $state) {




.controller('DashCtrl',  function($scope, $cordovaClipboard, $ionicModal, $ionicLoading, $ionicAnalytics, $ionicScrollDelegate ,$rootScope, $state, $stateParams, $ionicPopup, $timeout, Camera, pastChefMeals, currentChefMeals, Meals, hStars, halfStar, uhStars, currentProfile, currentMeal, localStorage, APIServer, $http, $ionicSideMenuDelegate) {
 
  $scope.shareMeal = function(m) {
    //console.log(m);
    var extension = m.charId;
    var link = APIServer.url() + "/m/" + extension;
    console.log(link);
   // console.log("COPIED TO CLIPBAORD" + extension);

   $cordovaClipboard
    .copy(link)
    .then(function () {
       var myPopup = $ionicPopup.show({
              title: "Link successfully copied to clipboard",
              scope: $scope
            });

            $timeout(function() {
              myPopup.close(); //close the popup after 3 seconds for some reason
            }, 2500);


    }, function () {
      var myPopup = $ionicPopup.show({
              title: "Clipboard access error",
              scope: $scope
            });

            $timeout(function() {
              myPopup.close(); //close the popup after 3 seconds for some reason
            }, 2500);

    });

  }


  $scope.isChef = function() {
    return localStorage.get("isChef") == "true";
  }

 $scope.$on('$ionicView.enter', function(e) {
    $scope.meal = currentMeal.meal;
    $scope.chef = currentProfile.data;
    $scope.hStars = hStars.data;
    $scope.uhStars = uhStars.data;
    $scope.halfStars = halfStar.data;
    $scope.currentChefMeals = currentChefMeals.data;
    $scope.pastChefMeals = pastChefMeals.data;
    $scope.yourAccount = currentChefMeals.yourAccount;
    
    //$scope.customerStripeToken = resp.data.stripeCustomerToken;
    //console.log("scope stripeCustomerToken " + resp.data.stripeCustomerToken);
    $scope.doRefresh();

    if ($state.params.source == "myorders") {
      console.log("coming from myorders " + $state.params.sourceId);
      $scope.showMeal($state.params.sourceId);
        
    } else {
        console.log("not coming from myorders " + $state.params.sourceId);
    }

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
      localStorage.set("stripeChef",resp.data.chefStripeAccessToken);
      localStorage.set("stripeCustomerToken", resp.data.stripeCustomerToken);
    });

  })

  $scope.showMeal = function(mealId) {
    console.log("showMeal with id " + mealId);
    $http.get(APIServer.url() + '/meals/search/' + mealId).then(function(resp) {
        
        console.log("found meal");
        currentMeal.meal = resp.data;
        $scope.meal = currentMeal.meal;
      })
  }

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
      for (i = meals.length-1; i >= 0; i--) {
        var individualMeal = meals[i];
      

         var fixedDate = new Date(individualMeal.deadline);
        var now = new Date();

          var timeDif = fixedDate - now;

          if (timeDif <= 0  || (individualMeal.maxOrder - individualMeal.numOrder) <= 0) {
            meals.splice(i,1)

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

              $ionicAnalytics.track("Meal Deleted", {
                meal: {
                  id: oid
                }
              });

              var myPopup = $ionicPopup.show({
                title: "Meal Deleted",
                scope: $scope
              });
          
              $timeout(function() {
                myPopup.close(); 
                $state.go($state.current, {}, {reload: true});

              }, 2000);

              $scope.getChefMeals();


             
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
if (localStorage.get("stripeChef").length > 5 && localStorage.get("stripeChef") != "undefined" ) {
    $state.go("preapp.newmeal");   
    }
    else {
      alert("Chef account not connected with stripe. Please do so in settings");
    } 
  }

  // Placeholder goChef function
  $scope.goChef = function(oid) {
    currentChefMeals.yourAccount = false;
    if (oid == 'null' || oid == localStorage.get("oid")) {
      oid = localStorage.get("oid");
      currentChefMeals.yourAccount = true;
    }


    currentProfile.oid = oid;


    $http.get(APIServer.url() + '/users/individual/' + oid).then(function(resp) {
      
      currentProfile.data = resp.data;


            console.log("TRIED TO GO CHEF");



      if (currentProfile.data.rating == -5) {
        $scope.chefRating = false;
      } else {
        $scope.calculateRatingStars(currentProfile.data.rating);
        $scope.getChefMeals();
        $scope.chefRating = true;

      }



        $state.go("preapp.chef");       
      

    });

  }

  // Settings goSettings function
  $scope.goSettings = function() {
    $state.go("preapp.settings");
  }

  $scope.goMyOrders = function() {
    $state.go("preapp.myorders");
  }
  
  $scope.toMeal = function(mealCurrent, oid) {
    
if (localStorage.get("stripeCustomerToken").length > 4 && localStorage.get("stripeCustomerToken") != "undefined") {


    currentMeal.meal = mealCurrent;
    console.log(currentMeal.meal._id);
    console.log(currentMeal.meal)
    currentProfile.oid = oid;

    $http.get(APIServer.url() + '/users/individual/' + oid).then(function(resp) {
      
      currentProfile.data = resp.data;

      $scope.calculateRatingStars(currentProfile.data.rating);
      $scope.getChefMeals();

      $state.go("preapp.meal");

    });
  }
  else {
    alert("No credit card information. Please configure in settings.");
  }
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
    $ionicScrollDelegate.$getByHandle("scrollArea").resize();

  }

  $scope.isActiveTab = function(tabUrl) {
    return tabUrl == $scope.currentTab;
  }

  $scope.goDash = function() {
    if ($state.params.source == "myorders")
      $state.go("preapp.myorders");
    else 
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

  $scope.formatPrice = function(price) {
    //console.log(price);
    if (price % 1 == 0) {
      return price + ".00";
    } else if ((price*10) % 1 == 0) {
      return price + "0";
    } else {
      return price;
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

      $ionicAnalytics.track("Rating Submitted", {
        meal: {
          rating: $scope.ratingsObject.rating,
          id: $scope.meal._id
        }
      });

      var myPopup = $ionicPopup.show({
        title: "Rating Submitted",
        scope: $scope
      });
  
      $timeout(function() {
        myPopup.close(); 
      }, 1250);  

      $scope.goMyOrders();   
    })
  }
  // Setting the rating variables
  $scope.ratingsObject = {
    iconOn : 'ion-ios-star',
    iconOff : 'ion-ios-star-outline',
    iconOnColor: '#33cd5f',
    iconOffColor: '#33cd5f',
    rating: 3,
    minRating: 1,
    callback: function(rating) {
      $scope.ratingsCallback(rating);
    }
  };

  $scope.goRatings = function() {
    $state.go('preapp.rating');
  }
  
  $scope.ratingsCallback = function(rating) {
    console.log('Selected rating is : ', rating);
    $scope.ratingsObject.rating = rating;
  };

  $scope.toOrder = function() {
    
    if(localStorage.get("stripeCustomerToken")) {

            $ionicLoading.show({
              template: 'Making transaction'
            });

            //POST data to /makeTransaction
            $http({ 
              method: 'POST',
              url: APIServer.url() + '/makeTransaction',
              headers: {'Content-Type': 'application/x-www-form-urlencoded'},

              transformRequest: function(obj) {
                var str = [];
                for(var p in obj)
                str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
                return str.join("&");
              },

              data:  {
                //data to make transaction
                transAmount: $scope.meal.price,
                source: localStorage.get("stripeCustomerToken"),
                receiver: $scope.meal.chefToken
              }
                
              }).then (function(response) {

                $ionicLoading.hide();

                if (response.data.message == "SUCCESS") {
                  console.log("transaction successfully made");
                  var chefToken = response.data.chefToken;

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
                      mealId: $scope.meal._id,
                      userToken: localStorage.get("userToken")
                    }
                      
                    }).then(function(response) {

                      $ionicLoading.hide();

                      if (response.data.message == "SUCCESS") {
                        $ionicAnalytics.track("Meal Ordered", {
                          meal: {
                            id: $scope.meal._id,
                            name: $scope.meal.name,
                            price: $scope.meal.price
                          },
                          user: {
                            id: localStorage.get('oid')
                          }
                        });

                        $state.go("preapp.dashboard");

                        console.log("added order to my orders");
                        var myPopup = $ionicPopup.show({
                            title: "Meal added to My Orders",
                            scope: $scope
                        });

                        $timeout(function() {
                          $state.go("preapp.dashboard");
                          myPopup.close(); //close the popup after 3 seconds for some reason
                        }, 2500);

                      } else {
                          console.log("did not add to orders " + response.data.message);
                          alert("Error: " + response.data.message);
                      }
                    });


                } else {
                    $ionicLoading.hide();
                    console.log(response.data);
                    alert("Error: " + response.data.message);
                }
              });

       
   } else {
      var noCardPopup = $ionicPopup.confirm({
       title: 'No Credit Card',
       template: 'You do not have a credit card on file. Would you like to enter one now?'
      });

      noCardPopup.then(function(res){
        if (res) {
          console.log("state url" + $stateParams.url);
          $state.go("preapp.stripescreen", {source: "meal"});
        } 
      });

   }

  }

  $scope.viewCustomerList = function(meal) {
    console.log("show customer list");
    $scope.orderCustomers = meal.customers;

    if ($scope.orderCustomers.length == 0)
      $scope.noCustomers = true;
    else
      $scope.noCustomers = false;

    $ionicModal.fromTemplateUrl('my-modal.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function(modal) {
      $scope.modal = modal;
      $scope.modal.show();
    });

    console.log("after show modal");
  }

  $scope.openModal = function() {
    $scope.modal.show();
  };
  $scope.closeModal = function() {
    $scope.modal.hide();
  };
  //Cleanup the modal when we're done with it!
  $scope.$on('$destroy', function() {
    $scope.modal.remove();
  });
  
})
