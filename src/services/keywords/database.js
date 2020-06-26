const MongoClient = require('mongodb').MongoClient;

const SERVICE_DB_HOSTNAME = process.env.SERVICE_DB_HOSTNAME || '127.0.0.1'
const SERVICE_DB_PORT = process.env.SERVICE_DB_PORT || 27017
const SERVICE_DB_NAME = process.env.SERVICE_DB_NAME || 'cloudjobs'

console.log('DATABASE NAME')
console.log(process.env.SERVICE_DB_HOSTNAME)

const url = `mongodb://${SERVICE_DB_HOSTNAME}:${SERVICE_DB_PORT}`;

const mongoDBOptions = {
  reconnectInterval: 1000,
  reconnectTries: 60,
  autoReconnect: true
}

const APP_USER_PASS = process.env.APP_USER_PASS || 'password';

const loadDefaults = (db) => {
  return new Promise((resolve, reject) => {
    const config = db.collection('config');
    const gathererConfig = {
      type: 'gatherer',
      config: {
        keywords: [
          'cloud',
          'aws',
          'gcp',
          'azure',
          'docker',
          'kubernetes',
          'serverless',
          'microservices',
          'iaas',
          'paas',
          'saas'
        ]
      }
    }
    config.find({ type: 'gatherer' }).toArray((err, result) => {
      if (err) return reject(err);
      if (!result || result.length == 0) {
        config.insert(gathererConfig, (err, result) => {
          if (err) return reject(err);
          return resolve(true);
        });
      }
      return resolve(true);
    });
  });
}

const getGathererConfig = (db) => {
  return new Promise((resolve, reject) => {
    const configCollection = db.collection('config');
    configCollection.findOne({ type: 'gatherer' }, (err, result) => {
      if (err) return reject(err);
      return resolve(result);
    });
  });
}

const connect = () => {
  return new Promise((resolve, reject) => {

    const client = new MongoClient(url, mongoDBOptions)

    client.connect(async (err) => {
      if (err) {
        return reject(err);
      }
      const db = client.db(SERVICE_DB_NAME);
      if (!db) {
        return reject("No database object returned from client")
      }

      await loadDefaults(db);
      //await loadDefaultUser(db);

      console.log("Connected successfully to server");
      return resolve({ client: client, db, db });
    })
  })
}

const insertGathererKeyword = (db, keyword) => {
  return new Promise((resolve, reject) => {
    const config = db.collection('config');
    config.findOne({ type: 'gatherer' }, (err, configDocument) => {
      if (err) return reject(err);
      console.log(keyword);
      console.log(configDocument.config.keywords);
      configDocument.config.keywords.push(keyword);
      console.log(configDocument.config.keywords);
      config.findOneAndReplace({ _id: configDocument._id }, configDocument, (err, results) => {
        if (err) return reject(err);
        return resolve(results);
      });
    });
  });
}

const deleteGathererKeyword = (db, keyword) => {
  return new Promise((resolve, reject) => {
    const config = db.collection('config');
    config.findOne({ type: 'gatherer' }, (err, configDocument) => {
      if (err) return reject(err);

      let index = configDocument.config.keywords.indexOf(keyword);
      if (index !== -1) {
        configDocument.config.keywords.splice(index, 1);
      }
      config.findOneAndReplace({ _id: configDocument._id }, configDocument, (err, results) => {
        if (err) return reject(err);
        return resolve(results);
      });
    });
  });
}


module.exports = {
  connect: connect,
  getGathererConfig: getGathererConfig,
  insertGathererKeyword: insertGathererKeyword,
  deleteGathererKeyword: deleteGathererKeyword
}
