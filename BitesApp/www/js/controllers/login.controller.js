angular.module('login.controllers', ['ionic-ratings'])

// Work on the Following, Need to get the Post Requests
// Up and runnin

//.controller('MealCtrl', function($scope, $window, $location, $http, APIServer, $state) {



.controller('LoginCtrl', function($scope, $window, $location, $http, APIServer, $state, localStorage) {
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

  $scope.registerLocal = function () {

    if ($scope.data.password == $scope.data.confirm && $scope.data.agreedToTerms == true) {
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
            email: $scope.data.email,
            password: $scope.data.password,
            isChef: $scope.data.chef,
            chefStripeToken: localStorage.get("stripeAccessToken"),
            // COMMENTED OUT FOR CURRENT USE
            //customerStripeId: $scope.data.customerID
          }
      }).then (function (response) {

          console.log(response.data);

          if (response.data.accessToken) {
            alert("Login Successful!!!!");
            localStorage.set("loggedIn",true);
            localStorage.set("userToken", response.data.accessToken);
            // kick off the platform web client
            Ionic.io();
            // this will give you a fresh user or the previously saved 'current user'
            var user = Ionic.User.current();
            // if the user doesn't have an id, you'll need to give it one.
            if (!user.id) {
              user.id = response.data.oid;
              // user.id = 'your-custom-user-id';
            }
            //persist the user
            var push = new Ionic.Push();

            var callback = function(pushToken) {
              console.log("Registered Token: ", pushToken.token);
              user.addPushToken(pushToken);
              localStorage.set("token", pushToken);
              user.save();
            }
            push.register(callback);

            console.log(response.data);
            $state.go("preapp.stripeScreen"); 

          }
          else {
            alert(response.data.message);
          }

      })

    
  }

  else if ($scope.data.agreedToTerms == false || typeof $scope.data.agreedToTerms == "undefined") {
    alert("Must Agree to Terms of Service");
  }
  else {
    alert("Passwords don't match!")
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
          email: $scope.data.email,
          password: $scope.data.password
        }
    }).then (function (response) {
        console.log(response.data);

         if (response.data.accessToken) {
          alert("Login Successful!!!!");
          localStorage.set("userToken", response.data.accessToken);
          localStorage.set("loggedIn",true);
          $state.go("preapp.dashboard");
        }
        else {
          alert(response.data.message);
        }


    })
  }

  $scope.loginFacebook = function() {



    url = APIServer.url() + '/auth/facebook';
        loginWindow = $window.open(url, '_blank', 'location=no,toolbar=no,hidden=no');

        loginWindow.addEventListener('loadstart', function (event) {
          hasToken = event.url.indexOf('?oauth_token=');
          if(hasToken > -1) {
            token = event.url.match("oauth_token=(.*)")[1];
            loginWindow.close();
            $location.path('/');
            localStorage.set("userToken", token);
             localStorage.set("loggedIn",true);
            $state.go("preapp.dashboard");

            //Logged in, change screen and pass token in
          }
        })

  }

  $scope.registerFacebook = function() {



    url = APIServer.url() + '/auth/facebook';
    console.log(url);
        loginWindow = $window.open(url, '_blank', 'location=no,toolbar=no,hidden=no');

        loginWindow.addEventListener('loadstart', function (event) {

          console.log("user finished with facebook login");

          hasToken = event.url.indexOf('?oauth_token=');
          if(hasToken > -1) {
            token = event.url.match("oauth_token=(.*)")[1];
            loginWindow.close();
            $location.path('/');
            localStorage.set("userToken", token);
            localStorage.set("loggedIn",true);
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
          isChef: $scope.data.chef
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