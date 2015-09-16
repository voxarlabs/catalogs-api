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