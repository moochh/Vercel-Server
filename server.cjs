require('dotenv').config();

const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const { Pool } = require('pg');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');

const storage = multer.memoryStorage();
const upload = multer({ storage });

const pool = new Pool({
	user: process.env.POSTGRES_USER,
	host: process.env.POSTGRES_HOST,
	database: process.env.POSTGRES_DATABASE,
	password: process.env.POSTGRES_PASSWORD,
	port: 5432,
	ssl: {
		rejectUnauthorized: true // Allow self-signed certificates
	}
});

app.use(cors());

app.get('/', (req, res) => {
	res.send('Hello World!');
});

app.get('/users', async (req, res) => {
	try {
		const result = await pool.query('SELECT * FROM users');
		res.status(200).json(result.rows);
	} catch (error) {
		console.error('Error retrieving users:', error);
		res.status(500).json({ error: 'Internal server error' });
	}
});

// Endpoint to upload an image
app.post('/upload', upload.single('image'), async (req, res) => {
	const { originalname } = req.file; // Get original file name
	const imageData = req.file.buffer; // Get image data from buffer

	try {
		// Insert image into PostgreSQL
		const result = await pool.query(
			'INSERT INTO images (name, image_data) VALUES ($1, $2) RETURNING id',
			[originalname, imageData]
		);
		res
			.status(201)
			.json({ message: 'Image uploaded successfully!', id: result.rows[0].id });
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: 'Failed to upload image.' });
	}
});

// Get images
app.get('/get-images', async (req, res) => {
	try {
		const result = await pool.query('SELECT id, name FROM images');
		res.status(200).json(result.rows);
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: 'Failed to retrieve images.' });
	}
});

// Fetch image
app.get('/image/:id', async (req, res) => {
	const { id } = req.params;

	try {
		const result = await pool.query(
			'SELECT name, image_data FROM images WHERE id = $1',
			[id]
		);
		if (result.rows.length === 0) {
			return res.status(404).json({ error: 'Image not found.' });
		}

		const { name, image_data } = result.rows[0];
		res.setHeader('Content-Type', 'image/jpeg'); // Set appropriate content type
		res.setHeader('Content-Disposition', `attachment; filename="${name}"`); // Suggest a filename
		res.send(image_data);
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: 'Failed to retrieve image.' });
	}
});

app.listen(port, () => {
	console.log(`Example app listening at http://localhost:${port}`);
});
