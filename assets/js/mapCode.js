/*
//
//  Firebase Authentication Section
//
*/

firebase.auth().onAuthStateChanged(
	function(user) {
		if (user) {
			// User is signed in
			console.log("User is signed in!");

	    	var displayName = user.displayName;
	    	var email = user.email;
	    	var emailVerified = user.emailVerified;
	    	var photoURL = user.photoURL;
	    	var uid = user.uid;
	    	var providerData = user.providerData;

	    	// Print the user data for confirmation
	    	console.log(
	    		JSON.stringify({
	        		displayName: displayName,
	        		email: email,
	        		emailVerified: emailVerified,
	        		photoURL: photoURL,
	        		uid: uid,
	        		providerData: providerData
	      		})
	    	);

	    	// Set the user image
	    	$("#user-image").attr("src", user.photoURL);

	    	// Set the user name and email address
	    	var nameP = $("<p>").html(user.displayName);
	    	var emailP = $("<p>").html(user.email);

	    	$("#user-info").append(nameP);
	    	$("#user-info").append(emailP);

	    	// Show the saved trips panel and display the logout button
	    	//$("#login-panel").show();
	    	$("#savedTrips").show();
	    	$("#login-button").hide();
	  	} else {
	    	// User is signed out
	    	console.log("User is signed out!");

	    	// Clear the image source as well as the user info
	    	$("#account-details").hide();
	    	$("#user-image").attr("src", "");
	    	$("#user-info").empty();

	    	// Hide the saved trips panel and display the login button 
	    	$("#savedTrips").hide();
	    	$("#logout-button").hide();
	    	$("#login-button").show();
	  	}
	}, function(error) {
  		console.log(error);
	}
);

/*
//
//  Google Maps Section
//
*/

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
	//creates a trip object and pushes it into a trip array.
	function buildTrip(){
		mapInit();
		$("#output").empty();
		var trip = {
			tripName : $("#tripName").val().trim(),
			startDate : $("#startDate").val().trim(),
			endDate : $("#endDate").val().trim(),
			startPoint : $("#origin").val().trim(),
			endPoint : $("#destination").val().trim(),
			mileage : $("#mpg").val().trim() 
		};

		$("#tripName").val("");
		$("#startDate").val("");
		$("#endDate").val("");
		$("#origin").val("");
		$("#destination").val("");
		$("#mpg").val("");

		$("#tripNameLabel").empty()
						.html(trip.tripName);

		getDistance(trip);
		console.log(trip);
		//trips.push(trip);
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
				map: map,
				icon: './images/icon21.png',
				animation: google.maps.Animation.DROP
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
				google.maps.event.addListener(marker, 'click', function() {
					infowindow.open(map, marker);
				});
			}	
		};
		getGas(lat, lng, dropMarker);
  		
	};
	//takes latitude and longitude from marker placement to get gas data in a 10 mile radius
	function getGas (lat, lng, callback){
		var queryURL = "https://utcors1.herokuapp.com/http://api.mygasfeed.com/stations/radius/"+lat+"/"+lng+"/10/reg/Price/lg2dvyvl7v.json";
  		
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

	function getDistance (trip) {
		var origin = trip.startPoint.replace(/\s/g, "");
		var destination = trip.endPoint.replace(/\s/g, "");
		console.log(origin, destination);
		var queryURL = "https://utcors1.herokuapp.com/https://maps.googleapis.com/maps/api/distancematrix/json?units=imperial&origins="+origin+"&destinations="+destination+"&key=AIzaSyClWF3mmliTe-JldccjUJhpsc220W9hRIE";
		
		$.ajax({
        	url: queryURL,
        	method: "GET"
      	})
      	.done(function(response) {
      		var distance = response.rows[0].elements[0].distance.text;
      		
      		distance = distance.replace(/[^\d.]/g, "");
      		//distance = distance.replace("mi", "");
      		console.log(trip);
      		console.log("distance value: "+ distance);
      		getCost(trip.mileage, distance);
      	});
	}

	function getCost (mileage, distance) {
		distance = parseInt(distance);
		console.log(mileage, distance);
		var gasPrice = 2.5;
		var cost = (distance / mileage) * gasPrice;
		console.log(cost);
		$("#estimate").empty()
				.html("$" + cost.toFixed(2));
	}

	function submit () {
		buildTrip();
		expediaSearch();
	}

function expediaSearch() {
    var originSearch = $("#origin").val();
	var destinationSearch= $("#destination").val();
	var startDateSearch = $("#startDate").val();
	var endDateSearch = $("#endDate").val();
        var queryURL = "https://utcors1.herokuapp.com/http://api.hotwire.com/v1/deal/hotel?apikey=pvk45cq5h7r2dyzg2nd9sk98&dest=" + destinationSearch + "&limit=1&format=JSON"

        // Creates AJAX call for hotel deal
        $.ajax({
        	headers: {"x-requested-with": " "},
          url: queryURL,
          method: "GET"
        }).done(function(response) {
        	
        	var responseHeadline = response.Result.HotelDeal.Headline;
        	var responseRating = response.Result.HotelDeal.StarRating;
        	var responsePrice = response.Result.HotelDeal.Price;
        	var responseURL = response.Result.HotelDeal.Url;
        	$("#hotelInfo").html("<p class='center padding'>" + responseHeadline + "</p> <p class='center padding'> Star Rating:" + responseRating + "</p> <a target='_blank' href='" + responseURL + "'> <div class='btn'><span> MORE INFO </span></div></a><br>");
        });

      }


$(document).ready(function(){
	mapInit();
});


$("#submit").click(function(event){
	event.preventDefault();
	submit();
});

$("#logout-button").on("click", function() {
	firebase.auth().signOut();
});

$("#login-button").on("click", function() {
	window.location.assign('/auth');
});