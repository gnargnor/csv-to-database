const fs = require('fs');
const util = require('util');
const csv = require('csv');
const snakeCase = require('lodash/snakeCase');
const es = require('./elasticsearch');
const request = require('axios');

parseFile('./alarm-dummy-data.csv')
  .then(loadDocs)
  .then(docs => {
    console.log(`${docs.length} inserted...`);
    console.log(`here's a sample: `);
    console.log(docs[0]);
  })
  .catch(err => console.log(util.inspect(err)));

function parseFile (data, cb) {
  return new Promise((resolve, reject) => {
    const parser = csv.parse({
      auto_parse: true,
      trim: true,
      columns: true
    }, (err, data) => {
      if (err) return reject(err);
      return resolve(data);
    });
    fs.createReadStream(data).pipe(parser);
  })
  .then(data => data.map(element => Object.keys(element).reduce((m, k) => {
    switch (k) {
      case 'long':
        if (!m.location) {
          m.location = {};
        }
        m.location['lon'] = element[k];
        break;
      case 'lat':
        if (!m.location) {
          m.location = {};
        }
        m.location['lat'] = element[k];
        break;
      default:
        m[k] = element[k];
        break;
    }
    return m;
  }, {})));
}

async function loadDocs (data) {
  const docs = [];

  for (let i = 0; i < data.length; i++) {
    let payload = data[i];
    console.log(payload);

    let requestObj = {
      method: 'post',
      url: 'http://localhost:3001/alerts/',
      data: payload
    };

    docs.push(await request(requestObj));
    if (i % 10 === 0) {
      console.log(`${i} of ${data.length} processed...`);
    }
  }
  return docs;
}
