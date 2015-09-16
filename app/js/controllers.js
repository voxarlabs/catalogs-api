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