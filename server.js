
const express = require('express');
const path = require('path');

const stream = require('youtube-audio-stream')
//const decoder = require('lame').Decoder

const app = express();
const PORT = process.env.PORT;

app.use((req, res, next) => {
	var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
	console.log(new Date().toISOString(), ip, req.method, req.url, 'from:');
	next();
});

app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + '/index.html'));
});

app.get(['/icon.svg','/favicon.ico'], function(req, res) {
    res.sendFile(path.join(__dirname + '/icon.svg'));
});

app.get('/logo.svg', function(req, res) {
    res.sendFile(path.join(__dirname + '/logo.svg'));
});

app.get('/stream', function(req, res) {

	var url = req.query.url;

	if(!url) {
		res.status(400).send('url param not found');
		return
	}

 	res.set({
      //'Content-Type': 'audio/mpeg3',
      'Transfer-Encoding': 'chunked'
    });

	try {

		stream(url).pipe(res).on('error', function(e) {
			console.log('stream error', e)
		});
		//.pipe(decoder())
	}
	catch(e) {

		console.log('stream exception', e);
		res.removeHeader('Transfer-Encoding');
		res.set('Connection', 'close');
		res.status(400).send('url error')
		res.end();
	}
});


/* listen */
app.listen(PORT, function () {
    console.log(new Date().toISOString(), 'listening on port',PORT);
});
