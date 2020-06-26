/*let backendAuthUrl = process.env.PRODUCTION ? '' : 'http://localhost:10000'
let backendSearchURL = process.env.PRODUCTION ? '' :'http://localhost:10001'
let backendKeywordsURL = process.env.PRODUCTION ? '' :'http://localhost:10003'
let backendStatisticsURL = process.env.PRODUCTION ? '' : 'http://localhost:10004'*/

let backendAuthUrl = ''
let backendSearchURL = ''
let backendKeywordsURL = ''
var backendStatisticsURL = ''


const insertSearchResult = (job, tbody) => {
  let row = document.createElement('tr');
  let publishedAt = document.createElement('td');
  publishedAt.innerHTML = moment(job.publishedAt).format('YYYY-MM-DD');
  row.appendChild(publishedAt);
  let title = document.createElement('td');
  title.innerHTML = job.title;
  row.appendChild(title);
  let company = document.createElement('td');
  company.innerHTML = job.company;
  row.appendChild(company);
  let remote = document.createElement('td');
  remote.innerHTML = (job.averageremote) ? 'Yes' : 'No';
  row.appendChild(remote);
  let locations = document.createElement('td');
  locations.innerHTML = job.locations;
  row.appendChild(locations);
  let linkTD = document.createElement('td');
  let link = document.createElement('a');
  link.href = 'https://itjobs.pt/oferta/' + job.id;
  link.innerHTML = 'link';
  link.setAttribute('target', '_blank');
  link.addEventListener('click', (e) => { e.stopPropagation(); });
  linkTD.appendChild(link);
  row.appendChild(linkTD);
  tbody.appendChild(row);
  row.addEventListener('click', (e) => {
    e.preventDefault();
    let description = e.target.parentNode.nextSibling;
    if (!description) return;
    description.style.display = (description.style.display == 'none') ? 'table-row' : 'none';
  });

  let descriptionRow = document.createElement('tr');
  descriptionRow.style.display = 'none';
  let description = document.createElement('td');
  description.setAttribute('colspan', 6);
  description.innerHTML = job.body;
  descriptionRow.appendChild(description);
  tbody.appendChild(descriptionRow);

}

const createPagination = (meta) => {
  const ul = document.querySelector('.results ul');
  ul.innerHTML = '';
  const pages = meta.total / meta.limit;
  for (let i = 1; i <= pages; i++) {
    let li = document.createElement('li');
    li.classList.add('page-item');
    if (meta.page == i) {
      li.classList.add('active');
    }
    let a = document.createElement('a');
    a.innerHTML = i;
    a.classList.add('page-link');
    a.addEventListener('click', (event) => {
      event.preventDefault();
      const page = event.target.innerHTML;
      let searchTerms = document.querySelector("#search").value;
      searchJobs(searchTerms, page);
    });
    li.appendChild(a);
    ul.appendChild(li);
  }
}

const queryAPI = (search, local = false, page = 1, limit = 10) => {
  return new Promise((resolve, reject) => {
    url = backendSearchURL + '/api/search';
    if (local) url = backendSearchURL + '/api/local';
    const parameters = {
      search: search,
      page: page,
      limit: limit
    }
    axios.post(url, parameters)
      .then(response => {
        resolve(response.data);
      })
      .catch(error => {
        console.error(error);
        reject(error);
      });
  });
}

const insertTableData = (data) => {
  let results = document.querySelector('.results');
  let tbody = results.querySelector('tbody');
  tbody.innerHTML = '';
  for (let job of data) {
    insertSearchResult(job, tbody);
  }
  results.style.display = 'block';
}


const searchJobs = async (searchTerms, page = 1, limit = 10) => {
  const data = await queryAPI(searchTerms, false, page, limit);
  insertTableData(data.data);
  createPagination(data.meta)
}

const searchLocalJobs = async (searchTerms) => {
  const data = await queryAPI(searchTerms, true);
  insertTableData(data);
  const ul = document.querySelector('.results ul');
  ul.innerHTML = '';
  //  createPagination(data.meta)
}

const searchListener = (e) => {
  if (e)
    e.preventDefault();
  let searchTerms = document.querySelector("#search").value;
  if (e.target.id == 'local') {
    searchLocalJobs(searchTerms);
  } else {
    searchJobs(searchTerms);
  }
}

const newKeywordListener = (e) => {
  e.preventDefault();
  let token = sessionStorage.getItem('token');
  if (token) {
    axios.defaults.headers.common['Authorization'] = 'bearer ' + token;
  } else {
    return location.href = 'login.html';
  }
  let keyword = document.querySelector("#new-keyword input[type='text']").value;
  axios.post(backendKeywordsURL + '/api/keywords', { data: keyword })
    .then(response => {
      getExistingKeywords();
    }).catch(error => { console.log(error); });
}

const getExistingKeywords = () => {
  let token = sessionStorage.getItem('token');
  if (token) {
    axios.defaults.headers.common['Authorization'] = 'bearer ' + token;
  } else {
    return location.href = 'login.html';
  }
  axios.get(backendKeywordsURL + '/api/keywords').
    then(response => {
      const table = document.querySelector("#keyword-table");
      const tbody = table.querySelector("tbody");
      tbody.innerHTML = '';
      for (let keyword of response.data) {
        let tr = document.createElement('tr');
        let tdKeyword = document.createElement('td');
        tdKeyword.innerHTML = keyword;
        let tdButton = document.createElement('td');
        let button = document.createElement('button');
        button.innerHTML = 'Delete';
        button.setAttribute('data-keyword', keyword);
        button.addEventListener('click', (e) => {
          e.preventDefault();
          let line = e.target.parentNode.parentNode;
          let keyword = e.target.getAttribute('data-keyword');
          axios.delete(backendKeywordsURL + '/api/keywords/' + keyword)
            .then(response => {
              line.parentNode.removeChild(line);
            }).catch(error => { console.log(error); });
        });
        tdButton.appendChild(button);
        tr.appendChild(tdKeyword);
        tr.appendChild(tdButton);
        tbody.appendChild(tr);
      }
    })
    .catch(error => { console.log(error) });
}

const loginListener = (e) => {
  e.preventDefault();
  let data = {
    username: document.querySelector('#username').value,
    password: document.querySelector('#password').value
  }
  axios.post(backendAuthUrl + '/api/signin', data)
    .then(response => {
      sessionStorage.setItem('token', response.data.token);
      location.reload(false);
    }).catch(error => { console.log(error) });
}

(() => {
  console.log("JS Loaded");

  let search_form = document.querySelector("#search_form");
  if (search_form) {
    search_form.querySelector('button[type="submit"]').addEventListener('click', searchListener);
    search_form.querySelector('#local').addEventListener('click', searchListener);
  }
  let keyword_form = document.querySelector("#new-keyword");
  if (keyword_form) {
    keyword_form.addEventListener('submit', newKeywordListener);
    getExistingKeywords();
  }

  let loginForm = document.querySelector("form#login");
  let logoutForm = document.querySelector('form#logout');
  if (loginForm) {
    let token = sessionStorage.getItem('token');
    if (token) {
      loginForm.style.display = 'none';
      logoutForm.style.display = 'block';
    } else {
      logoutForm.style.display = 'none';
      loginForm.style.display = 'block';
    }
    loginForm.addEventListener('submit', loginListener);
    logoutForm.addEventListener('submit', (e) => {
      sessionStorage.removeItem('token');
      location.reload(false);
    });
  }

})();
