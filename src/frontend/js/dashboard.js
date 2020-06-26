var backendStatisticsURL = ''
const processKeywords = (data) => {
  const processed = {
    keywords: Object.keys(data),
    datasets: []
  }
  for (let keyword of processed.keywords) {
    processed.datasets.push({
      label: keyword,
      data: [data[keyword].totalJobs],
      backgroundColor: 'red'
    });
  }
  return processed;
}

const processTimeData = (data) => {
  data.reverse();
  const processed = {
    datasets: [{
      data: [],
      label: 'Jobs',
      backgroundColor: 'red',
      type: 'line',
      fill: false
    }]
  }
  for (let stat of data) {
    processed.datasets[0].data.push({
      t: new Date(stat.date).valueOf(),
      y: [stat.totalJobs]
    });
  }
  return processed;
}

(async () => {

  const latestStatistic = (await axios.get(backendStatisticsURL + '/api/statistics/latest')).data;
  const statistics = (await axios.get(backendStatisticsURL + '/api/statistics')).data;
  document.querySelector('.jobs div').innerHTML = latestStatistic.totalJobs;
  document.querySelector('.growth :nth-child(2) span').innerHTML = (latestStatistic.deltas.day * 100).toFixed(2);
  document.querySelector('.growth :nth-child(3) span').innerHTML = (latestStatistic.deltas.week * 100).toFixed(2);
  document.querySelector('.growth :nth-child(4) span').innerHTML = (latestStatistic.deltas.month * 100).toFixed(2);

  const keywordData = processKeywords(latestStatistic.keywords);

  const keywordsCtx = document.querySelector("#keywords-chart");
  const keywordsChart = new Chart(keywordsCtx, {
    type: 'bar',
    data: {
      labels: ['Jobs'],
      datasets: keywordData.datasets,
    },
    options: {
      responsive: false,
      legend: { display: false },
      title: { display: true, text: 'Cloud Jobs per Keyword' }
    }
  });

  document.querySelector('.daily :nth-child(2) span').innerHTML = latestStatistic.newJobs;
  document.querySelector('.daily :nth-child(3) span').innerHTML = latestStatistic.removedJobs;

  const timeData = processTimeData(statistics);
  const totalJobsCtx = document.querySelector("#total_chart");
  const timeFormat = 'YYYY/MM/DD';
  const totalJobsChart = new Chart(totalJobsCtx, {
    type: 'line',
    data: timeData,
    options: {
      responsive: false,
      layout: { padding: { right: 8, left: 0 } },
      legend: { display: false },
      title: { display: true, text: "Cloud Jobs" },
      scales: {
        xAxes: [{
          type: 'time',
          distribuition: 'series',
          ticks: {
            source: 'data',
            autoSkip: true,
            display: false
          },
          scaleLabel: { display: false }
        }],
        yAxes: [{
          scaleLabel: {
            display: true,
            labelString: 'Jobs'
          }
        }]
      }
    }
  });

  let lastWeek = new Date();
  lastWeek.setDate(lastWeek.getDate() - 7);
  lastWeek.setHours(1, 0, 0, 0);

  let lastMonth = new Date();
  lastMonth.setDate(lastWeek.getDate() - 30);
  lastMonth.setHours(0, 0, 0, 0);

  let weekNewJobs = 0;
  let weekClosedJobs = 0;
  let monthNewJobs = 0;
  let monthClosedJobs = 0;
  for (stat of statistics) {
    let date = new Date(stat.date);
    if (date.getTime() >= lastWeek.getTime()) {
      weekNewJobs += stat.newJobs;
      weekClosedJobs += stat.removedJobs;
    }
    if (date.getTime() >= lastMonth.getTime()) {
      monthNewJobs += stat.newJobs;
      monthClosedJobs += stat.removedJobs;
    }
  }
  document.querySelector('.weekly :nth-child(2) span').innerHTML = weekNewJobs;
  document.querySelector('.weekly :nth-child(3) span').innerHTML = weekClosedJobs;

  document.querySelector('.monthly :nth-child(2) span').innerHTML = monthNewJobs;
  document.querySelector('.monthly :nth-child(3) span').innerHTML = monthClosedJobs;


})();
