// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'starter.controllers', 'starter.services'])

.run(function($ionicPlatform, localStorage) {
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

  })

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
    templateUrl: 'templates/preapp/splash-screen.html'
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
  .state('preapp.chefscreen', {
    url: '/chefscreen',
    templateUrl: 'templates/preapp/chefsignup-screen.html',
    controller: 'LoginCtrl'
      
    
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
    controller: "MealCtrl"
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
