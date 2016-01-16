angular.module('splash.controllers', ['ionic-ratings'])

.controller("SplashCtrl", function($scope, $rootScope, $state, $stateParams, localStorage, APIServer, $http, $ionicLoading) {
  $scope.$on('$ionicView.enter', function(e) {
    console.log("USER LOGGED IN STATUS: " + localStorage.get("loggedIn"));

    if (localStorage.get("loggedIn") == "true") {


    //alert(localStorage.get("loggedIn") + "     " + localStorage.get("userToken"))

    	$ionicLoading.show({
	      template: 'Loading'
	    });

console.log('hello workd"')

    	var acc = localStorage.get("userToken");


    	

        var startTime = new Date().getTime();
$http({
    method: 'GET',
    url: APIServer.url() + '/users/byToken',
    timeout : 4000, 
    headers:{'accesstoken': acc }
    }).success(function(resp, status, header, config){
        if (resp.data && resp.data._id) {
          console.log("TRANSITION TO DASHBOARD");
          $state.go("preapp.dashboard");
         localStorage.set("oid",resp.data._id);
         localStorage.set("name",resp.data.name);
         localStorage.set("isChef",resp.data.isChef);

      }
      else {
        "No response. Must log in again."
      }
      //alert(resp);
      $ionicLoading.hide();

    }).error(function(result, status, header, config){
        var respTime = new Date().getTime() - startTime;
        if(respTime >= config.timeout){
            //time out handeling
          //  alert('time out');
            $ionicLoading.hide();

        } else{
            //other error hanndling
            $ionicLoading.hide();

        }
    })










    

    }
  });

})