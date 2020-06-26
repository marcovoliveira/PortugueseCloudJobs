const Agenda = require('agenda');
const db = require('./database.js');
const itJobs = require('./itjobs.js');

const SERVICE_DB_HOSTNAME = encodeURIComponent(process.env.SERVICE_DB_HOSTNAME || 'localhost')
const SERVICE_DB_PORT = encodeURIComponent(process.env.SERVICE_DB_PORT || 27017)
const SERVICE_DB_NAME = process.env.SERVICE_DB_NAME || 'cloudjobs'

const url = `mongodb://${SERVICE_DB_HOSTNAME}:${SERVICE_DB_PORT}/${SERVICE_DB_NAME}`;

const start = async (mongo) => {
  const agenda = new Agenda({ db: { address: url, collection: 'agendaJobs' }, options: { useNewUrlParser: true } });

  agenda.define('gather data', async (job, done) => {

    console.log('[AGENDA] starting job - gather data');
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get keywords
    const gathererConfig = await db.getGathererConfig(mongo.db);

    // Get Full Job Data
    let jobs = [];
    let results = await itJobs.getAllJobs();
    console.log(`[AGENDA|DG] got ${results.length} jobs from IT Jobs API`);
    const statistics = {
      date: today,
      deltas: {
        day: 0.0,
        week: 0.0,
        month: 0.0
      },
      keywords: {},
      totalJobs: 0,
      newJobs: 0,
      removedJobs: 0
    }

    // For Each Current Job on ITJobs
    for (let job of results) {
      let isCloudJob = false;
      for (let keyword of gathererConfig.config.keywords) {
        if (job.body.indexOf(keyword) >= 0) {
          isCloudJob = true;
        }
      }

      if (isCloudJob) {
        let cleanBody = job.body.replace(/<br>/ig,'\n');
        cleanBody = cleanBody.replace(/<\/p>/ig,'\n');
        cleanBody = cleanBody.replace(/(<([^>]+)>)/ig,'');
        let dbJob = await db.getJobByITJobsID(mongo.db, job.id);

        if (dbJob) {
          dbJob.itjobs = job;
          dbJob.bodyCleaned = cleanBody;
          dbJob.DGUpdatedOn = today;
          await db.updateJob(mongo.db, job);
        } else {
          let dbJob = {
            itjobs: job,
            bodyCleaned: cleanBody,
            OnDbFrom: today,
            DGUpdatedOn: today
          }
          let result = await db.insertJob(mongo.db, dbJob);
          statistics.newJobs++;
        }
        statistics.totalJobs++;
      }
    }
    console.log('[AGENDA!GD] processed jobs');


    const removedJobs = await db.getJobsNotUpdated(mongo.db, today);
    for (let job of removedJobs) {
      job.removedOn = today;
      statistics.removedJobs++;
      await db.updateJob(mongo.db, job);
    }

    console.log('[AGENDA|GD] processed removed Jobs');


    // For each keyword 
    for (let keyword of gathererConfig.config.keywords) {
      let jobs = await db.searchJobs(mongo.db, keyword);
      statistics.keywords[keyword] = {
        totalJobs: jobs.length,
      }
    }

    console.log('[AGENDA|GD] processed keywords');

    let yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);

    let yesterdayStats = await db.getStatisticsByDay(mongo.db, yesterday);
    if (yesterdayStats) {
      statistics.deltas.day = (statistics.totalJobs - yesterdayStats.totalJobs) / yesterdayStats.totalJobs;
    }

    let lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);
    lastWeek.setHours(0, 0, 0, 0);

    let lastWeekStats = await db.getStatisticsByDay(mongo.db, lastWeek);
    if (lastWeekStats) {
      statistics.deltas.week = (statistics.totalJobs - lastWeekStats.totalJobs) / lastWeekStats.totalJobs;
    }


    let lastMonth = new Date();
    lastMonth.setDate(lastMonth.getDate() - 30);
    lastMonth.setHours(0, 0, 0, 0);

    let lastMonthStats = await db.getStatisticsByDay(mongo.db, lastMonth);
    if (lastMonthStats) {
      statistics.deltas.month = (statistics.totalJobs - lastMonthStats.totalJobs) / lastMonthStats.totalJobs;
    }

    let statResults = await db.insertStatistics(mongo.db, statistics);

    console.log('[AGENDA!GD] processed deltas');
    console.log('[AGENDA] ended job - gather data');
    return done(null, true);
  });

  console.log('Starting Agenda');
  await agenda.start();

  console.log('[Agenda] defining schedules');
  await agenda.every('0 6 * * *', 'gather data');

  let jobs = await db.getJobs(mongo.db);
  if (jobs.length < 1) {
    await agenda.now('gather data');
  }

}

module.exports = {
  start: start
}
