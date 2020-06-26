const axios = require('axios');
const ITJOBS_KEY = process.env.ITJOBS_KEY;
const ITJOBS_URL = process.env.IT_JOBS_URL || 'http://api.sandbox.itjobs.pt';

const parseSearchResults = (data) => {
    console.log("Parsing data");
    console.log(data);
    return new Promise((resolve, reject) => {
        const jobs = [];
        for (let job of data) {
            let locations = '';
            if (job.locations) {
                for (let location of job.locations) {
                    locations += `${location.name}, `
                }
                locations = locations.slice(0, -2);
            }
            let cleanBody = job.body.replace(/<br>/ig, '\n');
            cleanBody = cleanBody.replace(/<\/p>/ig, '\n');
            cleanBody = cleanBody.replace(/(<([^>]+)>)/ig, '');
            jobs.push({
                publishedAt: job.publishedAt,
                title: job.title,
                company: job.company.name,
                remote: job.allowRemote,
                locations: locations,
                id: job.id,
                body: cleanBody
            });
        }
        return resolve(jobs);
    })
}

exports.searchITJobs = (search, limit, page) => {
    return new Promise((resolve, reject) => {
        const url = `${ITJOBS_URL}/job/search.json?api_key=${ITJOBS_KEY}&q=${search}`;

        const requestOptions = {
            url: url,
            method: 'GET',
            json: true,
            qs: {
                api_key: ITJOBS_KEY,
                q: search,
                limit: limit,
                page: page
            }
        };
        console.log(`[ITJOBS] getting ${url}`);
        axios(requestOptions.url)
            .then(async (response) => {
                console.log(`DATA received ${typeof response.data}`);
                console.log(response);

                const parsedData = await parseSearchResults(response.data.results);
                const returnData = {
                    meta: {
                        total: response.data.total,
                        page: response.data.page,
                        limit: response.data.limit,
                        query: response.data.query
                    },
                    data: parsedData
                };
                return resolve(returnData);
            })
            .catch(error => {
                console.log(error);
                return reject(error);
            });
    });
}


