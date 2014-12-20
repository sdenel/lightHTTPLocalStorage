'use strict';

var mainApp = angular.module('mainApp', [
	'ngRoute',
	'ngAnimate',
	'localGetSetService',
	'mainAppCtrls'
]);

mainApp.config(['$routeProvider',
	function($routeProvider) {
	$routeProvider
	.when('/garage', {
		templateUrl: 'partials/garage.html',
		controller: 'mainAppCtrlGarage'
	})
	.when('/car/:carId', {
		templateUrl: 'partials/car.html',
		controller: 'mainAppCtrlCar'
	})
	.otherwise({
		redirectTo: '/garage'
	});
}]);


