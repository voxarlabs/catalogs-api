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