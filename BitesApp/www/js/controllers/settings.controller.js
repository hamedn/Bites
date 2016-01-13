angular.module('settings.controllers', ['ionic-ratings']) 


.controller("SettingsCtrl", function($scope, $window,$ionicLoading, $rootScope, $state,Camera, $stateParams, localStorage, APIServer, $http, $ionicPopup, $jrCrop) {



//global variables
$scope.freezebuttons = false;
$scope.chefStripeConnected = false;
$scope.isChef = {checked:true};
$scope.savedCard = false;
$scope.noOrders = false;
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



  $scope.$on('$ionicView.enter', function(e) {

    $scope.currentOrders = [];
    $scope.pastOrders = [];
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
        $scope.noOrders = true;
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

      //check if chef is connected to stripe
      if (resp.data.chefStripeAccessToken) {};
          //$scope.chefStripeConnected = true;

    });

    
    chef = localStorage.get("isChef");
    console.log(chef);

    isChef = (chef == "true")


    $scope.isChef = {checked:isChef};
    


  });

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
                alert("Successfully changed profile picture");



              })

}

  }



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
                       
                       setTimeout(function(){  $scope.freezebuttons = false; console.log("FIXED")}, 2000);



                }

          

          }, function() {
              alert("Image height cannot exceed image width");
              // User canceled or couldn't load image.
          });


}

  

  $scope.toggleChef = function () {
    chef = localStorage.get("isChef");

    if (chef=="true") {
      console.log("I just tried to not be a chef");
      $scope.isChef.checked = true;



      var confirmPopup = $ionicPopup.confirm({
         title: 'Are you sure?',
         template: 'Are you sure you want to remove your chef status'
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
                  alert("Server error");
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
         template: 'I have read and agree to the chef terms of service'
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
                  alert("Server error");
                }



              })

         } 
       });



    }

  }

  $scope.goDash = function() {
    $state.go("preapp.dashboard");
  }

  $scope.logOut = function () {

if ($scope.freezebuttons == false) {
    var confirmPopup = $ionicPopup.confirm({
       title: 'Confirm Logout',
       template: 'Are you sure you want to log out?'
     });
     confirmPopup.then(function(res) {
       if(res) {
          localStorage.set("loggedIn","false");
           $state.go("preapp.splashscreen");
       } 
     });

   }

   
  }


  $scope.saveCreditCard = function () {
    console.log($scope.data.cardNumber);


    $ionicLoading.show({
      template: 'Sending info to server'
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
            userToken: localStorage.get("userToken")
          }
            
          }).then (function (response) {

            $ionicLoading.hide();

            if (response.data.message == "SUCCESS") {
                console.log(response);
                $scope.cancelChangeCreditCardInfo();
            } else {
              console.log(response.data);
              alert("Error: " + response.data.reason.message);
            }
          });
  }
  

  $scope.linkStripeAccount = function() {

      url = APIServer.url() + "/auth/stripe";
      
      loginWindow = $window.open(url, '_blank', 'location=no,toolbar=no,hidden=no');

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
              client_secret: "sk_test_TGVJ5AB4dXa1eaYooQr0MTN8",
              clientID: "ca_7VvNpW0Em2iOnDuxSOHQyygV9PvtAfCs",
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
                  alert("Stripe successfully connected");
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

  $scope.cancelChangeCreditCardInfo = function() {
    if ($state.params.source == "meal")
      $state.go("preapp.meal");
    else
      $state.go("preapp.settings");
    
  }

  $scope.findPastAndPresentOrders = function() {
    /*
      console.log("finding past and present orders");
      var currentDate = new Date();
      console.log("currentDate: " + currentDate + " " + $scope.orders[0].pickupDate);
      for (var order in $scope.orders) {
        //if (order.pickupDate) {
          var currentDate = new Date();
          console.log("currentDate: " + currentDate);
        //}
      }
      */

      var now = new Date();
      
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

    //$ionicScrollDelegate.$getByHandle("scrollArea2").resize();

  }

  $scope.mealClicked = function() {
    console.log("meal clicked");
    $state.go("preapp.meal");
  }

})