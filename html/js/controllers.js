'use strict';

/* Controllers */

var mainAppCtrls = angular.module('mainAppCtrls', []);

mainAppCtrls.controller('mainAppCtrlGarage', ['$scope', 'localGetSet', '$location', '$timeout',
	function($scope, localGetSet, $location, $timeout) {
		$scope.garageLoaded = false;
		$scope.selected = [];

		$scope.deleteLayerMultiple = function() {
			var selectedCars = [];
			var list = [];
			angular.forEach($scope.selected, function(value, key) { if(value == true) {
				//console.log($scope.garage[key]);
				list.push($scope.garage[key].uniqueId);
			}});
			deleteCarsWithConfirm(list);
		};

		$scope.deleteLayerSingle = function(garageIndex, uniqueId) {
			deleteCarsWithConfirm([uniqueId]);
		};
		function deleteCarsWithConfirm(vecCars) {
			var msg="";
			if(vecCars.length == 1) {
				msg = 'Do you really want to delete this car?'
			}
			else {
				msg = 'Do you really want to delete these cars?';
			}
			angular.forEach(vecCars, function(value, key) {
				var uniqueId = value; var garageIndex = undefined;
				// Retrieving garage id
				for(var i = 0, I = $scope.garage.length; i < I; i+= 1) {
					if($scope.garage[i].uniqueId == uniqueId) {
						garageIndex = i;
						break;
					}
				}

				msg += "<br />- "+$scope.garage[garageIndex].brandName+" "+$scope.garage[garageIndex].name
			});
			bootbox.confirm(msg, function(result) { if(result == true) {
				//console.log(vecCars);
				deleteCars(vecCars);
			}});
		}
		function deleteCars(vecCars) {
			/*
			 * each vector element should contain uniqueId
			 */
			angular.forEach(vecCars, function(value, key) {
				var uniqueId = value; var garageIndex = undefined;

				// Retrieving garage id
				for(var i = 0, I = $scope.garage.length; i < I; i+= 1) {
					if($scope.garage[i].uniqueId == uniqueId) {
						garageIndex = i;
						break;
					}
				}
				//console.log(garageIndex);
				//console.log($scope.garage);
				//console.log([garageIndex, uniqueId]);
				if($scope.garage[garageIndex].thumbnail != false) {
					localGetSet.delete('cars/thumbnails/'+String(uniqueId)+'.png');
				}
				$scope.garage.splice(garageIndex, 1);
				angular.forEach($scope.garage, function(value, key) {
					if($scope.garage[key].thumbnail != false) {
						$scope.garage[key].thumbnail = true;
					}
				});
				localGetSet.set('garage.json', $scope.garage, function(garage) {
					//console.log(garage);
				});
				localGetSet.delete('cars/'+String(uniqueId)+'.json');
			});
			resetGarage();
		}
		function resetGarage() {
			localGetSet.get('garage.json', function(data) {
				//console.log("[Getting the garage...]")
				$scope.selected = [];
				$scope.garage = data;
				angular.forEach($scope.garage, function(value, key) {
					if(value.thumbnail == true) {
						$scope.garage[key].thumbnail = 'http://'+document.location.host+'/data/cars/thumbnails/'+value.uniqueId+'.png?' + new Date().getTime();
						//console.log($scope.garage[key])
					}
					$scope.selected.push(false);
				});
				$scope.garageLoaded = true;
			});
		}
		resetGarage();

		$scope.goTo = function ( path ) {
			// Trick from http://stackoverflow.com/questions/14201753/angular-js-how-when-to-use-ng-click-to-call-a-route
			$location.path( path );
		};
		
		$scope.isOdd = function(id) {
			return (id%2==1);
		}

		$scope.$watch('selected', function() {
			$scope.isSelectionEmpty = !$scope.selected.some(Boolean);
		}, true);

	}
]);

mainAppCtrls.controller('mainAppCtrlCar', ['$scope', 'localGetSet', '$routeParams', '$location',
	function($scope, localGetSet, $routeParams, $location) {
		$scope.carId = $routeParams.carId;
		$scope.newThumbnailEdited = undefined; /* Define if a new thumbnail has been uploaded. */
		$scope.isThumbnailEdit = undefined; /* Define if there is a thumbnail in the form (new, or already there) */
		$scope.detailFields = [
			{
				fieldName: 'brandName',
				displayedName: 'Brand Name',
				pristineDesc: 'New car brand name',
				options: ['required']
			},
			{
				fieldName: 'name',
				displayedName: 'Name',
				pristineDesc: 'New car name',
				options: ['required']
			},
			{
				fieldName: 'color',
				displayedName: 'Color',
				pristineDesc: 'New car color',
				options: []
			},
			{
				fieldName: 'length',
				displayedName: 'Length',
				pristineDesc: 'New car length, in mm (ex: "4,976 mm")',
				options: []
			},
			{
				fieldName: 'width',
				displayedName: 'Color',
				pristineDesc: 'New car width, in mm (ex: "1,963 mm")',
				options: []
			},
			{
				fieldName: 'height',
				displayedName: 'Height',
				pristineDesc: 'New car height, in mm (ex: "1,435 mm")',
				options: []
			},
		];

		$scope.resetForm = function() {
			$scope.carEdited = JSON.parse(JSON.stringify($scope.car)) // clone

			if($scope.car.thumbnail == true) {
				$scope.isThumbnailEdit = true;
				$('#thumbnailEdit').attr('src', 'http://'+document.location.host+'/data/cars/thumbnails/'+$scope.car.uniqueId+'.png?' + new Date().getTime());
			}
			$scope.thumbnailEdited = false;
		}

		var resetAll = function() {
			/*
			 * Called at bootstrap, but also after a form validation. Set as a variable as it requires $scope.resetForm to be set. (hoisting)
			 */
			//console.log('[In resetAll()]')
			$scope.newThumbnailEdited = false;
			if($routeParams.carId > 0) {
				$scope.editMode = false;
				localGetSet.get('cars/'+$routeParams.carId+'.json', function(data) {
					$scope.carLoaded = true;
					$scope.car = data;
					$scope.resetForm();
					if($scope.car.thumbnail == true) {
						$('#thumbnailNoEdit').attr('src', 'http://'+document.location.host+'/data/cars/thumbnails/'+$scope.car.uniqueId+'.png?' + new Date().getTime());
					}
				});
			}
			else {
				$scope.editMode = true;
				$scope.car = {};
				$scope.resetForm();
			}
		}
		resetAll();
		



		$scope.save = function() {
			/*
			 * Called when saving the form
			 */
			var wasNewCar = ($scope.carId == 0) ? true : false;

			
			if($scope.isThumbnailEdit == true) {
				$scope.carEdited.thumbnail = true;
			}
			else {
				$scope.carEdited.thumbnail = false;
			}

			/*
			 * Get garage and set carId if 0
			 */
			localGetSet.get('garage.json', function(garage) {
				//console.log(garage);
				if($scope.carId == 0) {
					
					var garageLastElemem = garage.slice(-1)
					if(garageLastElemem.length == 1) {
						$scope.carId = parseInt(garageLastElemem[0].uniqueId)+ 1;
					}
					else {
						$scope.carId = 1;
					}
					garage.push({"uniqueId": $scope.carId});
				}
				else {
					//console.log($scope.car.thumbnail, $scope.isThumbnailEdit)
					if($scope.car.thumbnail == true && $scope.isThumbnailEdit == false) {
						/*
						 * There was a thumbnail, there is not anymore. We should remove it from disk.
						 */
						localGetSet.delete('cars/thumbnails/'+String($scope.carId)+'.png');
					}
				}

				$scope.carEdited.uniqueId = $scope.carId;
				var restrictedDesc ={
					"brandName": $scope.carEdited.brandName,
					"name": $scope.carEdited.name,
					"thumbnail": $scope.carEdited.thumbnail,
					"uniqueId": $scope.carEdited.uniqueId
				}
				//console.log(garage);
				for(var i = 0, I = garage.length; i < I; i+= 1) {
					if(garage[i].uniqueId == $scope.carId) {
						garage[i] = JSON.parse(JSON.stringify(restrictedDesc))
						break;
					}
				}
				localGetSet.set('garage.json', garage, function(garage) {
					//console.log(garage);
				});

				localGetSet.set('cars/'+String($scope.carId)+'.json', $scope.carEdited, function(car) {
					// Change adress if it was a new car
					if(wasNewCar) {
						$location.path('/car/'+$scope.carId);
					}
					else {
						resetAll();
					}
				});
				if($scope.newThumbnailEdited == true) {
					$scope.isThumbnailEdit = true;
					$scope.editCanvas.toBlob(function(blob) {
						//console.log(blob);
						localGetSet.set('cars/thumbnails/'+String($scope.carId)+'.png', blob, function(garage) {
							//console.log(blob);
						});
					});
				}
				else {
					$scope.isThumbnailEdit = false;
				}
				
				
			});
			$scope.editMode = false;
		}



		$scope.readURL = function(input) {
			/*
			 * Called when loading a new thumbnail image
			 */
			var file = input.files[0];
			var reader = new FileReader();
			reader.onloadend = function() {

				var finalCanvasSize = 100;
				var bilinearFactor = 4;
				var tempCanvasSize = finalCanvasSize*bilinearFactor;

				// shrink image
				var image = document.createElement('img');
				image.src = reader.result;
				$('#blah0').attr('src', reader.result);
				image.onload = function() {
					/*
					 * This algorithm is a trick to avoid pixelized pictures: canvas drawImage is not satisfactory by itself.
					 * So the last step is to get the thumbnail by bilinearizing the input picture.
					 */
					var tempCanvas  = document.createElement('canvas');
					var finalCanvas = document.createElement('canvas');
					//console.log(tempCanvas)

					tempCanvas.width = tempCanvas.height = tempCanvasSize;
					finalCanvas.width = finalCanvas.height = finalCanvasSize;
					var wD, hD;
					if(image.width > image.height) {
						wD = tempCanvasSize*image.width/image.height;
						hD = tempCanvasSize;
					}
					else {
						wD = tempCanvasSize;
						hD = tempCanvasSize*image.height/image.width;
					}
					var tempCtx = tempCanvas.getContext('2d');
					var finalCtx = finalCanvas.getContext('2d');
					tempCtx.drawImage(image, 0, 0, wD, hD);

					var tempD  = tempCtx.getImageData(0, 0, tempCanvasSize, tempCanvasSize);

					var finalD = finalCtx.getImageData(0, 0, finalCanvasSize, finalCanvasSize);


					for(var y=0; y<finalCanvasSize; y+=1) {
						for(var x=0; x<finalCanvasSize; x+=1) {
							for(var c = 0; c < 4; c+=1) {
								var sumP = 0;
								for(var i = 0; i < bilinearFactor; i+=1) {
									for(var j = 0; j < bilinearFactor; j+=1) {
										sumP += tempD.data[4*(	(bilinearFactor*y+i) * tempCanvasSize + (bilinearFactor*x+j) ) + c];
									}
								}
								sumP /= bilinearFactor*bilinearFactor;
								finalD.data[4*(y*finalCanvasSize+x)+c] = sumP;
							}
						}
					}

					finalCtx.putImageData(finalD, 0, 0);

					var shrinked = finalCanvas.toDataURL('image/jpeg');

					$('#thumbnailEdit').attr('src', shrinked);
					$scope.isThumbnailEdit = true;
			
					$scope.editCanvas = finalCanvas;
					$scope.newThumbnailEdited = true;
					$scope.$apply(function() { $scope.isThumbnailEdit = true; });
			
				};
			};

			reader.readAsDataURL(file); // convert file to base64*/
		}

		$scope.removeThumbnail = function() {
			$scope.isThumbnailEdit = false;
			$('#thumbnailEdit').attr('src', '')
		}

		$(window).keypress(function(event) {
			/*
			 * Capture Ctrl+S: from http://stackoverflow.com/questions/93695/best-cross-browser-method-to-capture-ctrls-with-jquery
			 */
			if (!(event.which == 115 && event.ctrlKey) && !(event.which == 19)) return true;
			if($scope.editMode == true) {
				$scope.save();
				event.preventDefault();
				return false;
			}
		});
	
	}
]);
