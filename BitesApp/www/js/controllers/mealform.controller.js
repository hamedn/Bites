angular.module('mealform.controllers', ['ionic-ratings','jrCrop'])


.controller('MealFormCtrl', function($scope,$ionicLoading, $ionicAnalytics, $timeout, $ionicPopup, $window, $location, $http, APIServer,localStorage, Camera, $state, $jrCrop, $cordovaFileTransfer) {
  $scope.data = {};
  
   $scope.$on('$ionicView.enter', function(e) {
      $ionicScrollDelegate.scrollTop();
    });




  $scope.goDash = function() {
    $state.go("preapp.dashboard");
  }


//  $scope.photo = "http://cdn3.vox-cdn.com/uploads/chorus_asset/file/917470/iphone-6-travel-photo-review-mann-header.0.jpg"


  $scope.fromCamera = function () {
    $scope.takePicture(navigator.camera.PictureSourceType.CAMERA);
  }

  $scope.fromLibrary = function () {

    $scope.takePicture(navigator.camera.PictureSourceType.PHOTOLIBRARY);

  }

  $scope.processImage = function (imgURL) {

    console.log(imgURL);

    var img = new Image();
      img.onload = function() {

        console.log(this);
        console.log("processed image" + this.height/this.width);
        //i have currently disabled crop because of image upload problems!
        if (this.height/this.width > 1) {
          // Currently not Catching Callback, not sure if Issue
        var myPopup = $ionicPopup.alert({
          title: "Could not use Image",
          template: "Image height cannot exceed image width. Please take photos in landscape mode (hold phone horizontally).",
          scope: $scope,
          cssClass: 'custom-popup'
        });
                
        

/*
          $jrCrop.crop({
              url: imgURL,
              width: 400,
              height: 400
          }).then(function(canvas) {
              // success!

              var image = canvas.toDataURL();

              $scope.photo = image;
              $scope.$apply();


          }, function() {
              alert("Image height cannot exceed image width");
              // User canceled or couldn't load image.
          });*/

        }
        else {
          console.log("set scope to photo");
          $scope.photo = imgURL;
          $scope.$apply();

         console.log($scope.photo);
        }

      }
      img.src = imgURL;
  }


  $scope.takePicture = function (source) {

    var options =   {
      quality: 50,
      destinationType: navigator.camera.DestinationType.FILE_URI,
      sourceType: source,
      encodingType: 0,
      correctOrientation:true
      };

    Camera.getPicture(options).then(function(res) {
      
      $scope.processImage(res);

      return res;
    }, function(err) {
      console.log(err);
    });
  }

  $scope.resetForm = function (){
    $scope.data.mealDate = null;
    $scope.data.pickup = null;
    $scope.data.orderDeadline = null;
     $scope.data.title = null;
      $scope.data.description = null;
      $scope.data.price = null;

       $scope.data.maxOrder = null;
       $scope.data.numOrder = null;
       $scope.data.mealLocation = null;
        $scope.data.ingredients = null;
       $scope.data.name = null;
        $scope.photo = "";

      $scope.$apply();


  }

  $scope.getImage = function(src) {
  if (src !== "") {
    return src;  
  } else {
   return "//:0"; 
  }
};

  $scope.checkPrice = function(price) {
    if (price % 1 != 0) {
      return "wholeNumErr";
    } else if (price > 999) {
      return "exceedsMaxPrice";
    } else {
      return true;
    }
  }

  $scope.checkDates = function(orderTime, pickupTime) {
    if (pickupTime - orderTime < 0) {
      return false;
    } else {
      return true;
    }
  }

  $scope.checkMealDate = function(mealDate) {
    var date = new Date();
    console.log(date);
    months = date.getMonth();
    days = date.getDate();
    console.log("Month of Now: " + months);
    console.log("Days of Now: " + days);
    console.log("Dates: " + months + " " + days + " " + mealDate.getDate() + " " + mealDate.getMonth())
    if (mealDate.getMonth() < months)
      return true;
    if (mealDate.getDate() < days && mealDate.getMonth() <= months)
      return true;

  }

  $scope.checkOrder = function(order) {
    if (order % 1 == 0) {
      return true;
    } else {
      return false;
    }
  }

  $scope.newMeal = function() {

    var pickupFixed = new Date($scope.data.mealDate.getFullYear(), $scope.data.mealDate.getMonth(), $scope.data.mealDate.getDate(), 
               $scope.data.pickup.getHours(), $scope.data.pickup.getMinutes(), $scope.data.pickup.getSeconds());
    
    var orderDeadlineFixed = new Date($scope.data.mealDate.getFullYear(), $scope.data.mealDate.getMonth(), $scope.data.mealDate.getDate(), 
               $scope.data.orderDeadline.getHours(), $scope.data.orderDeadline.getMinutes(), $scope.data.orderDeadline.getSeconds());

    var isEmpty = $scope.checkEmpty(orderDeadlineFixed, pickupFixed);
    if (isEmpty != true) {
      var myPopup = $ionicPopup.alert({
        title: "Oops!",
        template: isEmpty,
        scope: $scope,
        cssClass: 'custom-popup'
      });

      return;
    }

    $ionicLoading.show({
      template: 'Posting meal data'
    });


    $http({
          method: 'POST',
          url: APIServer.url() + '/getChefToken',
          headers: {'Content-Type': 'application/x-www-form-urlencoded'},

          transformRequest: function(obj) {
            var str = [];
            for(var p in obj)
            str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
            return str.join("&");
          },

          data:  {
            userToken: localStorage.get("userToken")
          }
            
    }).then (function (response) {



            if (response.data.message == "SUCCESS" && $scope.checkPrice($scope.data.price) && $scope.checkDates(orderDeadlineFixed, pickupFixed) && $scope.checkPrice($scope.data.maxOrder)) {
                console.log("response chefToken " + response.data.chefToken);
                chefToken = response.data.chefToken;
                chefPhone = response.data.chefPhone;
                console.log("the chef's phone number is " + chefPhone);
                
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
                    name: $scope.data.name,
                    userOID: localStorage.get("oid"),
                    userName: localStorage.get("name") ,
                    chefToken: chefToken,
                    access:localStorage.get("userToken"),
                    chefPhone: chefPhone
                  }
                }).then(function (response) {
                    $ionicLoading.hide();
                    console.log(response);
                    
                    if (response.data.id) {
                    if ($scope.photo != null && $scope.photo != "" && $scope.photo.length > 1) {
                      $ionicLoading.show({
                        template: 'Uploading photo'
                      });

                    $cordovaFileTransfer.upload(APIServer.url() + "/meals/uploadPicture/" + response.data.id, $scope.photo, {}).then(function(result) {
                      var myPopup = $ionicPopup.show({
                        title: "Meal Successfully Posted",
                        scope: $scope,
                        cssClass: 'custom-popup'
                      });
                              
                      $timeout(function() {
                        myPopup.close(); 
                      }, 1250);                      
                      
                      $ionicAnalytics.track("Meal w/ Picture Posted", {
                        meal: {
                          title: $scope.data.title,
                          price: $scope.data.price,
                          maxOrder: $scope.data.maxOrder,
                          pickup: pickupFixed,
                          orderDeadline: orderDeadlineFixed
                        },
                        user: {
                          oid: localStorage.get("oid"),
                          name: localStorage.get("name")
                        }
                      });
                      $scope.resetForm();
                      $ionicLoading.hide();
                       $state.go("preapp.dashboard");

                    }, function(err) {
                      $ionicLoading.hide();
                      var myPopup = $ionicPopup.show({
                        title: "Server Error",
                        scope: $scope,
                        cssClass: 'custom-popup'
                      });
                              
                      $timeout(function() {
                        myPopup.close(); 
                      }, 1250);
                        console.log("ERROR: " + JSON.stringify(err));
                    }, function (progress) {
                        // constant progress updates
                    });
                    }
                    else {
                      $ionicLoading.hide();

                     var myPopup = $ionicPopup.show({
                        title: "Meal Successfully Posted",
                        scope: $scope,
                        cssClass: 'custom-popup'
                      });
                              
                      $timeout(function() {
                        myPopup.close(); 
                      }, 1250);
    
                      $ionicAnalytics.track("Meal w/o Picture Posted", {
                        meal: {
                          title: $scope.data.title,
                          price: $scope.data.price,
                          maxOrder: $scope.data.maxOrder,
                          pickup: pickupFixed,
                          orderDeadline: orderDeadlineFixed
                        },
                        user: {
                          oid: localStorage.get("oid"),
                          name: localStorage.get("name")
                        }
                      });
                      
                      $scope.resetForm();

                       $state.go("preapp.dashboard");

                    }
                  }
                  else {
                    var myPopup = $ionicPopup.alert({
                      title: "Server Error",
                      template: "Could not load meal id",
                      scope: $scope,
                      cssClass: 'custom-popup'
                    });
                            
                  }

                })

            } else if (response.data.message == "NO CHEF TOKEN") {
              console.log(response.data);
              $ionicLoading.hide();

              var myPopup = $ionicPopup.show({
                //template: "<div style='text-align: center;'>Welcome to Bites!</div>",
                title: "Sorry, you are not a registered chef and only chefs may post meals",
                scope: $scope,
                cssClass: 'custom-popup'
              });

              $timeout(function() {
                myPopup.close(); //close the popup after 3 seconds for some reason
              }, 2000);
              
              $state.go("preapp.dashboard");
            } else {
              console.log(response.data);
              var myPopup = $ionicPopup.alert({
                title: "Error",
                template: response.data.reason.message,
                scope: $scope,
                cssClass: 'custom-popup'
              });
                      

            }
    });


  }

  $scope.checkEmpty = function(orderTime, pickupTime) {
    if ($scope.data.title == undefined) {
      return "You should probably name your meal!";
    } else if ($scope.data.mealDate == undefined) {
      return "Please enter a Date";
    } else if ($scope.data.pickup == undefined) {
      return "Please enter a Pickup Time";
    } else if ($scope.data.orderDeadline == undefined) {
      return "Please enter an Order Deadline";
    } else if ($scope.data.title == undefined) {
      return "You should probably name your meal!";
    } else if ($scope.data.description == undefined) {
      return "Provide a description your meal for your customers!";
    } else if ($scope.data.price == undefined) {
      return "Provide a price for your meal";
    } else if ($scope.data.maxOrder == undefined) {
      return "How many people are you cooking for?";
    } else if ($scope.data.mealLocation == undefined) {
      return "Where are you cooking? Right now nowhere.";
    } else if ($scope.data.ingredients == undefined) {
      return "People are going to want to know what exactly you're cooking up in that lab of yours";
    } else if ($scope.checkMealDate($scope.data.mealDate)) {
      return "Right now you're cooking in the past. Please change the date";
    } else if ($scope.checkPrice($scope.data.price) == "wholeNumErr") {
      return "Please enter a Whole Number for the Price";
    } else if ($scope.checkPrice($scope.data.price) == "exceedsMaxPrice") {
      return "Please enter a number less than 1000";
    } else if (!$scope.checkDates(orderTime, pickupTime)) {
      return "Please don't set the pickup time before the order time";
    } else if (!$scope.checkOrder($scope.data.maxOrder)) {
      return "Please make the Order Number a whole number";
    } else {
      return true;
    }
  }


})