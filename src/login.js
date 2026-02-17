import { onAuthReady } from "./authentication.js";

function showName() {
  onAuthReady((user) => {
    if (user) {
      // If no user is signed in → redirect back to login page.
      location.href = "main.html";
      return;
    }
});}

// const nameElement = document.getElementById("name-goes-here"); // the <h1> element to display "Hello, {name}"
// if (nameElement) {
//   document.getElementById("logsignbutton").style.visibility = "hidden";
// } else {
//   document.getElementById("logsignbutton").style.visibility = "visible";
// }

showName();
