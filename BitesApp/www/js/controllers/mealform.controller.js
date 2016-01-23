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

        alert("Could not use image. Image height cannot exceed image width. Please take photos in landscape mode (hold phone horizontally).");

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
      return false;
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

  $scope.newMeal = function() {

    
    $ionicLoading.show({
      template: 'Posting meal data'
    });
    

    var pickupFixed = new Date($scope.data.mealDate.getFullYear(), $scope.data.mealDate.getMonth(), $scope.data.mealDate.getDate(), 
               $scope.data.pickup.getHours(), $scope.data.pickup.getMinutes(), $scope.data.pickup.getSeconds());
    
    var orderDeadlineFixed = new Date($scope.data.mealDate.getFullYear(), $scope.data.mealDate.getMonth(), $scope.data.mealDate.getDate(), 
               $scope.data.orderDeadline.getHours(), $scope.data.orderDeadline.getMinutes(), $scope.data.orderDeadline.getSeconds());



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

            console.log("response" + response);

            if (response.data.message == "SUCCESS" && $scope.checkPrice($scope.data.price) && $scope.checkDates(orderDeadlineFixed, pickupFixed) && $scope.checkPrice($scope.data.maxOrder)) {
                console.log("response chefToken " + response.data.chefToken);
                chefToken = response.data.chefToken;
                
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
                    access:localStorage.get("userToken")
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
                      alert("Meal successfully posted");
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
                      alert("Server error");
                        console.log("ERROR: " + JSON.stringify(err));
                    }, function (progress) {
                        // constant progress updates
                    });
                    }
                    else {
                      $ionicLoading.hide();

                      var myPopup = $ionicPopup.show({
                        //template: "<div style='text-align: center;'>Welcome to Bites!</div>",
                        title: "Meal successfully posted",
                        scope: $scope
                      });

                      $timeout(function() {
                        myPopup.close(); //close the popup after 3 seconds for some reason
                      }, 2000);
    
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
                    alert("Server error. Could not load meal id.");
                  }

                })

            } else if (response.data.message == "NO CHEF TOKEN") {
              console.log(response.data);
              $ionicLoading.hide();

              var myPopup = $ionicPopup.show({
                //template: "<div style='text-align: center;'>Welcome to Bites!</div>",
                title: "Sorry, you are not a registered chef and only chefs may post meals",
                scope: $scope
              });

              $timeout(function() {
                myPopup.close(); //close the popup after 3 seconds for some reason
              }, 2000);
              
              $state.go("preapp.dashboard");
            } else if (!$scope.checkPrice($scope.data.price)) {
              console.log(response.data.price);

              $ionicLoading.hide();

              var myPopup = $ionicPopup.show({
                //template: "<div style='text-align: center;'>Welcome to Bites!</div>",
                title: "Please enter a Whole Number for the Price",
                scope: $scope
              });

              $timeout(function() {
                myPopup.close(); //close the popup after 3 seconds for some reason
              }, 2000);



            } else if (!$scope.checkDates(orderDeadlineFixed, pickupFixed)) {
              $ionicLoading.hide();

              var myPopup = $ionicPopup.show({
                //template: "<div style='text-align: center;'>Welcome to Bites!</div>",
                title: "Please don't set the pickup time before the order time",
                scope: $scope
              });

              $timeout(function() {
                myPopup.close(); //close the popup after 3 seconds for some reason
              }, 2000);
            } else if (!$scope.checkPrice($scope.data.maxOrder)) {
              $ionicLoading.hide();

              var myPopup = $ionicPopup.show({
                //template: "<div style='text-align: center;'>Welcome to Bites!</div>",
                title: "Please make the Order Number a whole number",
                scope: $scope
              });

              $timeout(function() {
                myPopup.close(); //close the popup after 3 seconds for some reason
              }, 2000);
            } else {
              console.log(response.data);
              alert("Error: " + response.data.reason.message);
            }
    });







     

  }


})