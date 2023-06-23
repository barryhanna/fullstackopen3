const express = require('express');
const morgan = require('morgan');
const app = express();
const cors = require('cors');
require('dotenv').config();
const Person = require('./models/person');

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

app.use(express.static('build'));
app.use(cors());
app.use(express.json());

app.use(
	morgan((tokens, req, res) => {
		return [
			tokens.method(req, res),
			tokens.url(req, res),
			tokens.status(req, res),
			tokens.res(req, res, 'content-length'),
			'-',
			tokens['response-time'](req, res),
			'ms',
			JSON.stringify(req.body),
		].join(' ');
	})
);

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
	Person.find({}).then((result) => {
		return res.json(result);
	});
});

app.get('/api/persons/:id', (req, res) => {
	const id = Number(req.params.id);
	const person = persons.find((person) => person.id === id);

	if (person) {
		return res.status(200).send(person);
	}
	res.status(404).end('Person with that id was not found');
});

app.put('/api/persons/:id', async (req, res) => {
	const newNote = {
		name: req.body.name,
		number: req.body.number,
	};
	const updatedPerson = await Person.findByIdAndUpdate(
		req.params.id,
		newNote,
		{
			new: true,
		}
	);
	res.json(updatedPerson);
});

app.delete('/api/persons/:id', async (req, res) => {
	const result = await Person.findByIdAndRemove(req.params.id);
	res.status(204).end();
});

app.post('/api/persons', async (req, res) => {
	const { name, number } = req.body;
	if (!name || !number) {
		return res
			.status(400)
			.send({ error: 'A name and number is required' });
	}

	// check for unique name
	const result = await Person.findOne({ name: name }).exec();

	if (result) {
		return res.status(400).send({ error: 'name must be unique' });
	}

	const newPerson = new Person({
		name,
		number,
	});

	newPerson.save().then((result) => {
		return res.json(result);
	});
});

const unknownEndpoint = (req, res) => {
	res.status(404).send({ error: 'unknown endpoint' });
};

app.use(unknownEndpoint);

const errorHandler = (error, req, res, next) => {
	console.log(error);
	if (error.name === 'CastError') {
		res.status(400).send({ error: 'malformatted id' });
	}
	next(error);
};

app.use(errorHandler);

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
	console.log(`Listening on port: ${PORT}`);
});
