import express from 'express';
import multer from 'multer';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Enable CORS
app.use(cors());

// serve static files
app.use(express.static(path.join(__dirname, 'public'))); // Use __dirname here
// Set up storage for uploaded files
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Append timestamp to filename
    },
});

const upload = multer({ storage: storage });

// Serve static files
app.use(express.static('public'));

// Upload endpoint
app.post('/upload', upload.single('image'), (req, res) => {
    if (req.file) {
        return res.json({ message: 'File uploaded successfully!', filePath: req.file.path });
    }
    return res.status(400).send('Error uploading file.');
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
