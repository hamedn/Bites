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


    	//alert(localStorage.get("loggedIn") + "     " + localStorage.get("userToken"))
    	 $http.get(APIServer.url() + '/users/byToken',{headers:{'accesstoken': acc }}).then(function(resp) {
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


		 });

    

    }
  });

})