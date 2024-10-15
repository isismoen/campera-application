import express from 'express';
import multer from 'multer';
import { Storage } from '@google-cloud/storage';
import path from 'path';

/* eslint-disable no-undef */
const app = express();
const PORT = process.env.PORT || 3001;

// Serve static files from the public directory
app.use(express.static('public')); // Assuming index.html is in 'public'

// Initialize Google Cloud Storage
let storage, bucket;

try {
  storage = new Storage({
    keyFilename: 'C:/Users/isism/json-key-camera-app/original-guru-438705-t2-0dc7a22631ea.json', // Path to your JSON key file
  });
  bucket = storage.bucket('camera-app-bucket-1589'); // Replace with your bucket name
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
    res.status(500).send(err);
  });

  blobStream.on('finish', () => {
    const imageUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
    res.status(200).send({ imageUrl }); // Return the uploaded image URL
  });

  blobStream.end(req.file.buffer); // End the stream and upload the file
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
