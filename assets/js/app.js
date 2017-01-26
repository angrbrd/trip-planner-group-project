// FirebaseUI configuration
var uiConfig = {
  'callbacks': {
    // Called when the user has been successfully signed in.
    'signInSuccess': function(user, credential, redirectUrl) {
      handleSignedInUser(user);
      // Do not redirect.
      return false;
    }
  },
  // Identity providers sign-in flow
  'signInFlow': 'redirect',
  'signInOptions': [
    {
      provider: firebase.auth.GoogleAuthProvider.PROVIDER_ID,
      scopes: ['https://www.googleapis.com/auth/plus.login']
    },
    {
      provider: firebase.auth.FacebookAuthProvider.PROVIDER_ID,
      scopes :[
        'public_profile',
        'email',
        'user_likes',
        'user_friends'
      ]
    },
    firebase.auth.TwitterAuthProvider.PROVIDER_ID,
    firebase.auth.GithubAuthProvider.PROVIDER_ID,
    firebase.auth.EmailAuthProvider.PROVIDER_ID
  ],
  // Terms of service url.
  'tosUrl': 'https://www.google.com'
};

// Initialize the FirebaseUI Widget using Firebase.
var ui = new firebaseui.auth.AuthUI(firebase.auth());
// Keep track of the currently signed in user.
var currentUid = null;

// Handle the signed in user appropriately
var handleSignedInUser = function(user) {
  currentUid = user.uid;

  console.log("user name:" + user.displayName);
  console.log("user email:" + user.email);

  // document.getElementById('user-signed-in').style.display = 'block';
  // document.getElementById('user-signed-out').style.display = 'none';
  // document.getElementById('name').textContent = user.displayName;
  // document.getElementById('email').textContent = user.email;
  // if (user.photoURL){
  //   document.getElementById('photo').src = user.photoURL;
  //   document.getElementById('photo').style.display = 'block';
  // } else {
  //   document.getElementById('photo').style.display = 'none';
  // }
};


// Handle the signed out user
var handleSignedOutUser = function() {
  // document.getElementById('user-signed-in').style.display = 'none';
  // document.getElementById('user-signed-out').style.display = 'block';

  // ui.start('#firebaseui-container', uiConfig);
  console.log("USER IS NOW SIGNED OUT!");
};

// Listen to change in auth state so it displays the correct UI for when
// the user is signed in or not.
firebase.auth().onAuthStateChanged(function(user) {
  // The observer is also triggered when the user's token has expired and is
  // automatically refreshed. In that case, the user hasn't changed so we should
  // not update the UI.
  if (user && user.uid == currentUid) {
    return;
  }
  // document.getElementById('loading').style.display = 'none';
  // document.getElementById('loaded').style.display = 'block';
  user ? handleSignedInUser(user) : handleSignedOutUser();
});








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
