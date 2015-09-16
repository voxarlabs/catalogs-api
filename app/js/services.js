var spreadsheetServices = angular.module('spreadsheetServices', []);

spreadsheetServices.service('Sheet', [
	function($rootScope){
		return {
			all: function(id, callback){
				Tabletop.init({
		          key: id,
		          simpleSheet: true,
		          debug: true,
		          prettyColumnNames: false,
		          callback: function(data, tabletop) {
		          	console.log("[SpreadsheetService] " + data.length + " items loaded.");
			        callback(data, tabletop);
		          }
		        });
			}
		}
	}
]);