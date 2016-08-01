var request = require('request').defaults({ encoding: null });
var fs = require('fs');
var jsonfile = require('jsonfile');
var moment = require('moment');
var Twit = require('twit');
var Converter = require('csvtojson').Converter;
var twitterConfig = require('./twitter-config');

console.log(Date());
var Bot = new Twit(twitterConfig);

var csv = new Converter({});

var doTweet;
var obj = JSON.parse(fs.readFileSync('fultonstorms-index.json', 'utf8') || '{}');
var index = obj.index || 0;

csv.fromFile("./storm.csv", function(err, csvFile) {

  if (err) console.error('error reading csv file', err);

  doTweet = function() {

    index++;
    var record = csvFile[index];

    var status = record.EVENT_TYPE;
    if (record.MAGNITUDE) status += ' (' + record.MAGNITUDE + ')';
    if (record.BEGIN_LOCATION) status += ' BEGAN IN ' + record.BEGIN_LOCATION;
    if (record.END_LOCATION) status += ' ENDED IN ' + record.END_LOCATION;
    if (record.DEATHS_DIRECT || record.DEATHS_INDIRECT) status += ' ' + (parseInt(record.DEATHS_DIRECT || 0) + parseInt(record.DEATHS_INDIRECT || 0)) + ' KILLED'
    if (record.INJURIES_DIRECT || record.INJURIES_INDIRECT) status += ' ' + (parseInt(record.INJURIES_DIRECT || 0) + parseInt(record.INJURIES_INDIRECT || 0)) + ' INJURED'
    status += ' ' + record.BEGIN_DATE

    console.log(status);

    // post to twitter
    Bot.post('statuses/update', { status: status }, function(err, data, response) {
      if (err) console.error('error tweeting', err);
      else console.log('done tweeting');
    });

    // save csv index
    jsonfile.writeFile('fultonstorms-index.json', { 'index': index }, { spaces: 2 }, function(err) {
      if (err) console.error(err);
    });

  }

  doTweet();
});