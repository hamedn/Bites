angular.module('mealform.controllers', ['ionic-ratings','jrCrop'])


.controller('MealFormCtrl', function($scope,$ionicLoading, $window, $location, $http, APIServer,localStorage, Camera, $state, $jrCrop, $cordovaFileTransfer) {
  $scope.data = {};
  
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
        userName: localStorage.get("name")

      }
    }).then(function (response) {
        $ionicLoading.hide();
        console.log(response);
        

        if ($scope.photo != null && $scope.photo.length > 1) {
          $ionicLoading.show({
            template: 'Uploading photo'
          });
        }



        $cordovaFileTransfer.upload(APIServer.url() + "/meals/uploadPicture/" + response.id, $scope.photo, {}).then(function(result) {
          alert("Meal successfully posted");
          $ionicLoading.hide();
           $state.go("preapp.dashboard");



        }, function(err) {
          $ionicLoading.hide();
          alert("Server error");
            console.log("ERROR: " + JSON.stringify(err));
        }, function (progress) {
            // constant progress updates
        });




    })


     

  }


})