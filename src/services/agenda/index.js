const agenda = require('./agenda.js');
const mongo = require('./database.js');

const start = async () => {
    console.log("MongoDB setup")
    const db = await mongo.connect();
    console.log("Agenda setup")
    agenda.start(db);
}

start();