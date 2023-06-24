const express = require('express');
const morgan = require('morgan');
const app = express();
const cors = require('cors');
require('dotenv').config();
const Person = require('./models/person');

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

app.get('/info', async (req, res) => {
	const numEntries = await Person.find({}).count();
	const page = `<p>Phonebook has info for ${numEntries} people</p><p>${new Intl.DateTimeFormat(
		'en-GB',
		{
			dateStyle: 'full',
			timeStyle: 'long',
		}
	).format(new Date())}</p>`;
	res.status(200).send(page);
});

app.get('/api/persons', (req, res) => {
	Person.find({}).then((result) => {
		return res.json(result);
	});
});

app.get('/api/persons/:id', async (req, res, next) => {
	const person = await Person.findById(req.params.id);
	if (!person) {
		return next({ message: 'No person found with that id' });
	}
	return res.json(person);
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
			runValidators: true,
			content: 'query',
		}
	);
	res.json(updatedPerson);
});

app.delete('/api/persons/:id', async (req, res) => {
	const result = await Person.findByIdAndRemove(req.params.id);
	res.status(204).end();
});

app.post('/api/persons', async (req, res, next) => {
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

	newPerson
		.save()
		.then((result) => {
			return res.json(result);
		})
		.catch((err) => {
			next(err);
		});
});

const unknownEndpoint = (req, res) => {
	res.status(404).send({ error: 'unknown endpoint' });
};

app.use(unknownEndpoint);

const errorHandler = (error, req, res, next) => {
	console.log('error', error);
	if (error.name === 'CastError') {
		res.status(400).send({ error: 'malformatted id' });
	} else if (error.name === 'ValidationError') {
		return res.status(400).send({ error: error.message });
	}
	next(error);
};

app.use(errorHandler);

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
	console.log(`Listening on port: ${PORT}`);
});
