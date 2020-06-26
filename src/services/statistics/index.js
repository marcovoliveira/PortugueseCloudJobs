const express = require('express');
const bodyParser = require('body-parser');
const mongo = require('./database.js');
const cors = require('cors');

const PORT = process.env.PORT || 10004;
const JWT_SECRET = process.env.JWT_SECRET || 'secret';

const start = async () => {
  console.log("Starting Node Server")
  const app = express();
  console.log("MongoDB setup")
  const db = await mongo.connect();

  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(cors());


  app.get('/api/statistics', async (request, response) => {
    return response.send(await mongo.getStatistics(db.db));
  });

  app.get('/api/statistics/latest', async (request, response) => {
    return response.send(await mongo.getLatestStatistic(db.db));
  });

  app.listen(PORT, () => console.log(`Cloud Jobs API listening on port ${PORT}`));
}

start();

