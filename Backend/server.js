// 1. Import required packages
const express = require('express');
const admin = require('firebase-admin');
const cors = require('cors');

// 2. Initialize Express app
const app = express();
app.use(express.json()); 
app.use(cors()); 

console.log("Server script started.");

// 3. Initialize Firebase Admin SDK
try {
    const serviceAccount = require('./serviceAccountKey.json');
    console.log("Successfully loaded serviceAccountKey.json.");

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    console.log("Firebase Admin SDK initialized successfully.");

    const db = admin.firestore();
    console.log("Firestore database reference obtained.");

    // 4. Define the API endpoint for form submission
    app.post('/submit-form', async (req, res) => {
        console.log("\n--- Received a new request for /submit-form ---");
        try {
            const { name, phone, email, submittedAt } = req.body;
            console.log("Request body:", req.body);

            if (!name || !email) {
                console.log("Validation failed: Name or Email is missing.");
                return res.status(400).json({ message: 'Name and Email are required.' });
            }

            console.log("Attempting to write to Firestore...");
            const contactRef = await db.collection('contacts').add({
                name,
                phone,
                email,
                submittedAt
            });

            console.log("Successfully wrote to Firestore. New document ID:", contactRef.id);

            // Send a success response back to the frontend
            res.status(200).json({ message: 'Form submitted successfully!', id: contactRef.id });
            console.log("--- Success response sent to client ---");

        } catch (error) {
            // This will catch errors during the database write
            console.error("!!! ERROR inside /submit-form endpoint:", error);
            res.status(500).json({ message: 'An error occurred while saving your data.' });
            console.log("--- Error response sent to client ---");
        }
    });

} catch (error) {
    // This will catch errors during Firebase initialization
    console.error("!!! CRITICAL ERROR during Firebase setup:", error);
}


// 5. Start the server
const PORT = 3000;
/*
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log("Ready to accept requests.");
}); */

module.exports = app;

