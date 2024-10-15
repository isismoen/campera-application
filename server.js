import express from 'express';
import multer from 'multer';
import { Storage } from '@google-cloud/storage';
import path from 'path';

/* eslint-disable no-undef */
const app = express();
const PORT = process.env.PORT || 3001;

// Serve static files from the public directory
app.use(express.static('public')); // Assuming index.html is in 'public'

//Log the google cloud key for debugging
console.log('Google Cloud Key:', GOOGLE_APPLICATION_CREDENTIALS) //checks if the environment variable is loaded correctly

// Initialize Google Cloud Storage
let storage, bucket;

try {
  // Load Google Cloud credentials from the environment variable
  const googleCredentials = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS);

  storage = new Storage({
    credentials: googleCredentials, // Use the credentials from the environment variable
  });

  bucket = storage.bucket('camera-app-bucket-1589'); // google cloud storage bucket name
} catch (error) {
  console.error('Error initializing Google Cloud Storage:', error);
  process.exit(1); // Exit if initialization fails
}

// Set up multer to handle file uploads
const upload = multer({
  storage: multer.memoryStorage(), // Store file in memory temporarily
});

// Endpoint to upload an image
app.post('/upload', upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }

  const blob = bucket.file(Date.now().toString() + path.extname(req.file.originalname)); // Set the file name
  const blobStream = blob.createWriteStream({
    resumable: false,
    contentType: req.file.mimetype, // Set the content type of the file
  });

  blobStream.on('error', (err) => {
    console.error('Upload error:', err); //log detailed error to console
    res.status(500).send({ error: 'Failed to upload image', details: err.message });
  });

  blobStream.on('finish', () => {
    const imageUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
    res.status(200).send({ imageUrl }); // Return the uploaded image URL
  });

  blobStream.end(req.file.buffer); // End the stream and upload the file
});

//Explicit route to serve index.html from the public directory
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html')); // Ensure index.html is in 'public'
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
