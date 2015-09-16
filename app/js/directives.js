spreadsheetApp.directive("youtubeThumb", function($compile){
	return {
		restrict: "E",
        template: '<div class="aspect-ratio" style="overflow: hidden; background-image: url(http://i.ytimg.com/vi/{{ videoId }}/hqdefault.jpg); background-size: 170%; background-position: 50%;">' 
                         +'<a href="" style="display:block; width: 50px; opacity: 0.7; height: 50px; background: url(img/play.png) no-repeat; background-size: cover; position: absolute; top: 50%; margin-top: -25px; left: 50%; margin-left: -25px"></a>' +
                    '</div>',
		link: function(scope, elem, attrs){
			$(elem).click(function(e){
  				var html = '<div class="aspect-ratio"><iframe id="ytplayer" type="text/html" style="position: absolute; height: 100%; width: 100%"' +
  				 			'src="http://www.youtube.com/embed/' + scope.videoId + '?autoplay=1&autohide=1&showinfo=0" ' +
  				 			'frameborder="0" allowfullscreen=""/></div>';
	            elem.replaceWith(html);
			});
		}
	}
});