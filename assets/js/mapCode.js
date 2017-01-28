/*
//
//  Firebase Authentication Section
//
*/

// Variable that keeps track of the currently logged in user
var currentUserID;

firebase.auth().onAuthStateChanged(
	function(user) {
		if (user) {
			// User is signed in
			console.log("User is signed in!");

			// Set the currentUserID variable for future use
			currentUserID = user.uid;

			// Get the relevant user information from the returned user variable
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

	    	// Get any entries associated with the current user from the database
	    	firebase.database().ref('/users/' + currentUserID).once('value').then(function(snapshot) {
				// Append the retrieved data to the UI table
				snapshot.forEach(function(childSnapshot) {
    				var childData = childSnapshot.val();
    				console.log(JSON.stringify(childData));

					// Create the table row containing the trip data
					var outputRow = $("<tr>");
					outputRow.addClass("trip-row");
					outputRow.html("<td class='trip-name'>"+childData.tripName+"</td>"+
								   "<td class='trip-start'>"+childData.startDate+"</td>"+
								   "<td class='trip-end'>"+childData.endDate+"</td>"+
								   "<td class='trip-origin'>"+childData.startPoint+"</td>"+
								   "<td class='trip-destination'>"+childData.endPoint+"</td>");

					// Append the trip data to the table
					$("#trips-table-body").append(outputRow);
  				});

	  			// Set the user image
		    	$("#user-image").attr("src", user.photoURL);

		    	// Set the user name and email address
		    	var nameP = $("<p>").html(user.displayName);
		    	var emailP = $("<p>").html(user.email);

		    	$("#user-info").append(nameP);
		    	$("#user-info").append(emailP);

		    	// Show the saved trips panel and display the logout button
		    	$("#savedTrips").show();
		    	$("#login-button").hide();
			});
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

	    	// Clear any remaining display data
	    	mapInit();
			$("#output").empty();
			$("#tripNameLabel").empty();
			// Empty the user form for the next input
			$("#tripName").val("");
			$("#startDate").val("");
			$("#endDate").val("");
			$("#origin").val("");
			$("#destination").val("");
			$("#mpg").val("");
	  	}
	}, function(error) {
  		console.log(error);
	}
);

/*
//
//  Firebase Database Section
//
*/

// Get a reference to the database service
var database = firebase.database();

// saveTripToDatabase saves the current trip information as a new database entry
function saveTripToDatabase() {
	console.log("Saving trip info to the database!");

	var trip = {
		tripName : $("#tripName").val().trim(),
		startDate : $("#startDate").val().trim(),
		endDate : $("#endDate").val().trim(),
		startPoint : $("#origin").val().trim(),
		endPoint : $("#destination").val().trim(),
	};

	// Get a key for the new trip entry
	var newTripKey = firebase.database().ref().child('users/' + currentUserID).push().key;

	// Save the new trip entry
	firebase.database().ref('users/' + currentUserID + '/' + newTripKey).set(trip);
}

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
	function buildTrip() {
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

		expediaSearch(trip);

		$("#tripNameLabel").empty().html(trip.tripName);

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
      		// Compute the cost estimate only when the user supplied the miles per gallon value
      		if (trip.mileage !== "") {
      			getCost(trip.mileage, distance);
      		} else {
      			$("#estimate").empty().html("N/A");
      		}
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
		//expediaSearch();
	}

function expediaSearch(trip) {
    var originSearch = trip.startPoint;
    console.log("Origin search "+originSearch)
	var destinationSearch= trip.endPoint;
	var startDateSearch = trip.startDate;
	var endDateSearch = trip.endDate;
        var queryURL = "https://utcors1.herokuapp.com/http://api.hotwire.com/v1/deal/hotel?apikey=pvk45cq5h7r2dyzg2nd9sk98&dest=" + destinationSearch + "&limit=1&format=JSON"
        console.log("queryURL "+ queryURL);
        // Creates AJAX call for hotel deal
        $.ajax({
        	headers: {"x-requested-with": " "},
          url: queryURL,
          method: "GET"
        }).done(function(response) {
        	console.log("response: "+ response);
        	var responseHeadline = response.Result.HotelDeal.Headline;
        	var responseRating = response.Result.HotelDeal.StarRating;
        	var responsePrice = response.Result.HotelDeal.Price;
        	var responseURL = response.Result.HotelDeal.Url;
        	$("#hotelInfo").html("<p class='center padding'>" + responseHeadline + "</p> <p class='center padding'> Star Rating:" + responseRating + "</p> <a target='_blank' href='" + responseURL + "'> <div class='btn button-right'><span> MORE INFO </span></div></a><br>");
        });

      }

// saveCurrentTrip enters the current trip data into the UI table as well as into the database
function saveCurrentTrip() {
	console.log("Saving current trip!");

	// Read in the trip data from the form
	var tripName = $("#tripName").val().trim();
	var startDate = $("#startDate").val().trim();
	var endDate = $("#endDate").val().trim();
	var startPoint = $("#origin").val().trim();
	var endPoint = $("#destination").val().trim();

	// Create the table row containing the trip data
	var outputRow = $("<tr>");
	outputRow.addClass("trip-row");
	outputRow.html("<td class='trip-name'>"+tripName+"</td>"+
				   "<td class='trip-start'>"+startDate+"</td>"+
				   "<td class='trip-end'>"+endDate+"</td>"+
				   "<td class='trip-origin'>"+startPoint+"</td>"+
				   "<td class='trip-destination'>"+endPoint+"</td>");

	// Append the trip data to the table
	$("#trips-table-body").append(outputRow);

	// Save the trip data into the database
	saveTripToDatabase();

	// Empty the user form for the next input
	$("#tripName").val("");
	$("#startDate").val("");
	$("#endDate").val("");
	$("#origin").val("");
	$("#destination").val("");
	$("#mpg").val("");
}

// loadSavedTrip populates the form and redraws the map when the user clicks a previously saved trip
function loadSavedTrip() {
	$("#tripName").val($(this).children(".trip-name").html());
	$("#startDate").val($(this).children(".trip-start").html());
	$("#endDate").val($(this).children(".trip-end").html());
	$("#origin").val($(this).children(".trip-origin").html());
	$("#destination").val($(this).children(".trip-destination").html());

	// Redraw the map for the loaded trip
	buildTrip();
}

// Initialize the map when the page has loaded
$(document).ready(function() {
	mapInit();
});

// Submit the form and draw the map upon clicking "Submit"
$("#submit").click(function(event) {
	event.preventDefault();
	submit();
});

// Log out the current user when the "Logout" button is clicked
$("#logout-button").on("click", function() {
	firebase.auth().signOut();
});

// Redirect the user to the authentication page when the "Login" button is clicked
$("#login-button").on("click", function() {
	window.location.assign('/auth');
});

// Save the current trip info in the UI table and the datase when the "Save Current Trip" button is clicked
$("#save-current-trip").on("click", function() {
	saveCurrentTrip();
});

// Load the saved trip data when the trip row is clicked
$(document).on("click", ".trip-row", loadSavedTrip);