// 1. Import required packages
const express = require('express');
const admin = require('firebase-admin');
const cors = require('cors');

// 2. Initialize Express app
const app = express();
app.use(express.json()); 
app.use(cors()); 


let db;

if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    
    console.log("Running on Vercel. Initializing with environment variable.");
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
    db = admin.firestore();
} else {
    // Locally, use the serviceAccountKey.json file
    console.log("Running locally. Initializing with serviceAccountKey.json.");
    const serviceAccount = require('./serviceAccountKey.json');
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
    db = admin.firestore();
}
// --- END OF INITIALIZATION ---


// 4. Define the API endpoint for form submission
app.post('/api/submit-form', async (req, res) => {
    console.log("\n--- Received a new request for /api/submit-form ---");
    try {
        const { name, phone, email, submittedAt } = req.body;
        console.log("Request body:", req.body);

        if (!name || !email) {
            return res.status(400).json({ message: 'Name and Email are required.' });
        }

        const contactRef = await db.collection('contacts').add({
            name,
            phone,
            email,
            submittedAt
        });

        console.log("Successfully wrote to Firestore. New document ID:", contactRef.id);
        res.status(200).json({ message: 'Form submitted successfully!', id: contactRef.id });

    } catch (error) {
        console.error("!!! ERROR inside /submit-form endpoint:", error);
        res.status(500).json({ message: 'An error occurred while saving your data.' });
    }
});


// 5. Export the app for Vercel
module.exports = app;
