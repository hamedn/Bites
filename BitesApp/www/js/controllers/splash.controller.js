angular.module('splash.controllers', ['ionic-ratings','ionic'])

.controller("SplashCtrl", function($scope,$ionicPlatform, $rootScope, $state, $stateParams, localStorage, APIServer, $http, $ionicLoading,$ionicPopup) {
  $scope.$on('$ionicView.enter', function(e) {
    console.log("USER LOGGED IN STATUS: " + localStorage.get("loggedIn"));

  $ionicPlatform.ready(function() {

    setTimeout(function() {
navigator.splashscreen.hide();
    }, 250);


    if(window.Connection) {
      if(navigator.connection.type == Connection.NONE) {
        $ionicPopup.alert({
          title: 'No Internet Connection',
          content: 'Sorry, no Internet connectivity detected. Please reconnect and try again.'
        })
        .then(function(res) {
            ionic.Platform.exitApp();
          
        });
      }
    }
  });



    if (localStorage.get("loggedIn") == "true") {


    //alert(localStorage.get("loggedIn") + "     " + localStorage.get("userToken"))

    	$ionicLoading.show({
	      template: 'Loading'
	    });

console.log('hello world"')

    	var acc = localStorage.get("userToken");


    	

        var startTime = new Date().getTime();
$http({
    url: APIServer.url() + '/users/byToken',
    timeout : 4000, 
    headers:{'accesstoken': acc }
    }).success(function(resp, status, header, config){

      console.log(resp);
      console.log("----------");
        if (resp._id) {

    method: 'GET',
                console.log("ANY LUCK???");

          console.log("TRANSITION TO DASHBOARD");
          $state.go("preapp.dashboard");
         localStorage.set("oid",resp._id);
         localStorage.set("name",resp.name);
         localStorage.set("isChef",resp.isChef);

      }
      else {
        console.log("No response. Must log in again.")
      }
      //alert(resp);
      $ionicLoading.hide();

    }).error(function(result, status, header, config){
        var respTime = new Date().getTime() - startTime;
        if(respTime >= config.timeout){
            //time out handeling
          //  alert('time out');
            $ionicLoading.hide();
            console.log("time out");

        } else{
            //other error hanndling
            $ionicLoading.hide();
                        console.log("other errors");


        }
    })










    

    }
  });

})