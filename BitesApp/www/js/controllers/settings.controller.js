angular.module('settings.controllers', ['ionic-ratings','ionic.rating']) 


.controller("SettingsCtrl", function($scope,$ionicScrollDelegate, $window,$ionicLoading,$ionicAnalytics,$timeout, $rootScope, $state,Camera, $stateParams, localStorage, APIServer, $http, $ionicPopup, $jrCrop) {


//global variables
$scope.freezebuttons = false;
$scope.chefStripeConnected = false;
$scope.isChef = {checked:true};
$scope.savedCard = false;
$scope.noOrders = false;
$scope.editProfile = false;
$scope.showCurrentOrders = true;
$scope.currentOrders = [];
$scope.pastOrders = [];
$scope.lastFour = "";
$scope.orders = {};
$scope.data = {};

$scope.chefTabs = [{
  title: 'Current Orders',
  url: 'current.html',
  style: 'left-active'
}, {
  title: 'Past Orders',
  url: 'past.html',
  style: 'right'
}];

$scope.showRatings = function(meal) {
  if (!meal.raters) return true;

  dontshow = true;
  meal.raters.forEach(function(entry) {
    console.log("theirs"+entry);
    console.log("mine"+localStorage.get("oid"))
    if (entry == localStorage.get("oid"))  {
      console.log("cannot show"+meal.title);
      dontshow = false;
    }
  });

  return dontshow;
}



  $scope.ready = false;

  $scope.update = function () {

      $ionicScrollDelegate.scrollTop();


    $scope.editProfile = false;
    var acc = localStorage.get("userToken");

    $http.get(APIServer.url() + '/users/byToken',{headers:{'accesstoken': acc }}).then(function(resp) {
      
      //load data
      $scope.isChef = {checked: resp.data.isChef};
      $scope.self = resp.data;

      //check if user has any past orders
      if (resp.data.orders && resp.data.orders.length > 0) {
        $scope.orders = resp.data.orders;
        $scope.findPastAndPresentOrders();
      }

      else {        

         $ionicScrollDelegate.$getByHandle("scrollArea2").resize();

        $scope.noOrde = true;
        $scope.showOrd = false;
        $scope.ready = true;
        $scope.currentOrders = [];
        $scope.pastOrders = []
        console.log("AINT GOT NO ORDERS")
      }


      //check if user card is on file
      if (!resp.data.stripeCustomerToken) {
          //show, "no card on file" and "enter in card details" button
          $scope.savedCard = false;
      } else {
          //show "current card on file: ***"
          $scope.savedCard = true;
          $scope.lastFour = resp.data.creditCardLastFourDigits;
      }

      //check if chef is connected to stripe, and also >5 to make sure its a reasonable token
      if (resp.data.chefStripeAccessToken && resp.data.chefStripeAccessToken.length > 5) {
        //alert(resp.data.chefStripeAccessToken)
        $scope.chefStripeConnected = true;

      };
      localStorage.set("stripeChef",resp.data.chefStripeAccessToken);




      $timeout(function() {
            $ionicScrollDelegate.$getByHandle("scrollArea4").resize();
           $timeout(function() {
                $ionicScrollDelegate.$getByHandle("scrollArea4").resize();
          }, 400);  
      }, 250);  



    });

    
    chef = localStorage.get("isChef");
    console.log(chef);

    isChef = (chef == "true")


    $scope.isChef = {checked:isChef};
    $scope.subscribe = {checked:(localStorage.get("push") == "1")};

    $scope.$apply();

  }


  $scope.$on('$ionicView.enter', $scope.update);

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

  $scope.fromCamera = function () {
    $scope.takePicture(navigator.camera.PictureSourceType.CAMERA);
  }

  $scope.fromLibrary = function () {

    $scope.takePicture(navigator.camera.PictureSourceType.PHOTOLIBRARY);

  }

  $scope.saveImage = function () {

if ($scope.freezebuttons == false) {

    $ionicLoading.show({
      template: 'Uploading photo'
    });



      var file = $scope.self.profilePicture;



      $http({
                  method: 'POST',
                  url: APIServer.url() + '/users/changepicture/' + $scope.self._id,
                  headers: {'Content-Type': 'application/x-www-form-urlencoded'},

                  transformRequest: function(obj) {
                      var str = [];
                      for(var p in obj)
                      str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
                      return str.join("&");
                  },

                  data:  {
                    image:file
                  }
              }).then (function (response) {


                $ionicLoading.hide();
                var alertPopup = $ionicPopup.alert({
                 title: 'Success',
                 template: 'Updated profile picture.',
                 cssClass:'custom-popup'
                });





              })

}

  }

  $scope.submitRating = function() {
   
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
        rating:  $scope.rating.rate,
        oid: localStorage.get("rateID"),
        userid: localStorage.get("oid")
      }

    }).then(function (response) {

      $ionicAnalytics.track("Rating Submitted", {
        meal: {
          rating: $scope.rating.rate,
          id: localStorage.get("rateID")
        }
      });

      var myPopup = $ionicPopup.show({
        title: "Meal Rated!",
        scope: $scope,
        cssClass: 'custom-popup'
      });
  
      $timeout(function() {
        myPopup.close(); 
      }, 1250);  


      $scope.goMyOrders();   
    })
  }

  $scope.rating = {};
  $scope.rating.rate = 3;
  $scope.rating.max = 5;

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

  $scope.goMyOrders = function() {
    $scope.ready = false;
    $state.go("preapp.myorders");
  }

  $scope.goRatings = function(order) {
    localStorage.set("rateID", order._id)


    console.log("ID:" + order._id);
    $scope.ready = false;
    $state.go('preapp.rating');
  }
  
  $scope.ratingsCallback = function(rating) {
    console.log('Selected rating is : ', rating);
    $scope.ratingsObject.rating = $scope.rating.rate
  };

  $scope.processImage = function (imgURL) {

    console.log(imgURL);

    $scope.freezebuttons = true;
     $jrCrop.crop({
              url: imgURL,
              width: 300,
              height: 300
          }).then(function(canvas) {
              // success!



              var oldCanvas = canvas.toDataURL("image/png");
              
               $scope.self.profilePicture = oldCanvas;
               $scope.$apply();

              var canvas = document.createElement('canvas');
               var context = canvas.getContext('2d');


                var img = new Image();
                img.src = oldCanvas;
                img.onload = function (){
                    canvas.height = 300;
                    canvas.width = 300;
                    context.drawImage(img, 0, 0,300,300);

                        $scope.self.profilePicture = canvas.toDataURL();
                        $scope.$apply();
                       
                       setTimeout(function(){  $scope.freezebuttons = false; console.log("FIXED")}, 500);



                }

          

          }, function() {

 var alertPopup = $ionicPopup.alert({
     title: 'Error',
     template: 'Image height cannot exceed image width. Please crop photos or take them in landscape (horizontal) mode.',
          cssClass:'custom-popup'

   });

              // User canceled or couldn't load image.
          });


}

$scope.toggleSub = function () {
  isSub = localStorage.get("push") == "1";
  if (isSub) {
    
    parsePlugin.unsubscribe('Bites', function(msg) {
        console.log("successfully unsubscribed");
        $scope.subscribe.checked = false;
        localStorage.set("push","0");
    }, function(e) {
        console.log("failed to unsubscribe");
        alert("Server error. Please try again.");
    });
  }
  else {
   
    parsePlugin.subscribe('Bites', function(msg) {
        console.log("successfully subscribd");
         $scope.subscribe.checked = true;
        localStorage.set("push","1");
    }, function(e) {
        console.log("failed to subscribe");
 var alertPopup = $ionicPopup.alert({
     title: 'Server Error',
     template: 'Failed to subscribe.',
          cssClass:'custom-popup'

   });


    });
  }
}

  

  $scope.toggleChef = function () {
    chef = localStorage.get("isChef");

    if (chef=="true") {
      console.log("I just tried to not be a chef");
      $scope.isChef.checked = true;



      var confirmPopup = $ionicPopup.confirm({
         title: 'Are you sure?',
         template: 'Are you sure you want to remove your chef status',
              cssClass:'custom-popup'

       });
       confirmPopup.then(function(res) {
         if(res) {
                    
          $http({
                  method: 'POST',
                  url: APIServer.url() + '/users/changechef',
                  headers: {'Content-Type': 'application/x-www-form-urlencoded'},

                  transformRequest: function(obj) {
                      var str = [];
                      for(var p in obj)
                      str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
                      return str.join("&");
                  },

                  data:  {
                    accessToken: localStorage.get("userToken"),
                    isChef: false
                  }
              }).then (function (response) {

                if (response.data == "success") {
                    $scope.isChef.checked = false;
                    localStorage.set("isChef","false");
                }
                else {


                   var alertPopup = $ionicPopup.alert({
     title: 'Server Error',
     template: 'Invalid response from server.',
          cssClass:'custom-popup'

   });


                }



              })


         } 
       });



    }
    else {
      console.log("I just tried to BECOME a chef");
      $scope.isChef.checked = false;

      var confirmPopup = $ionicPopup.confirm({
         title: 'Agreement',
         template: 'I have read and agree to the chef terms of service',
              cssClass:'custom-popup'

       });
       confirmPopup.then(function(res) {
         if(res) {

          $http({
                  method: 'POST',
                  url: APIServer.url() + '/users/changechef',
                  headers: {'Content-Type': 'application/x-www-form-urlencoded'},

                  transformRequest: function(obj) {
                      var str = [];
                      for(var p in obj)
                      str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
                      return str.join("&");
                  },

                  data:  {
                    accessToken: localStorage.get("userToken"),
                    isChef: true
                  }
              }).then (function (response) {

                if (response.data == "success") {
                    $scope.isChef.checked = true;
                    localStorage.set("isChef","true");
                }
                else {


                   var alertPopup = $ionicPopup.alert({
     title: 'Server Error',
     template: 'Unsuccessful request.',
          cssClass:'custom-popup'

   });


                }



              })

         } 
       });



    }

  }

  $scope.goDash = function() {
    $scope.ready = false;
    $state.go("preapp.dashboard");
  }

  $scope.logOut = function () {

if ($scope.freezebuttons == false) {
    var confirmPopup = $ionicPopup.confirm({
       title: 'Confirm Logout',
       template: 'Are you sure you want to log out?',
            cssClass:'custom-popup'

     });
     confirmPopup.then(function(res) {
       if(res) {
          localStorage.set("loggedIn","false");
           $state.go("preapp.splashscreen");
       } 
     });

   }

   
  }

  $scope.showOrders = function () {
    if ($scope.pastOrders.length + $scope.currentOrders.length == 0 && $scope.ready) {
      console.log("---------------");
      console.log($scope.pastOrders.length);
      console.log($scope.currentOrders.length);
      $scope.showOrd = false;
    }
    else {
      $scope.showOrd = true;
    }

    if (!$scope.ready) return false;
    return ($scope.pastOrders.length + $scope.currentOrders.length) > 0;
  }


  $scope.saveCreditCard = function () {
    console.log($scope.data.cardNumber);
    if ($scope.data.cardNumber && $scope.data.cvc && $scope.data.exp_month && $scope.data.exp_year) {
      if (Stripe.card.validateCardNumber($scope.data.cardNumber) && Stripe.card.validateExpiry($scope.data.exp_month, $scope.data.exp_year) && Stripe.card.validateCVC($scope.data.cvc)) {
        console.log("send data, it is all checked and stuff");

        $ionicLoading.show({
          template: 'Saving Credit Card Info'
        });

        $http({
              method: 'POST',
              url: APIServer.url() + '/saveCreditCard',
              headers: {'Content-Type': 'application/x-www-form-urlencoded'},

              transformRequest: function(obj) {
                var str = [];
                for(var p in obj)
                str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
                return str.join("&");
              },

              data:  {
                cardNumber: $scope.data.cardNumber,
                cvc: $scope.data.cvc,
                exp_month: $scope.data.exp_month,
                exp_year: $scope.data.exp_year,
                userToken: localStorage.get("userToken"),
                id: localStorage.get("oid")
              }
                
              }).then (function (response) {

                $ionicLoading.hide();

                if (response.data.message == "SUCCESS") {
                    console.log(response);
                    $scope.cancelChangeCreditCardInfo();
                } else {
                  console.log(response.data);

                   var alertPopup = $ionicPopup.alert({
     title: 'Server Error',
     template: response.data.reason.message,
          cssClass:'custom-popup'

   });


                }
              });

      } else {
        console.log("credit info not valid. please check all your information");
        var myPopup = $ionicPopup.show({
          title: "Your credit card info not valid. Could you check that you've entered all data in correctly?",
          scope: $scope,
          cssClass: 'custom-popup'
        });
    
        $timeout(function() {
          myPopup.close(); 
          $scope.ready = false;
          $state.go($state.current, {}, {reload: true});

        }, 2000);
      }
    } else {
      console.log("you have missing credit card info");
             
      var myPopup = $ionicPopup.show({
        title: "Oops, you didn't enter in all necessary information.",
        scope: $scope,
        cssClass: 'custom-popup'
      });
  
      $timeout(function() {
        myPopup.close();
        $scope.ready = false;
        $state.go($state.current, {}, {reload: true});

      }, 2000);
    }
  }
  

  $scope.linkStripeAccount = function() {

      url = APIServer.url() + "/auth/stripe";
      
      loginWindow = $window.open("https://connect.stripe.com/oauth/authorize?response_type=code&client_id=ca_7VvNrmZeCBiSQkfMCQjWNfTovaYSZpGR&scope=read_write", '_blank', 'location=yes,toolbar=yes,hidden=no');

      loginWindow.addEventListener('loadstart', function (event) {

        console.log(event.url);

        hasToken = event.url.indexOf('&code=');
        console.log("hasToken index " + hasToken);
        if(hasToken > -1) {
          console.log("found code");
          code = event.url.match("code=(.*)")[1];
          console.log(code);
          
          //post code to retrieve all stripe details
          $http({
            method: 'POST',
            url: 'https://connect.stripe.com/oauth/token',
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},

            transformRequest: function(obj) {
                var str = [];
                for(var p in obj)
                str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
                return str.join("&");
            },

            data:  {
              client_secret: "sk_live_pDJdLN8F6bHfQhswLlJk7wpx",
              clientID: "ca_7VvNrmZeCBiSQkfMCQjWNfTovaYSZpGR",
              code: code,
              grant_type: "authorization_code",
              response_type:"code",
              scope: "read_write"
            }
          }).then( function (body) {
              /*NO ERROR CHECKING BUILT IN YET */
              console.log("successfully posted code to stripe");

              //Post this to auth.js to save data
              $http({
                method: 'POST',
                url: APIServer.url() + '/saveChefStripeDetails',
                headers: {'Content-Type': 'application/x-www-form-urlencoded'},

                transformRequest: function(obj) {
                  var str = [];
                  for(var p in obj)
                  str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
                  return str.join("&");
                },

                data:  {
                  accessToken: angular.fromJson(body).data.access_token,
                  refreshToken: angular.fromJson(body).data.refresh_token,
                  stripeUserId: angular.fromJson(body).data.stripe_user_id,
                  userToken: localStorage.get("userToken")
                }
                  
                }).then (function (response) {
                 var alertPopup = $ionicPopup.alert({
                  title: 'Success',
                  template: "Stripe successfully connected",
                  cssClass:'custom-popup'


   });
                  $state.go("preapp.settings",{},{reload:true});

                });

              //localStorage.set("stripeAccessToken", accessToken);
              loginWindow.close();
            })
        
        } 
      })

  } 

  $scope.changeCreditCardInfo = function() {
    $state.go("preapp.stripescreen", "settings");
  }

  $scope.changePhone = function() {
    $state.go("preapp.phone", "settings");
  }

  $scope.cancelChangePhone = function() {
    if ($state.params.source == "meal") {
      $state.go("preapp.meal");
    }
    else {
      $state.go("preapp.settings");
      $scope.update();
    }
    
  }

  $scope.savePhone = function () {


    $ionicLoading.show({
      template: 'Sending info to server'
    });
  
    $http({
          method: 'POST',
          url: APIServer.url() + '/users/changephone',
          headers: {'Content-Type': 'application/x-www-form-urlencoded'},

          transformRequest: function(obj) {
            var str = [];
            for(var p in obj)
            str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
            return str.join("&");
          },

          data:  {
            phone: $scope.data.phone,
            oid: localStorage.get("oid")
          }
            
          }).then (function (response) {

            $ionicLoading.hide();

            if (response.data == "SUCCESS") {
                console.log(response);
                $scope.cancelChangePhone();
            } else {
              console.log(response.data);

var alertPopup = $ionicPopup.alert({
     title: 'Server Error',
     template: response.data.reason.message,
     cssClass:'custom-popup'
   });


            }
          });
  }

  $scope.cancelChangeCreditCardInfo = function() {
    if ($state.params.source == "meal")
      $state.go("preapp.meal");
    else
      $state.go("preapp.settings");
    
  }

  $scope.findPastAndPresentOrders = function() {
  
      var now = new Date();

      $scope.ready = false;

      $scope.currentOrders = [];
      $scope.pastOrders = [];
      
      for (var i = 0; i < $scope.orders.length; i++) {
        $http.get(APIServer.url() + '/meals/search/' + $scope.orders[i].mealId).then(function(resp) {
          var fixedDate = new Date(resp.data.pickup);
          var timeDif = fixedDate - now;

          console.log("timeDif" + timeDif);

          if (timeDif > 0 ) {
            $scope.currentOrders.push(resp.data);
          } else {
            resp.data.rating = (Math.round(resp.data.rating * 2) / 2).toFixed(1);
            $scope.pastOrders.push(resp.data);
          }
        })
      }

      $scope.showOrders()
      $scope.ready = true;
  }

  $scope.onClickChefTab = function(tab) {
    $scope.currentChefTab = tab.url;
    if (tab.url == 'current.html') {
      tab.style = 'left-active';
      $scope.chefTabs[1].style = 'right';
      $scope.showCurrentOrders = true;
    }

    if (tab.url == 'past.html') {
      tab.style = 'right-active';
      $scope.chefTabs[0].style = 'left';
      console.log("show current orders: " + $scope.showCurrentOrders);
      $scope.showCurrentOrders = false;
    }

    $scope.$apply();


     $timeout(function() {
      console.log("time out");
            $ionicScrollDelegate.$getByHandle("scrollArea3").resize();
          //  $ionicScrollDelegate.$getByHandle("scrollArea2").scrollTop();
      }, 250);  


    //$ionicScrollDelegate.$getByHandle("scrollArea2").resize();

  }

  $scope.mealClicked = function(id) {
    console.log("meal clicked id: " + id);

    $scope.ready = false;
    $state.go("preapp.meal", {source: "myorders", sourceId: id});
  }

})