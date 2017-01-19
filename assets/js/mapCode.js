$(document).ready(function(){
	var directionsDisplay;
	var directionsService = new google.maps.DirectionsService();
	var map;

	//initializes the map and directions renderer
	function mapInit() {
		console.log("mapInit called");
		directionsDisplay = new google.maps.DirectionsRenderer({polylineOptions: {clickable: false}});
		var mapCanvas = $("#map")[0];
		var mapOptions = {
		  center: new google.maps.LatLng(39.83, -98.58), 
		  zoom: 4
		}
		map = new google.maps.Map(mapCanvas, mapOptions);
		google.maps.event.addListener(map, 'click', function(event){
			placeMarker(map, event.latLng);
		});
		directionsDisplay.setMap(map);
	}

	//places marker on map. the location variable contains lat and long, easy to extract
	function placeMarker(map, location){
		var lat = location.lat();
		var lng = location.lng();

		var marker = new google.maps.Marker({
			position: location,
			map: map
		});
		var infowindow = new google.maps.InfoWindow({
    		content: 'Latitude: ' + lat +
    		'<br>Longitude: ' + lng
  		});

  		var queryURL = "http://devapi.mygasfeed.com/stations/radius/"+lat+"/"+lng+"/3/reg/Price/rfej9napna.json";
  		
  		$.ajax({
        url: queryURL,
        method: "GET"
      	})
      	.done(function(response) {
      		console.log(response);
      	});
	}

	//simple route calculator with a default of driving. easy enough to send arguments into function to replace start and end.
	function calcRoute() {
		var start = "New York, NY";
		var end = "2003 Watson Rd, Durham, NC";
		var request = {
			origin: start,
			destination: end,
			travelMode: 'DRIVING'
		};

		directionsService.route(request, function(result, status) {
			if(status === 'OK') {
				directionsDisplay.setDirections(result);
			}
		});
	}



	mapInit();
	calcRoute();
});

