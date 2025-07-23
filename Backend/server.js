// 1. Import required packages
// Final version for deployment
const express = require('express');
const admin = require('firebase-admin');
const cors = require('cors');

// 2. Initialize Express app
const app = express();
app.use(express.json()); 
app.use(cors()); 

// --- SMART FIREBASE INITIALIZATION ---
let db;

try {
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
        // On Vercel, use the environment variable
        console.log("Running on Vercel. Initializing with environment variable.");
        const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

        // --- THIS IS THE FIX ---
        // This line corrects the private key formatting for Firebase.
        serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
        
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
        db = admin.firestore();
        console.log("Firebase initialized successfully.");

    } else {
        // Locally, use the serviceAccountKey.json file
        console.log("Running locally. Initializing with serviceAccountKey.json.");
        const serviceAccount = require('./serviceAccountKey.json');
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
        db = admin.firestore();
    }

    // --- API ROUTE (only defined if initialization is successful) ---
    app.post('/api/submit-form', async (req, res) => {
        try {
            const { name, phone, email, submittedAt } = req.body;

            if (!name || !email) {
                return res.status(400).json({ message: 'Name and Email are required.' });
            }

            const contactRef = await db.collection('contacts').add({
                name,
                phone,
                email,
                submittedAt
            });

            res.status(200).json({ message: 'Form submitted successfully!', id: contactRef.id });

        } catch (error) {
            console.error("!!! ERROR inside /submit-form endpoint:", error);
            res.status(500).json({ message: 'An error occurred while saving your data.' });
        }
    });

} catch (error) {
    console.error("!!! CRITICAL ERROR during Firebase setup:", error);
    
    // If initialization fails, set up a fallback route to report the error
    app.post('/api/submit-form', (req, res) => {
        res.status(500).json({ 
            message: 'Server configuration error: Could not connect to the database.',
            error: error.message 
        });
    });
}
// --- END OF INITIALIZATION ---

// 5. Export the app for Vercel
module.exports = app;
