// Handle the event of user logging in
function triggerUserLogin() {
	console.log("ENTER triggerUserLogin");

	window.location.assign('/auth');
}

// Handle the event of user continuing as a guest
function triggerGuestUser() {
	console.log("ENTER triggerGuestUser");

	window.location.assign("/tripPlanner");
}

// Register event listeners for the two application mode buttons
function selectApplicationMode() {
	$("#login").on("click", triggerUserLogin);
	$("#guest").on("click", triggerGuestUser);
}

// Select the application mode when the page has finished loading
$(document).ready(selectApplicationMode());