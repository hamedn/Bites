angular.module('login.controllers', ['ionic-ratings'])

// Work on the Following, Need to get the Post Requests
// Up and runnin

//.controller('MealCtrl', function($scope, $window, $location, $http, APIServer, $state) {



.controller('LoginCtrl', function($scope, $window, $ionicAnalytics, $location, $http, APIServer, $state, localStorage, $timeout, $ionicPopup) {
   $scope.data = {};

    document.addEventListener("deviceready", onDeviceReady, false);
    function onDeviceReady() {
        window.open = cordova.InAppBrowser.open;
    }

  $scope.registerStripe = function () {
    console.log($scope.data.cardNumber);
    $http({
          method: 'POST',
          url: APIServer.url() + '/saveStripeCardDetails',
          headers: {'Content-Type': 'application/x-www-form-urlencoded'},

          transformRequest: function(obj) {
            var str = [];
            for(var p in obj)
            str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
            return str.join("&");
          },

          data:  {
            cardNumber: $scope.data.cardNumber,
            cvc: $scope.data.CVC,
            exp_month: $scope.data.exp_month,
            exp_year: $scope.data.exp_year
          }
            
          }).then (function (response) {
            console.log(response);
            $state.go("preapp.dashboard");
          });
  }

  $scope.checkEmail = function(email) {
    // columbia.edu, barnard.edu
    var university = email.substring(email.length - 12, email.length).toLowerCase();
    console.log("Console Uni: " + university);
    if (university == "columbia.edu") {
      return true;
    } else if (university == "@barnard.edu") {
      return true;
    } else {
      return false;
    }
  }

  $scope.checkPhone = function(phone) {
    console.log("phone.length " + phone.length);
    if (phone.length <= 15 && phone.length >= 7)
      return true;
    else 
      return false;
  }

  $scope.registerLocal = function () {

    if ($scope.data.password == $scope.data.confirm && $scope.data.agreedToTerms == true && $scope.checkEmail($scope.data.email) == true && $scope.checkPhone($scope.data.phone)) {
      if (typeof $scope.data.chef == "undefined")
        $scope.data.chef = false;      
      $http({
          method: 'POST',
          url: APIServer.url() + '/signup',
          headers: {'Content-Type': 'application/x-www-form-urlencoded'},

          transformRequest: function(obj) {
              var str = [];
              for(var p in obj)
              str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
              return str.join("&");
          },

          data:  {
            name: $scope.data.realname,
            email: $scope.data.email.toLowerCase(),
            password: $scope.data.password,
            phone: $scope.data.phone,
            isChef: $scope.data.chef,
            chefStripeToken: localStorage.get("stripeAccessToken"),
            // COMMENTED OUT FOR CURRENT USE
            //customerStripeId: $scope.data.customerID
          }
      }).then (function (response) {

          console.log(response.data);

          if (response.data.accessToken) {
           
            $ionicAnalytics.track("Local User Created", {
              user: {
                name: response.data.oid,
                email: $scope.data.email,
                isChef: $scope.data.chef
              }
            });
           
           //welcome popup
           var myPopup = $ionicPopup.show({
              //template: "<div style='text-align: center;'>Welcome to Bites!</div>",
              title: "Welcome to Bites",
              scope: $scope
            });

            $timeout(function() {
              myPopup.close(); //close the popup after 3 seconds for some reason
            }, 2500);

            localStorage.set("loggedIn",true);
            localStorage.set("userToken", response.data.accessToken);

            //send email
            $scope.sendEmail($scope.data.email.toLowerCase(), $scope.data.realname);

            $state.go("preapp.dashboard");
          }
          else {
            alert(response.data.message);
          }

      })

  }

  else if ($scope.data.agreedToTerms == false || typeof $scope.data.agreedToTerms == "undefined") {
    var myPopup = $ionicPopup.show({
      title: "Must Agree to Terms of Service",
      scope: $scope
    });

    $timeout(function() {
      myPopup.close(); 
    }, 1250);

  }

  else if ($scope.checkEmail($scope.data.email) == false) {
    var myPopup = $ionicPopup.show({
      title: "Your email must be a valid Columbia or Barnard email address.",
      scope: $scope
    });

    $timeout(function() {
      myPopup.close(); 
    }, 1250);  
  }

  else if ($scope.checkPhone($scope.data.email) == false) {
     var myPopup = $ionicPopup.show({
      title: "Not a valid phone number.",
      scope: $scope
    });

    $timeout(function() {
      myPopup.close(); 
    }, 1250); 
  }

  else {
    var myPopup = $ionicPopup.show({
      title: "Passwords don't match!",
      scope: $scope
    });

    $timeout(function() {
      myPopup.close(); 
    }, 1250);
  }
}
  //adjust form stuff
  $scope.stripeResponseHandler = function(status, response) {
      console.log("in stripeResponseHandler");
      if (response.error) {
        console.log(response.error);
      } else {
        console.log("no response error");
        // response contains id and bank_account, which contains additional bank account details
        var token = response.id;
      }
  }

  $scope.sendEmail = function(email, name) {
    console.log("sending email");
    $http({
        method: 'POST',
        url: APIServer.url() + '/sendEmail',
        headers: {'Content-Type': 'application/x-www-form-urlencoded'},

        transformRequest: function(obj) {
            var str = [];
            for(var p in obj)
            str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
            return str.join("&");
        },

        data:  {
          email: email,
          name: name
        }
    }).then (function (response) {
        console.log(response.data);

         if (response.data.accessToken) {
          $ionicAnalytics.track("User Login", {
            user: {
              id: response.data.oid,
              email: $scope.data.email
            }
          });
        }
    });
  }

  $scope.loginLocal = function () {

    $http({
        method: 'POST',
        url: APIServer.url() + '/login',
        headers: {'Content-Type': 'application/x-www-form-urlencoded'},

        transformRequest: function(obj) {
            var str = [];
            for(var p in obj)
            str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
            return str.join("&");
        },

        data:  {
          email: $scope.data.email.toLowerCase(),
          password: $scope.data.password
        }
    }).then (function (response) {
        console.log(response.data);

         if (response.data.accessToken) {
          $ionicAnalytics.track("User Login", {
            user: {
              id: response.data.oid,
              email: $scope.data.email
            }
          });

          /*
          Popup should only happen the first time, after that it become unprofessional. 
            var myPopup = $ionicPopup.show({
              template: "<h2>Welcome to Bites!</h2>",
              title: "Login Successful!!!",
              scope: $scope
            });

            $timeout(function() {
              myPopup.close(); //close the popup after 3 seconds for some reason
            }, 1000);*/
          localStorage.set("userToken", response.data.accessToken);
          localStorage.set("loggedIn",true);
          $state.go("preapp.dashboard");
        }
        else {
          var myPopup = $ionicPopup.show({
              title: "Sorry, no user found with that email.",
              scope: $scope
          });

          $timeout(function() {
            myPopup.close(); //close the popup after 3 seconds for some reason
          }, 2500);
        }


    })
  }

  $scope.loginFacebook = function() {



    url = APIServer.url() + '/auth/facebook';
        loginWindow = $window.open(url, '_blank', 'location=yes,toolbar=yes,hidden=no');

        loginWindow.addEventListener('loadstart', function (event) {
          hasToken = event.url.indexOf('?oauth_token=');
          if(hasToken > -1) {
            token = event.url.match("oauth_token=(.*)")[1];
            loginWindow.close();
            $location.path('/');
            localStorage.set("userToken", token);
             localStorage.set("loggedIn",true);
            $ionicAnalytics.track("Facebook Login", {
              user: {
                name: "PLACEHOLDER"
              }
            });
            $state.go("preapp.dashboard");

            //Logged in, change screen and pass token in
          }
        })

  }

  $scope.registerFacebook = function() {



    url = APIServer.url() + '/auth/facebook';
    console.log(url);
        loginWindow = $window.open(url, '_blank', 'location=yes,toolbar=yes,hidden=no');

        loginWindow.addEventListener('loadstart', function (event) {

          console.log("user finished with facebook login");

          hasToken = event.url.indexOf('?oauth_token=');
          if(hasToken > -1) {
            token = event.url.match("oauth_token=(.*)")[1];
            loginWindow.close();
            $location.path('/');
            localStorage.set("userToken", token);
            localStorage.set("loggedIn",true);

            $ionicAnalytics.track("Facebook Register", {
              user: {
                name: "PLACEHOLDER"
              }
            });

            $state.go("preapp.registerfacebook");

            //Logged in, change screen and pass token in
          }
        })

  }

  $scope.goDash = function() {
    $state.go("preapp.dashboard");
  }

  $scope.facebookFinish = function() {

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
          isChef: $scope.data.chef,
          phone: $scope.data.phone
        }
    }).then (function (response) {

      if (response.data == "success") {
        
          $state.go("preapp.dashboard");
      }
      else {
        alert("error connecting to server");
      }



    })


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
                grant_type: "authorization_code"
              }
              
            }).then( function (body) {
                /*NO ERROR CHECKING BUILT IN YET */
                console.log("successfully posted code to stripe");
                var accessToken = angular.fromJson(body).data.access_token;
                console.log(accessToken);
                localStorage.set("stripeAccessToken", accessToken);
                loginWindow.close();
              })
          
          } 
        })

  }




})