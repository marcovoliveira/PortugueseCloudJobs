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

const parseSearchResults = (data) => {
  console.log("Parsing data");
  return new Promise((resolve, reject) => {
    const jobs = [];
    for (let job of data) {
      let locations = '';
      if (job.itjobs.locations) {
        for (let location of job.itjobs.locations) {
          locations += `${location.name}, `
        }
        locations = locations.slice(0, -2);
      }
      jobs.push({
        publishedAt: job.itjobs.publishedAt,
        title: job.itjobs.title,
        company: job.itjobs.company.name,
        remote: job.itjobs.allowRemote,
        locations: locations,
        id: job.itjobs.id,
        body: job.bodyCleaned
      });
    }

    return resolve(jobs);
  })
}

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

// need
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

//need
const getJobByITJobsID = (db, ITJobsID) => {
  return new Promise((resolve, reject) => {
    const jobs = db.collection('jobs');
    jobs.findOne({ 'itjobs.id': ITJobsID }, (err, job) => {
      if (err) return reject(err);
      return resolve(job);
    });
  });
}

//need
const insertJob = (db, job) => {
  return new Promise((resolve, reject) => {
    const jobs = db.collection('jobs');
    jobs.insertOne(job, (err, result) => {
      if (err) return reject(err);
      return resolve(result);
    });
  });
}

//need
const getJobsNotUpdated = (db, today) => {
  return new Promise((resolve, reject) => {
    const jobs = db.collection('jobs');
    jobs.find({ DGUpdatedOn: { $ne: today }, removedOn: { $exists: false } }).toArray((err, jobsNotUpdated) => {
      if (err) return reject(err);
      return resolve(jobsNotUpdated);
    });
  });
}

//need
const updateJob = (db, job) => {
  return new Promise((resolve, reject) => {
    const jobs = db.collection('jobs');
    jobs.findOneAndReplace({ _id: job._id }, job, (err, results) => {
      if (err) return reject(err);
      return resolve(results);
    });
  });
}

const getStatisticsByDay = (db, day) => {
  return new Promise((resolve, reject) => {
    const statistics = db.collection('statistics');
    statistics.findOne({date: day}, (err, statistic) => {
      if(err) return reject(err);
      return resolve(statistic);
    });
  });
}

const insertStatistics = (db, statistic) => {
  return new Promise((resolve, reject) => {
    const statistics = db.collection('statistics');
    statistics.insertOne(statistic,(err, result) => {
      if(err) return reject(err);
      return resolve(result);
    });
  });
}

const searchJobs = (db, keywords, forFrontend = false) => {
  return new Promise((resolve, reject) => {
    const jobs = db.collection('jobs');
    jobs.find({ removedOn: { $exists: false }, bodyCleaned: { $regex: new RegExp(keywords, 'ig') } }).toArray(async (err, jobs) => {
      if (err) return reject(err);
      if (forFrontend) {
        return resolve(await parseSearchResults(jobs));
      }
      return resolve(jobs);
    });
  });
}


const getJobs = (db) => {
  return new Promise((resolve, reject) => {
    const jobs = db.collection('jobs');
    jobs.find({ removedOn: { $exists: false } }).toArray((err, documents) => {
      if (err) return reject(err);
      return resolve(documents);
    });
  });
}



module.exports = {
  connect: connect,
  getGathererConfig: getGathererConfig,
  getJobByITJobsID: getJobByITJobsID,
  insertJob: insertJob,
  getJobsNotUpdated: getJobsNotUpdated,
  updateJob: updateJob,
  getJobs: getJobs,
  getStatisticsByDay: getStatisticsByDay,
  searchJobs: searchJobs,
  insertStatistics: insertStatistics
}
