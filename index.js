const express = require('express');
const morgan = require('morgan');
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

app.use(morgan('tiny'));
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

app.get('/api/persons/:id', (req, res) => {
	const id = Number(req.params.id);
	const person = persons.find((person) => person.id === id);

	if (person) {
		return res.status(200).send(person);
	}
	res.status(404).end('Person with that id was not found');
});

app.delete('/api/persons/:id', (req, res) => {
	const id = Number(req.params.id);
	const originalTotal = persons.length;
	persons = persons.filter((person) => id !== person.id);
	const message =
		originalTotal === persons.length
			? `Person not found.`
			: `Person was removed from phonebook`;
	res.status(200).send({ message });
});

app.post('/api/persons', (req, res) => {
	const id = Math.floor(Math.random() * 1000);
	const { name, number } = req.body;
	if (!name || !number) {
		return res
			.status(400)
			.send({ error: 'A name and number is required' });
	}
	// check for unique name
	const isNameUnique = persons.find(
		(person) => person.name.toLowerCase() === name.toLowerCase()
	);

	if (!isNameUnique) {
		return res.status(400).send({ error: 'name must be unique' });
	}

	persons.push({ id, name, number });
	res
		.status(200)
		.send({ message: `${name} - ${number} added to phonebook` });
});

const unknownEndpoint = (req, res) => {
	res.status(404).send({ error: 'unknown endpoint' });
};

app.use(unknownEndpoint);

app.listen(PORT, () => {
	console.log(`Listening on port: ${PORT}`);
});
