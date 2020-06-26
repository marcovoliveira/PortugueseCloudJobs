const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const passportLocal = require('passport-local').Strategy;
const passportHTTPBearer = require('passport-http-bearer').Strategy;
const bodyParser = require('body-parser');
const mongo = require('./database.js');
const cors = require('cors');

const PORT = process.env.PORT || 10003;
const JWT_SECRET = process.env.JWT_SECRET || 'secret';

const start = async () => {
  console.log("Starting Node Server")
  const app = express();
  console.log("MongoDB setup")
  const db = await mongo.connect();

  passport.use(new passportHTTPBearer((token, done) => {
    const users = db.db.collection('users');
    try {
      jwt.verify(token, JWT_SECRET);
    } catch (exception) {
      return done(exception);
    }
    users.findOne({ token: token }, (err, user) => {
      if (err) return done(err);
      if (!user) return done(null, false);
      return done(null, user, { scope: 'all' });
    });
  }));

  passport.use(new passportHTTPBearer((token, done) => {
    const users = db.db.collection('users');
    try {
      jwt.verify(token, JWT_SECRET);
    } catch (exception) {
      return done(exception);
    }
    users.findOne({ token: token }, (err, user) => {
      if (err) return done(err);
      if (!user) return done(null, false);
      return done(null, user, { scope: 'all' });
    });
  }));

  app.use(passport.initialize());

  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(cors());


  app.get('/api/keywords', passport.authenticate('bearer', { session: false }), async (request, response) => {
    let configData = await mongo.getGathererConfig(db.db);
    return response.send(configData.config.keywords);
  });

  app.post('/api/keywords', passport.authenticate('bearer', { session: false }), async (request, response) => {
    let keyword = request.body.data;
    console.log(keyword);
    let result = await mongo.insertGathererKeyword(db.db, keyword);
    return response.send(result);
  });

  app.del('/api/keywords/:keyword', passport.authenticate('bearer', { session: false }), async (request, response) => {
    let keyword = request.params.keyword;
    let result = await mongo.deleteGathererKeyword(db.db, keyword);
    return response.send(result);
  });

  app.listen(PORT, () => console.log(`Cloud Jobs API listening on port ${PORT}`));
}

start();

