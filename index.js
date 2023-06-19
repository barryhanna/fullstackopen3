const express = require('express');
const app = express();

const PORT = 3002;

let persons = [
	{
		id: 1,
		name: 'Arto Hellas',
		number: '040-123456',
	},
	{
		id: 2,
		name: 'Ada Lovelace',
		number: '39-44-5323523',
	},
	{
		id: 3,
		name: 'Dan Abramov',
		number: '12-43-234345',
	},
	{
		id: 4,
		name: 'Mary Poppendieck',
		number: '39-23-6423122',
	},
];

app.use(express.json());

app.get('/info', (req, res) => {
	const page = `<p>Phonebook has info for ${
		persons.length
	} people</p><p>${new Intl.DateTimeFormat('en-GB', {
		dateStyle: 'full',
		timeStyle: 'long',
	}).format(new Date())}</p>`;
	res.status(200).send(page);
});

app.get('/api/persons', (req, res) => {
	return res.json(persons);
});

app.listen(PORT, () => {
	console.log(`Listening on port: ${PORT}`);
});
