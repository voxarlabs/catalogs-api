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