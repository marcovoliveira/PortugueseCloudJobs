const axios = require('axios');
const ITJOBS_KEY = process.env.ITJOBS_KEY;
const ITJOBS_URL = process.env.IT_JOBS_URL || 'http://api.sandbox.itjobs.pt';

const makeRequest = (requestOptions) => {
  return new Promise((resolve, reject) => {
    axios.get(requestOptions.url, requestOptions)
      .then(async (response) => {
        console.log(response);
        return resolve(response.data);
      })
      .catch(error => {
        console.log(error);
        return reject(error);
      });
  });
}

exports.getAllJobs = () => {
  return new Promise(async (resolve, reject) => {
    const url = `${ITJOBS_URL}/job/search.json`;
    const requestOptions = {
      url: url,
      method: 'GET',
      json: true,
      params: {
        api_key: ITJOBS_KEY,
        q: '',
        limit: 500,
        page: 1
      }
    };
    let resultsToGet = 1;
    let results = [];
    while (resultsToGet > 0) {
      let response = await makeRequest(requestOptions);
      results = results.concat(response.results);
      resultsToGet = response.total - (500 * response.page);
      requestOptions.params.page++;
    }
    resolve(results);
  });
}
