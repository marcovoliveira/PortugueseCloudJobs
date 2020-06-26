const express = require('express');
const bodyParser = require('body-parser');
const itJobs = require('./itjobs.js');
const cors = require('cors');
const mongo = require('./database.js');


const PORT = process.env.PORT || 10001;
const JWT_SECRET = process.env.JWT_SECRET || 'secret';

const start = async () => {
    console.log("Starting Node Server")
    const app = express();
    console.log("MongoDB setup")
    const db = await mongo.connect();

    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(cors());

    app.post('/api/search', async (request, response) => {
        let search = request.body.search;
        console.log(`Searching: ${search}`);
        let limit = request.body.limit || 10;
        let page = request.body.page || 1;
        let data = await itJobs.searchITJobs(search, limit, page);
        return response.send(data);
    });

    app.post('/api/local', async (request, response) => {
        let search = request.body.search;
        console.log(`[Local Search] ${search}`);
        let data = await mongo.searchJobs(db.db, search, true);
        return response.send(data);
    });

    app.listen(PORT, () => console.log(`Cloud Jobs API listening on port ${PORT}`));

}

start();
