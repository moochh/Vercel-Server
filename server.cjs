require('dotenv').config();

const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const { Pool } = require('pg');
const cors = require('cors');

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

app.get('/users', (req, res) => {
	const users = [
		{ id: 1, name: 'John' },
		{ id: 2, name: 'Jane' },
		{ id: 3, name: 'Joe' }
	];
	res.json(users);
});

app.get('/postgres', async (req, res) => {
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

app.listen(port, () => {
	console.log(`Example app listening at http://localhost:${port}`);
});
