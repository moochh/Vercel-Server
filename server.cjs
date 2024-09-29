const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

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

app.listen(port, () => {
	console.log(`Example app listening at http://localhost:${port}`);
});
