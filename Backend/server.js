// Updated server.js for separate environment variables
const express = require('express');
const admin = require('firebase-admin');
const cors = require('cors');

// Initialize Express app
const app = express();
app.use(express.json()); 
app.use(cors()); 

let db;

try {
    // Check for separate environment variables first (recommended)
    if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
        console.log("Initializing Firebase with separate environment variables...");
        
        const serviceAccount = {
            type: "service_account",
            project_id: process.env.FIREBASE_PROJECT_ID,
            client_email: process.env.FIREBASE_CLIENT_EMAIL,
            private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
            // Required fields with default values
            private_key_id: "",
            client_id: "",
            auth_uri: "https://accounts.google.com/o/oauth2/auth",
            token_uri: "https://oauth2.googleapis.com/token",
            auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs"
        };
        
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
        db = admin.firestore();
        console.log("✅ Firebase initialized successfully with separate env vars");

    } 
    // Fallback to JSON environment variable
    else if (process.env.FIREBASE_SERVICE_ACCOUNT) {
        console.log("Falling back to JSON service account env var...");
        const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
        
        // Fix private key formatting
        if (serviceAccount.private_key) {
            serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
        }
        
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
        db = admin.firestore();
        console.log("✅ Firebase initialized successfully with JSON env var");

    } 
    // Local development
    else {
        console.log("Running locally. Using serviceAccountKey.json...");
        const serviceAccount = require('./serviceAccountKey.json');
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
        db = admin.firestore();
        console.log("✅ Firebase initialized successfully locally");
    }

    // API Routes - only defined if Firebase initialization succeeds
    app.post('/api/submit-form', async (req, res) => {
        try {
            const { name, phone, email, submittedAt } = req.body;

            // Validation
            if (!name || !email) {
                return res.status(400).json({ 
                    message: 'Name and Email are required.' 
                });
            }

            // Save to Firestore
            const contactRef = await db.collection('contacts').add({
                name: name.trim(),
                phone: phone?.trim() || '',
                email: email.trim(),
                submittedAt: submittedAt || new Date().toISOString()
            });

            console.log(`✅ Form submitted successfully with ID: ${contactRef.id}`);
            res.status(200).json({ 
                message: 'Form submitted successfully!', 
                id: contactRef.id 
            });

        } catch (error) {
            console.error("❌ ERROR in /submit-form endpoint:", error);
            res.status(500).json({ 
                message: 'An error occurred while saving your data.',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    });

    // Health check endpoint
    app.get('/api/health', (req, res) => {
        res.status(200).json({ 
            message: 'Server is running', 
            firebase: 'connected',
            timestamp: new Date().toISOString(),
            environment: process.env.NODE_ENV || 'development'
        });
    });

    // Get all contacts (optional - for testing)
    app.get('/api/contacts', async (req, res) => {
        try {
            const snapshot = await db.collection('contacts').orderBy('submittedAt', 'desc').limit(10).get();
            const contacts = [];
            snapshot.forEach(doc => {
                contacts.push({ id: doc.id, ...doc.data() });
            });
            res.status(200).json(contacts);
        } catch (error) {
            console.error("❌ ERROR fetching contacts:", error);
            res.status(500).json({ message: 'Error fetching contacts' });
        }
    });

} catch (error) {
    console.error("❌ CRITICAL ERROR during Firebase setup:", error);
    console.error("Error details:", {
        message: error.message,
        code: error.code
    });
    
    // Fallback routes when Firebase fails
    app.post('/api/submit-form', (req, res) => {
        res.status(500).json({ 
            message: 'Server configuration error: Could not connect to the database.',
            error: error.message 
        });
    });

    app.get('/api/health', (req, res) => {
        res.status(500).json({ 
            message: 'Server configuration error', 
            error: error.message,
            firebase: 'disconnected'
        });
    });
}

// Default route
app.get('/', (req, res) => {
    res.json({ 
        message: 'Contact Form API is running',
        endpoints: [
            'POST /api/submit-form',
            'GET /api/health',
            'GET /api/contacts'
        ]
    });
});

// Export for Vercel
module.exports = app;