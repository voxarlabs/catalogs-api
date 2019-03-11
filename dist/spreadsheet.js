var spreadsheetApp = angular.module('spreadsheetApp', [
	'spreadsheetServices', 
	'angular.filter'
]);
spreadsheetApp.controller('ItemsListCtrl', ['Sheet', '$scope', '$filter', 'config',
	function(sheet, $scope, $filter, config){

		$scope.items = [];

		$scope.filteredItems = [];

		$scope.schema = {};

		$scope.schemaList = [];

		$scope.columns = [];

		$scope.criteria = {};

		$scope.sorting = '';

		$scope.sortingReverse = false;

		$scope.currentPage = 1;

		$scope.itemsPerPage = config.itemsPerPage;

		sheet.all(config.spreadsheetId, function(data, tabletop){
			$scope.$apply(function(){

				var schemasRow = data[0]; // Row with column configuration

				data = data.slice(1); // Rest of the data

				$scope.schema = parseSchemas(schemasRow, data);

				$scope.schemaList = toList($scope.schema);

				for(var i in $scope.schema){
					if($scope.schema[i]['sortable']){
						$scope.sorting = $scope.schema[i];
						break;
					}
				}

				$scope.items = parseData(data, $scope.schema);

				$scope.filteredItems = $scope.items;

				$scope.updateColumns();

			});
		})

		$scope.doFilter = function doFilter(){
			$scope.filteredItems = $scope.items;
			for(var i in $scope.schema){
				var schema = $scope.schema[i];
				var filter = schema.filter;

				if(filter.input == 'text-field'){
					var pattern = {};
					pattern[schema.field] = $scope.criteria[schema.field];
					$scope.filteredItems = $filter('filter')($scope.filteredItems, pattern);
				}else if(filter.input == 'select' || filter.input == 'checkbox' || filter.input == 'radio'){
					if($scope.criteria[schema.field] && $scope.criteria[schema.field].length > 0)
						$scope.filteredItems = $filter('inArray')($scope.filteredItems, $scope.criteria[schema.field], schema.field);
				}else if(filter.input == 'tag'){
					if($scope.criteria[schema.field] && $scope.criteria[schema.field].length > 0)
						$scope.filteredItems = $filter('inArrayTag')($scope.filteredItems, $scope.criteria[schema.field], schema.field);
				}
			}

			$scope.currentPage = 1;

		}


		$scope.doSort = function doSort(field){
			$scope.sorting = $scope.schema[field];
			$scope.filteredItems = $filter('orderBy')($scope.filteredItems, field, $scope.sortingReverse);

			$scope.currentPage = 1;
			$scope.updatePaging();
		}

		$scope.setSortReverse = function setSortReverse(reverse){
			$scope.sortingReverse = reverse;
			$scope.doSort($scope.sorting.field);
		}

		$scope.clearFilter = function clearFilter(){
			$scope.criteria = {};
			$scope.doFilter();
		}

		$scope.updatePaging = function updatePaging(){
			var begin = (($scope.currentPage - 1) * $scope.itemsPerPage);
		    var end = begin + $scope.itemsPerPage;

		    $scope.pageItems = $scope.filteredItems.slice(begin, end);
		}

		$scope.$watch("currentPage + filteredItems.length", $scope.updatePaging);

		$scope.updateColumns = function updateColumns(){
			$scope.columns = [];
			for(var key in $scope.schema){
				if($scope.schema[key].visibility)
					$scope.columns.push(key);
			}
		}

}]);
spreadsheetApp.directive("youtubeVideo", function($compile){
	return {
		restrict: "E",
		scope: {
			width: '=',
			height: '=',
			videoId: '='
		},
      	link: function(scope, elem, attrs){
  			var html = '<iframe type="text/html" width="' + scope.width + '" height="' + scope.height + '" allowfullscreen=""' +
          'src="http://www.youtube.com/embed/' + scope.videoId +'?autoplay=0&autohide=1&showinfo=0" frameborder="0"/>';
	        elem.replaceWith(html);
		}
	}
});
spreadsheetApp.filter('inArray', function($filter){

    return function(list, available, field){
        if(available){
            return $filter("filter")(list, function(item){
                if(item[field].constructor == Array){ // if its an array, then we have multiple items to search
                    for(var i in item[field]){
                        if(available.indexOf(item[field][i]) != -1) return true;
                    } 
                }else{
                    return available.indexOf(item[field]) != -1;
                }
            });
        }else{
            return list;
        }
    }

});

spreadsheetApp.filter('inArrayTag', function($filter){

    return function(list, available, field){
        if(available){
            return $filter("filter")(list, function(item){

                if(item[field].constructor == Array){
                    for(var i in available){
                        for(var j in item[field]){
                            if(item[field][i].indexOf(available[i]) != -1) return true;
                        } 
                    }
                }else{
                    for(var i in available){
                        if(item[field].indexOf(available[i]) != -1) return true;
                    }
                }
                
                return false;
            });
        }else{
            return list;
        }
    }

});

spreadsheetApp.filter('joinBy', function () {
    return function (input,delimiter) {
        if(input.constructor == Array){
            return (input || []).join(delimiter || ',');
        }else{
            return input;
        }
    };
});
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
function getUniqueOptions(data, column, separator){
	var seen = {};
	var options = []
	for(var x in data){
		var split = [data[x][column]];
		if(separator){
			split = data[x][column].split(separator);
		}
		for(var s in split){
			var value = split[s].trim();
			if(!seen.hasOwnProperty(value) && value != "-"){
				options.push(value);
				seen[value] = true;
			}
		}
		
	}
	return options;
}

function toList(dict){
	var list  = [];
	for (var i in dict){
		list.push(dict[i]);
	}
	return list;
}

function parseSchemas(schemasRow, data){
	var schemas = {};
	for(var col in schemasRow){
		if(col != 'rowNumber')
			schemas[col] = parseSchema(col, schemasRow[col], data);;
	}
	return schemas;
}

function parseSchema(name, str, data){

	var schema = {
		field:name, 
		name: name,  
		type: 'text',
		visibility: true,
		shown: true,
		filterable: false, 
		sortable: false,
		title: false,
		video: false,
		image: false,
		separator: null,
		filter: {
			placeholder: name,
			input: 'text-field',
			options: []
		} 
	};

	if(!str || str.length == 0) return schema;

	var split = str.split(/(\;)(?=(?:[^\)]|\([^\)]*\))*$)/);

	for(var i in split){ // Search for separator first
		var s = split[i];
		if(s.indexOf("Separator") > -1){
			schema['separator'] = s.substring(s.indexOf("(")+1, s.lastIndexOf(")"));
		}
	}

	for(var i in split){
		
		var s = split[i];

		if(s == ';') continue;

		if(s.indexOf("Type") > -1 && s.indexOf("(") > s.indexOf("Type")){
			schema['type'] = s.substring(s.indexOf("(")+1, s.lastIndexOf(")")).toLowerCase();
			continue;
		}

		if(s.indexOf("Name") > -1){
			schema['name'] = s.substring(s.indexOf("(")+1, s.lastIndexOf(")"));
			continue;
		}

		if(s.indexOf("Placeholder") > -1){
			schema['filter']['placeholder'] = s.substring(s.indexOf("(")+1, s.lastIndexOf(")"));
			continue;
		}

		if(s.indexOf("Filterable") > -1){
			schema['filterable'] = true;
			schema['filter']['input'] = s.substring(s.indexOf("(")+1, s.lastIndexOf(")"));
			if(schema['filter']['input'] == 'select' || schema['filter']['input'] == 'checkbox' || schema['filter']['input'] == 'tag' || schema['filter']['input'] == 'radio'){
				schema['filter']['options'] = getUniqueOptions(data, name, schema['separator']);
			}
			continue;
		}

		if(s.indexOf("Video") > -1){
			schema['video'] = true;
			continue;
		}

		if(s.indexOf("Image") > -1){
			schema['image'] = true;
			continue;
		}

		if(s.indexOf("Title") > -1){
			schema['title'] = true;
			continue;
		}

		if(s.indexOf("Hidden") > -1){
			schema['visibility'] = false;
			schema['shown'] = false;
			continue;
		}

		if(s.indexOf("Sortable") > -1){
			schema['sortable'] = true;
			continue;
		}

	}
	return schema;
}

function parseData(data, schema){
	for(var s in schema){
		var field = schema[s].field;
		var separator = schema[s].separator;
		if(separator){
			for(var d in data){
				data[d][field] = data[d][field].split(separator);
				for(var i in data[d][field]){
					data[d][field][i] = data[d][field][i].trim();
				}
			}
		}
	}
	return data;
}