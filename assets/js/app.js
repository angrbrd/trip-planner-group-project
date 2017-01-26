// Select the application mode when the page has finished loading
$(document).ready(selectApplicationMode());

// Register event listeners for the two application mode buttons
function selectApplicationMode() {
	$("#login").on("click", triggerUserLogin);
	$("#guest").on("click", triggerGuestUser);
}

// Handle the event of user logging in
function triggerUserLogin() {
	console.log("ENTER triggerUserLogin");
}

// Handle the event of user continuing as a guest
function triggerGuestUser() {
	console.log("ENTER triggerGuestUser");

	location.assign("/tripPlanner");
}