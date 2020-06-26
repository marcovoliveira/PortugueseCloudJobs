const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const passportLocal = require('passport-local').Strategy;
const bodyParser = require('body-parser');
const mongo = require('./database');
const cors = require('cors');

const PORT = process.env.PORT || 10000;
const JWT_SECRET = process.env.JWT_SECRET || 'secret';

const start = async () => {
    console.log("Starting Node Server")
    const app = express();
    console.log("MongoDB setup")
    const db = await mongo.connect();

    passport.use(new passportLocal((username,password, done)=> {
        const users = db.db.collection('users');
        console.log(users)
        users.findOne({username:username},(err,user)=>{
            if(err) return done(err);
            if(!user) return done(null,false);
            if(!bcrypt.compareSync(password,user.password)) return done(null,false);
            return done(null,user);
        });
    }));

    app.use(passport.initialize());

    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({extended: true}));
    app.use(cors());

    app.post('/api/signin', passport.authenticate('local',{session:false}), async (request, response) => {
        let user = request.user;
        console.log(user)
        user.token = jwt.sign({userID:user._id},JWT_SECRET);
        const users = db.db.collection('users');
        users.findOneAndReplace({_id:user._id},user,(err,result)=> {
            if(err) return response.send({error:'db error'});
            return response.send({token:user.token});
        });
    });

    app.listen(PORT,()=> console.log(`Cloud Jobs API listening on port ${PORT}`));
}

start();

