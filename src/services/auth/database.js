const MongoClient = require('mongodb').MongoClient;
const bcrypt = require('bcryptjs');
const dbHost = process.env.SERVICE_DB_HOSTNAME || '127.0.0.1';
const dbPort = process.env.BD_PORT || 27017;
const dbName = process.env.DB_NAME || 'cloudjobs';
const authMechanism = 'DEFAULT';

const mongoDBOptions = {
    reconnectInterval: 1000,
    reconnectTries: 60,
    autoReconnect: true
}

// Connection URL
const url = `mongodb://${dbHost}:${dbPort}/${dbName}`;
console.log(`auth url: ${url}`)

const APP_USER_PASS = process.env.APP_USER_PASS || 'password';

const loadDefaultUser = (db) => {
    return new Promise((resolve,reject)=>{
        const users = db.collection('users');
        users.find({}).toArray((error,result)=>{
            if(error) return reject(error);
            if(!result || result.length == 0) {

                let salt = bcrypt.genSaltSync(10);
                let hash = bcrypt.hashSync(APP_USER_PASS, salt);

                users.insert({username:'admin', password:hash},(err, result) => {
                    if(err) return reject(err);
                    return resolve(true);
                });
            }
            return resolve(true);
        })
    })
}

const connect = () => {
    let db;
    let client;
    console.log(`[MongoDB] connecting to: ${url}`);

    return new Promise((resolve,reject)=>{
        console.log("Connecting to "+url)

        const client = new MongoClient(url,mongoDBOptions)
        client.connect( async (err) =>  {
            if(err) {
                console.log(err)
                return reject(err);
            }
            console.log("Connected successfully to server");
            db = client.db(dbName);

            await loadDefaultUser(db);

            return resolve({
                client:client,
                db:db
            });
        });
    })
}

module.exports = {
    connect: connect
}
