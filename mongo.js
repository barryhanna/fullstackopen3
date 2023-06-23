const mongoose = require('mongoose');

if (process.argv.length < 3) {
	console.log('give a password as argument');
	process.exit(1);
}

const password = process.argv[2];

const url = `mongodb+srv://barryahanna:${password}@fullstackopenphonebook.w7ynclp.mongodb.net/phonebookApp`;

mongoose.set('strictQuery', false);

mongoose.connect(url);

const personSchema = new mongoose.Schema({
	name: String,
	number: String,
});

const Person = mongoose.model('Person', personSchema);

function addPerson(name, number) {
	const newPerson = new Person({
		name,
		number,
	});
	newPerson.save().then((result) => {
		console.log(`added ${name} number ${number} to phonebook`);
		mongoose.connection.close();
	});
}

if (process.argv.length === 5) {
	const name = process.argv[3];
	const number = process.argv[4];
	console.log(`${name} ${number}`);
	addPerson(name, number);
}

if (process.argv.length === 3) {
	console.log('phonebook:');
	Person.find({}).then((persons) => {
		persons.forEach((person) =>
			console.log(`${person.name} ${person.number}`)
		);
		mongoose.connection.close();
	});
}
