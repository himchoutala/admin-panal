const express = require("express");
const bodyParser = require("body-parser");
const { MongoClient, ObjectId } = require("mongodb");

const app = express();
const url = "mongodb://localhost:27017"; // MongoDB URL
const dbName = "adminPanel"; // Database name

let db;

// Connect to MongoDB
MongoClient.connect(url, { useUnifiedTopology: true })
    .then(client => {
        db = client.db(dbName);
        console.log(`Connected to database: ${dbName}`);
    })
    .catch(error => console.error("Database connection failed:", error));

// Middleware
app.use(bodyParser.urlencoded({ extended: true })); // Parse form data
app.set("view engine", "ejs"); // Set EJS as the template engine
app.use(express.static("public")); // Serve static files (e.g., CSS)

// Routes

// Home Route (Read all records)
app.get("/", async (req, res) => {
    try {
        const users = await db.collection("users").find().toArray();
        res.render("index", { users }); // Pass user data to the frontend
    } catch (error) {
        console.error("Error fetching data:", error);
        res.status(500).send("Error fetching data.");
    }
});

// Add a New Record (Create)
app.post("/add", async (req, res) => {
    try {
        const newUser = { name: req.body.name, email: req.body.email };
        await db.collection("users").insertOne(newUser);
        res.redirect("/");
    } catch (error) {
        console.error("Error adding record:", error);
        res.status(500).send("Error adding record.");
    }
});

// Edit Record Page
app.get("/edit/:id", async (req, res) => {
    try {
        const user = await db.collection("users").findOne({ _id: ObjectId(req.params.id) });
        res.render("update", { user });
    } catch (error) {
        console.error("Error fetching record:", error);
        res.status(500).send("Error fetching record.");
    }
});

// Update Record (Edit)
app.post("/update/:id", async (req, res) => {
    try {
        await db.collection("users").updateOne(
            { _id: ObjectId(req.params.id) },
            { $set: { name: req.body.name, email: req.body.email } }
        );
        res.redirect("/");
    } catch (error) {
        console.error("Error updating record:", error);
        res.status(500).send("Error updating record.");
    }
});

// Delete a Record
app.post("/delete/:id", async (req, res) => {
    try {
        await db.collection("users").deleteOne({ _id: ObjectId(req.params.id) });
        res.redirect("/");
    } catch (error) {
        console.error("Error deleting record:", error);
        res.status(500).send("Error deleting record.");
    }
});

// Start the Server
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});