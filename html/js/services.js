'use strict';

/* Services */

var localGetSetService = angular.module('localGetSetService', []);

localGetSetService.service('localGetSet', ['$http',
  function($http){
	this.get = function(nameOnDisk, callback) {
		$http.get('http://'+document.location.host+'/data/'+nameOnDisk).success(function(data, status, headers) {
			if(String(data).indexOf('lightHTTPLocalStorage error: ') == 0) return this.error(data, status, headers, config);
			if(callback != undefined) callback(data);
		}).error(function(data, status) {
			alert('Error while loading variable. Server answered: '+data);
		});
	};

	this.delete = function(nameOnDisk) {
		this.get(nameOnDisk+'?delete');
	};

	this.set = function(nameOnDisk, variable, callback) {
		if(variable instanceof Blob) {
			//console.log('instanceof Blob!');
			var xhr = new XMLHttpRequest();
			xhr.open('POST', 'http://'+document.location.host+'/data/'+nameOnDisk, true);
			xhr.onreadystatechange=function() {
				if(callback != undefined) callback(xhr.responseText);
			};
			xhr.send(variable);
		}
		else {
			var dataSent;
			//console.log(variable);
			if(variable instanceof Object) {
				dataSent = angular.toJson(JSON.parse(JSON.stringify(variable)), true);
				//console.log(dataSent);
			}
			else {
				dataSent = variable;
			}
			$http.post(
				'http://'+document.location.host+'/data/'+nameOnDisk,
				{'data': dataSent}
			)
			.success(function(data, status, headers) {
				if(String(data).indexOf('lightHTTPLocalStorage error: ') == 0) return this.error(data, status, headers, config);
				callback(data);
			}).error(function(data, status) {
				alert('Error while saving variable. Server answered: '+String(data));
			});
		}
	};
//		$http.post('http://localhost:8080/data/garage', {'data':angular.toJson($scope.garage,true)}).error(function(data, status) {
//			alert('Error while saving variable. Server answered: '+data);
//		});
  }]);



/*

*/
