require('dotenv').config();
const express = require('express');
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://instacount-84df9-default-rtdb.asia-southeast1.firebasedatabase.app'
});

const db = admin.database();
const app = express();
const PORT = process.env.SERVER_PORT; // You can choose any port you like

// Middleware to parse JSON requests
app.use(express.json());

// Function to handle incoming POST requests
app.post('/upload', (req, res) => {
  const deviceId = req.body.deviceId; // Expecting deviceId in the request body

  if (!deviceId) {
    return res.status(400).send('Device ID is required');
  }

  const deviceRef = db.ref(`devices/${deviceId}`);

  // Use a transaction to ensure atomic increment
  deviceRef.transaction(currentData => {
    if (currentData) {
      return { reelsUploaded: currentData.reelsUploaded + 1 };
    } else {
      return { reelsUploaded: 1 }; // If device doesn't exist, create it
    }
  })
  .then(() => res.status(200).send('Reels uploaded incremented successfully.'))
  .catch(error => res.status(500).send('Error updating database: ' + error));
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
