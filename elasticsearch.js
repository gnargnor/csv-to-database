const ES = require('elasticsearch');

const client = module.exports = new ES.Client({
  host: 'localhost:9200'
});

client.ping().then(x => console.log('ping'));
