const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const { initializeApp } = require("firebase/app");
const { getDatabase, ref, push, get } = require("firebase/database"); // Avoid duplicate imports

const app = express();

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAbDPwXpL8kJyOX_sMTwg--wnlREFuBmac",
  authDomain: "hackton-3f98f.firebaseapp.com",
  databaseURL: "https://hackton-3f98f-default-rtdb.firebaseio.com/", // Added databaseURL
  projectId: "hackton-3f98f",
  storageBucket: "hackton-3f98f.appspot.com", // Corrected storage bucket URL
  messagingSenderId: "124331596760",
  appId: "1:124331596760:web:5b8b9f86c82953856cb0ad",
  measurementId: "G-SWQ63C0YHZ"
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
const database = getDatabase(firebaseApp);

// Middleware
app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");
app.set("views", "views")
app.use(bodyParser.urlencoded({ extended: true }));

// API route for fetching shops by category
app.get("/search-shops", async (req, res) => {
  const { category } = req.query; // Get category from query string
  try {
    const dbRef = ref(database, "shops");
    const snapshot = await get(dbRef);

    if (snapshot.exists()) {
      const shops = Object.values(snapshot.val());
      // Filter shops matching the category
      const matchingShops = shops.filter(shop =>
        shop.category.toLowerCase().includes(category.toLowerCase())
      );

      res.json({ success: true, shops: matchingShops });
    } else {
      res.json({ success: true, shops: [] }); // No shops found
    }
  } catch (error) {
    console.error("Error fetching shops:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Routes
app.get("/", (req, res) => {
  res.render("index");
});

app.get("/request", (req, res) => {
  res.render("request"); // Render the request.ejs file
});


app.get("/dashboard", async (req, res) => {
  const dbRef = ref(database, "shops");
  const snapshot = await get(dbRef);
  const shops = snapshot.exists() ? Object.values(snapshot.val()) : [];
  res.render("dashboard", { shops });
});

app.post("/add-shop", async (req, res) => {
  const { shopName, category, location } = req.body;
  const newShop = { name: shopName, category, location };

  // Save to Firebase
  const dbRef = ref(database, "shops");
  await push(dbRef, newShop);

  res.redirect("/dashboard");
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server is running on http://localhost:${PORT}`));
