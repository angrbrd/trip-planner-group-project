	var directionsDisplay;
	var directionsService;
	var map;
	var trips = [];
	//initializes the map and directions renderer
	function mapInit() {
		console.log("mapInit called");
		directionsService = new google.maps.DirectionsService();
		directionsDisplay = new google.maps.DirectionsRenderer({polylineOptions: {clickable: false}});
		var mapCanvas = $("#map")[0];
		var mapOptions = {
		  center: new google.maps.LatLng(39.83, -98.58), 
		  zoom: 3
		}
		map = new google.maps.Map(mapCanvas, mapOptions);
		google.maps.event.addListener(map, 'click', function(event){
			placeMarker(map, event.latLng);
		});
		directionsDisplay.setMap(map);
	};

	function buildTrip(){
		var trip = {
			tripName : $("#tripName").val().trim(),
			startDate : $("#startDate").val().trim(),
			endDate : $("#endDate").val().trim(),
			startPoint : $("#origin").val().trim(),
			endPoint : $("#destination").val().trim(),
			tank : $("#tankSize").val().trim(),
			mileage : $("#mpg").val().trim() 
		};
		console.log(trip);
		trips.push(trip);
		calcRoute(trip.startPoint, trip.endPoint);
	};

	//places marker on map. the location variable contains lat and long, easy to extract
	function placeMarker(map, location){
		var lat = location.lat();
		var lng = location.lng();
	
		var dropMarker = function(gas){
			console.log(gas);
			var marker = new google.maps.Marker({
				position: location,
				map: map
			});
			if (gas.exists){
				google.maps.event.addListener(marker,'click',function() {
			    	var infowindow = new google.maps.InfoWindow({
			      		content: gas.name + " " + gas.price
					});
				  	infowindow.open(map,marker);
				});	
			} else {
				var infowindow = new google.maps.InfoWindow({
					content: "No data here"
				});
				infowindow.open(map, marker);
			}	
		};
		getGas(lat, lng, dropMarker);
  		
	};
	//takes latitude and longitude from marker placement to get gas data in a 10 mile radius
	function getGas (lat, lng, callback){
		var queryURL = "http://api.mygasfeed.com/stations/radius/"+lat+"/"+lng+"/10/reg/Price/lg2dvyvl7v.json";
  		
  		$.ajax({
        url: queryURL,
        method: "GET"
      	})
      	.done(function(response) {
      		console.log(response);
      		var gas = {};
      		if (response.stations.length === 0){
      			gas = {exists: false};
      		} else {
	      		var i = 0;
	      		while(response.stations[i].reg_price === "N/A"){
	      			i++;
	      			if(i === response.stations.length){break;}
	      		}
	      		var name = response.stations[i].station;
	      		var address = response.stations[i].address;
	      		var city = response.stations[i].city;
	      		var price = response.stations[i].reg_price;
	      		var outputRow = $("<tr>");
	      		outputRow.html("<td>"+name+"</td><td>"+address+"</td><td>"+city+"</td><td>"+price+"</td>");
	      		$("#output").append(outputRow);
	      		gas = {
	      			exists : true,
	      			"name": name,
	      			"address" : address,
	      			"city" : city,
	      			"price" : price
	      		};
	      		console.log("gas " + gas);
	      	}
	      	callback(gas);
      	});
	};

	//simple route calculator with a default of driving. easy enough to send arguments into function to replace start and end.
	function calcRoute(start, end) {
		var start = start;
		var end = end;
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


$(document).ready(function(){
	mapInit();

	//calcRoute();
});

$("#submit").click(function(event){
	event.preventDefault();
	buildTrip();


	//$(#)

	//Get origin, destination, start date, and end date from input
		//var originData = $("#origin").val();
		//console.log(originData);
	//format dates in new var
	//create ajax call to expedia
	//display results

});

