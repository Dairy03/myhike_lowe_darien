import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap";
import { onAuthReady } from "./authentication.js";

function showName() {
  const nameElement = document.getElementById("name-goes-here"); // the <h1> element to display "Hello, {name}"

  // Wait for Firebase to determine the current authentication state.
  // onAuthReady() runs the callback once Firebase finishes checking the signed-in user.
  // The user's name is extracted from the Firebase Authentication object
  // You can "go to console" to check out current users.
  onAuthReady((user) => {
    if (!user) {
      // If no user is signed in → redirect back to login page.
      // location.href = "index.html";
      // document.getElementById("logsignbutton").style.visibility = "visible";
      return;
    } 
    // else {
    //   document.getElementById("logsignbutton").style.visibility = "hidden";
    // }

    // If a user is logged in:
    // Use their display name if available, otherwise show their email.
    const name = user.displayName || user.email;

    // Update the welcome message with their name/email.
    if (nameElement) {
      nameElement.textContent = `${name}!`;
    }
  });
}

// const nameElement = document.getElementById("name-goes-here"); // the <h1> element to display "Hello, {name}"
// if (nameElement) {
//   document.getElementById("logsignbutton").style.visibility = "hidden";
showName();
// } else {
//   document.getElementById("logsignbutton").style.visibility = "visible";
// }


//--------------------------------------------------------------
// If you have custom global styles, import them as well:
//--------------------------------------------------------------
// import "/src/styles/style.css";

//--------------------------------------------------------------
// Custom global JS code (shared with all pages)can go here.
//--------------------------------------------------------------

// This is an example function. Replace it with your own logic.
// function sayHello() {
  // TODO: implement your logic here
// }
// document.addEventListener("DOMContentLoaded", sayHello);
