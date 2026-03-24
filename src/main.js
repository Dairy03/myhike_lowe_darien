import { onAuthReady } from "./authentication.js";
import { db } from "./firebaseConfig.js";
import {
  doc,
  onSnapshot,
  getDoc,
  collection,
  getDocs,
  addDoc,
  serverTimestamp,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";

// function showName() {
//   const nameElement = document.getElementById("name-goes-here"); // the <h1> element to display "Hello, {name}"

//   // Wait for Firebase to determine the current authentication state.
//   // onAuthReady() runs the callback once Firebase finishes checking the signed-in user.
//   // The user's name is extracted from the Firebase Authentication object
//   // You can "go to console" to check out current users.
//   onAuthReady((user) => {
//     if (!user) {
//       // If no user is signed in → redirect back to login page.
//       location.href = "index.html";
//       return;
//     }

//     // If a user is logged in:
//     // Use their display name if available, otherwise show their email.
//     const name = user.displayName || user.email;

//     // Update the welcome message with their name/email.
//     if (nameElement) {
//       nameElement.textContent = `${name}!`;
//     }
//   });
// }

// const nameElement = document.getElementById("name-goes-here"); // the <h1> element to display "Hello, {name}"
// if (nameElement) {
//   document.getElementById("logsignbutton").style.visibility = "hidden";
// } else {
//   document.getElementById("logsignbutton").style.visibility = "visible";
// }

// Function to fetch the signed-in user's name and display it in the UI
function showName() {
  // Get the DOM element where the user's name will be displayed
  // Example: <h1 id="name-goes-here"></h1>
  const nameElement = document.getElementById("name-goes-here");

  // Wait until Firebase Auth finishes checking the user's auth state
  onAuthReady(async (user) => {
    // If no user is logged in, redirect to the login page
    if (!user) {
      location.href = "index.html";
      return; // Stop execution
    }

    // Get the user's Firestore document from the "users" collection
    // Document ID is the user's unique UID
    const userDoc = await getDoc(doc(db, "users", user.uid));
    const userData = userDoc.data()

    // Determine which name to display:
    const name = userDoc.exists() // 1️⃣ Use Firestore name if document exists
      ? userDoc.data().name // 2️⃣ Otherwise fallback to Firebase displayName
      : user.displayName || user.email; // 3️⃣ Otherwise fallback to email

    // If the DOM element exists, update its text using a template literal to add "!"
    if (nameElement) {
      nameElement.textContent = `${name}!`;
    }

    const bookmarks = userData.bookmarks || [];
    console.log(bookmarks)
    console.log('test')
    await displayCardsDynamically(user.uid, bookmarks)

  });
}

showName();

function readQuote(day) {
  const quoteDocRef = doc(db, "quotes", day); // Get a reference to the document

  onSnapshot(
    quoteDocRef,
    (docSnap) => {
      // Listen for real-time updates
      if (docSnap.exists()) {
        //Document existence check
        document.getElementById("quote-goes-here").innerHTML =
          docSnap.data().quote;
      } else {
        console.log("No such document!");
      }
    },
    (error) => {
      //Listener/system error
      console.error("Error listening to document: ", error);
    }
  );
}
readQuote("tuesday");

function addHikeData() {
  const hikesRef = collection(db, "hikes");
  console.log("Adding sample hike data...");
  addDoc(hikesRef, {
    code: "BBY01",
    name: "Burnaby Lake Park Trail",
    city: "Burnaby",
    level: "easy",
    details: "A lovely place for a lunch walk.",
    length: 10,
    hike_time: 60,
    lat: 49.2467097082573,
    lng: -122.9187029619698,
    last_updated: serverTimestamp(),
  });
  addDoc(hikesRef, {
    code: "AM01",
    name: "Buntzen Lake Trail",
    city: "Anmore",
    level: "moderate",
    details: "Close to town, and relaxing.",
    length: 10.5,
    hike_time: 80,
    lat: 49.3399431028579,
    lng: -122.85908496766939,
    last_updated: serverTimestamp(),
  });
  addDoc(hikesRef, {
    code: "NV01",
    name: "Mount Seymour Trail",
    city: "North Vancouver",
    level: "hard",
    details: "Amazing ski slope views.",
    length: 8.2,
    hike_time: 120,
    lat: 49.38847101455571,
    lng: -122.94092543551031,
    last_updated: serverTimestamp(),
  });
}

// Seeds the "hikes" collection with initial data if it is empty
async function seedHikes() {
  // Get a reference to the "hikes" collection
  const hikesRef = collection(db, "hikes");

  // Retrieve all documents currently in the collection
  const querySnapshot = await getDocs(hikesRef);

  // If no documents exist, the collection is empty
  if (querySnapshot.empty) {
    console.log("Hikes collection is empty. Seeding data...");

    // Call function to insert default hike documents
    addHikeData();
  } else {
    // If documents already exist, do not reseed
    console.log("Hikes collection already contains data. Skipping seed.");
  }
}

// Call the seeding function when the main.html page loads.
seedHikes();

async function displayCardsDynamically(userID, bookmarks) {
  // console.log(userID, bookmarks);
  let cardTemplate = document.getElementById("hikeCardTemplate");
  const hikesCollectionRef = collection(db, "hikes");

  try {
    const querySnapshot = await getDocs(hikesCollectionRef);
    querySnapshot.forEach((doc) => {
      // Clone the template
      let newcard = cardTemplate.content.cloneNode(true);
      // Get hike data once
      const hike = doc.data();

      // Populate the card with hike data
      newcard.querySelector(".card-title").textContent = hike.name;
      newcard.querySelector(".card-text").textContent =
        hike.details || `Located in ${hike.city}.`;
      newcard.querySelector(".card-length").textContent = hike.length;
      newcard.querySelector(
        ".read-more"
      ).href = `eachHike.html?docID=${doc.id}`;
      newcard.querySelector(".card-image").src = `../public/images/${hike.code}.png`;

      //update bookmark stuff

      //assign unique id to each bookmark icon
      const hikeDocID = doc.id
      const icon = newcard.querySelector("i.material-icons")
      icon.id = "save-" + hikeDocID

      //check db if hike is bookmarked
      const isBookmarked = bookmarks.includes(hikeDocID)

      //change icon look if bookmarked
      icon.innerText = isBookmarked ? "bookmark" : "bookmark_border";

      //call func to toggle and untoggle the bm icon and write in db
      icon.onclick =()=> toggleBookmark(userID, hikeDocID)

      // Attach the new card to the container
      document.getElementById("hikes-go-here").appendChild(newcard);
    });
  } catch (error) {
    console.error("Error getting documents: ", error);
  }
}

async function toggleBookmark(userID, hikeDocID){
  //get user info+bm info
  const userRef = doc(db, "users", userID);
  const userSnap = await getDoc(userRef);
  const userData = userSnap.data() || [];
  const bookmark = userData.bookmarks || [];
  const isBookmarked = bookmark.includes(hikeDocID)

  //construct icon id
  const iconId = "save-"+hikeDocID;
  const icon = document.getElementById(iconId)

  //update db
  try{
    if(isBookmarked){
      //already BM, need to be unbookmarked
      await updateDoc(userRef, {
        bookmarks: arrayRemove(hikeDocID)
      });
      icon.innerText = "bookmark_border"
    } else {
      await updateDoc(userRef, {
        bookmarks: arrayUnion(hikeDocID)
      });
      icon.innerText = "bookmark"

    }
    
  }catch(error){
    console.error(error)
  }
}
// Call the function to display cards when the page loads
// displayCardsDynamically();
