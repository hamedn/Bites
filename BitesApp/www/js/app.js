// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ngCordova','ionic','ionic.service.core', 'ionic.service.analytics', 'angularMoment', 'login.controllers','dashboard.controllers','settings.controllers','mealform.controllers', 'starter.services','splash.controllers'])

.run(function($ionicPlatform, $ionicAnalytics, localStorage) {

  $ionicAnalytics.register();

  ionic.Platform.ready(function(){
    console.log("IONIC PLATFORM READY");
})


  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleLightContent();
    }
    console.log("The platform is ready.");
    // Parse Code
    parsePlugin.initialize("YwSVlKUkmHItIfQAKgMTgNoHQSuvLUUHo8s9mBwH", "LJ4EM4k962Qb3gLOVFy1kTHAyhJx7C9FANcnuWQw", function() {


        if (localStorage.get("push") == null || localStorage.get("push").length == 0 || localStorage.get("push") == "undefined") {
        parsePlugin.subscribe('Bites', function() {
            parsePlugin.getInstallationId(function(id) {


                /**
                 * Now you can construct an object and save it to your own services, or Parse, and corrilate users to parse installations
                 * 
                 var install_data = {
                    installation_id: id,
                    channels: ['SampleChannel']
                 }
                 *
                 */
                 console.log("I have set push to 1");
                 localStorage.set("push","1");

            }, function(e) {
                $ionicPopup.alert({
                    title: 'Server error',
                  });
            });

        }, function(e) {
            $ionicPopup.alert({
                    title: 'Server error',
                  });
        });
        }

    }, function(e) {
       $ionicPopup.alert({
                    title: 'Server error',
                  });
    });



    // To make this work for dev push notifications
    // run 'ionic config set dev_push true' in terminal
    //$ionicPush.init({
    //  "debug": true,
    //  "onNotification": function(notification) {
    //    var payload = notification.payload;
    //    console.log(notification, payload);
    //  },
    //  "onRegister": function(data) {
    //    console.log(data.token);
    //  }
    //});

    //$ionicPush.register();
  });

})

.config(function($stateProvider, $urlRouterProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider


//----------------------PREAPP

  // setup an abstract state for the preapp     
  .state('preapp', {url: '/preapp', abstract: true, templateUrl: 'templates/preapp/preapp.html'
  })



  .state('preapp.splashscreen', {
    url: '/splashscreen',
    templateUrl: 'templates/preapp/splash-screen.html',
    controller:'SplashCtrl'
  })

 .state('preapp.loginscreen', {
    url: '/loginscreen',
    templateUrl: 'templates/preapp/login-screen.html',
    controller: 'LoginCtrl'
      
    
  })
  .state('preapp.registerscreen', {
    url: '/registerscreen',
    templateUrl: 'templates/preapp/register-screen.html',
    controller: 'LoginCtrl'
      
    
  })
   .state('preapp.registerfacebook', {
    url: '/registerfacebook',
    templateUrl: 'templates/preapp/register-facebook.html',
    controller: 'LoginCtrl'
      
    
  })

  .state('preapp.chefscreen', {
    url: '/chefscreen',
    templateUrl: 'templates/preapp/chefsignup-screen.html',
    controller: 'LoginCtrl'
  })

  .state('preapp.stripescreen', {
    url: '/stripescreen',
    templateUrl: 'templates/preapp/stripe-screen.html',
    controller: 'SettingsCtrl',
    params: {source: null}
  })

  .state('preapp.settings', {
    url: '/settings',
    templateUrl: 'templates/preapp/settings-screen.html',
    controller: "SettingsCtrl"
  })

  .state('preapp.myorders', {
    url: '/settings',
    templateUrl: 'templates/preapp/myorders-screen.html',
    controller: "SettingsCtrl"
  })
  
  .state('preapp.dashboard', {
    url: '/dashboard',
    templateUrl: 'templates/preapp/dashboard-screen.html',
    controller: "DashCtrl"
  })

  .state('preapp.newmeal', {
    url: '/newmeal',
    templateUrl: 'templates/preapp/newmeal-screen.html',
    controller: "MealFormCtrl"
  })

  .state('preapp.meal', {
    url: '/meal/{id}',
    templateUrl: 'templates/preapp/meal-screen.html',
    controller: "DashCtrl",
    params: {source: null, sourceId: null}
  })


  .state('preapp.chef', {
    url: '/chef/{id}',
    templateUrl: 'templates/preapp/chef-screen.html',
    controller: "DashCtrl"
  })

  .state('preapp.order', {
    url: '/order',
    templateUrl: 'templates/preapp/order-screen.html',
    controller: "DashCtrl"
  })

  .state('preapp.rating', {
    url: '/rating',
    templateUrl: 'templates/preapp/rating-screen.html',
    controller: "SettingsCtrl"
  })

  .state('preapp.phone', {
    url: '/phone',
    templateUrl: 'templates/preapp/phone-screen.html',
    controller: "SettingsCtrl"
  })
  // setup an abstract state for the tabs directive
    .state('tab', {
    url: '/tab',
    abstract: true,
    templateUrl: 'templates/tabs.html'
  })

  // Each tab has its own nav history stack:

  .state('tab.dash', {
    url: '/dash',
    views: {
      'tab-dash': {
        templateUrl: 'templates/tab-dash.html',
        controller: 'DashCtrl'
      }
    }
  })

  .state('tab.chats', {
      url: '/chats',
      views: {
        'tab-chats': {
          templateUrl: 'templates/tab-chats.html',
          controller: 'ChatsCtrl'
        }
      }
    })
    .state('tab.chat-detail', {
      url: '/chats/:chatId',
      views: {
        'tab-chats': {
          templateUrl: 'templates/chat-detail.html',
          controller: 'ChatDetailCtrl'
        }
      }
    })

  .state('tab.account', {
    url: '/account',
    views: {
      'tab-account': {
        templateUrl: 'templates/tab-account.html',
        controller: 'AccountCtrl'
      }
    }
  });

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/preapp/splashscreen');

});
