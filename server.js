
const express = require('express');
const path = require('path');
const _ = require('underscore');
//const url = require('url');

const ytstream = require('youtube-audio-stream')
//const decoder = require('lame').Decoder

const ytdl = require('ytdl-core');
const ytplaylist = require('ytpl'); //playlist resolver

//const passport = require('passport');

const app = express();
const PORT = process.env.PORT || 9065;

app.use((req, res, next) => {
	var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
	console.log('Request:',new Date().toISOString(), ip, req.method, req.url);
	next();
});

app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + '/index.html'));
});

/*app.get('/signin', function(req, res) {
    res.sendFile(path.join(__dirname + '/signin.html'));
});

app.post('/login', passport.authenticate('local', {
	successRedirect: '/',
    failureRedirect: '/login'
}));*/

app.get(['/icon.svg','/favicon.ico'], function(req, res) {
    res.sendFile(path.join(__dirname + '/icon.svg'));
});

app.get('/logo.svg', function(req, res) {
    res.sendFile(path.join(__dirname + '/logo.svg'));
});

app.get('/stream', function(req, res) {

	if(!req.query.url) {
		res.status(400).send('url param not found');
		return
	}

	var u = new URL(req.query.url);

	console.log('Process url...', u.href);
	
	if(u.pathname==='/watch') {	//one video
		console.log('Video loading: ',u.href)
		vurl = u.href;
	}

 	res.set({
      //'Content-Type': 'audio/mpeg3',
      'Transfer-Encoding': 'chunked'
    });

	try {

		ytstream(vurl)
		.pipe(res).on('error', function(e) {
			console.log('stream error', e)
		}).on('data', function(e) {
			console.log('ONDATA streaming...', e)
		})
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


app.get('/video', function(req, res) {

//	https://www.youtube.com/watch?v=SnmA2n8xkVQ&t=34s
//
	var u = new URL(req.query.url);

	console.log('Process video...', u.href);

	if(u.pathname==='/watch') { //video

		var id = u.searchParams.get('v');

		ytdl.getInfo(u.href).then(info => {

			var out = {
				title: info.title,
				url: info.video_url,
				thumbnail: info.player_response.videoDetails.thumbnail.thumbnails[0].url,
				duration: secondsToHms(info.length_seconds)
			};

			res.json(out);
		});
	}
});

app.get('/playlist', function(req, res) {

//	https://www.youtube.com/playlist?list=PL-g83uREdYKIfm3mZOHpEKrQK10gaLZgH
//
	var u = new URL(req.query.url);

	console.log('Process playlist...', u.href);

	if(u.pathname==='/playlist') { //playlist

		var list = u.searchParams.get('list');
		
		ytplaylist(list).then(list => {

			res.json(list);

		}).catch(err => {
			console.error(err);
		});

		return
	}
})

/* listen */
app.listen(PORT, function () {
    console.log(new Date().toISOString(), 'listening http://localhost:'+PORT);
});



function secondsToHms(d) {
    d = Number(d);
    var h = Math.floor(d / 3600);
    var m = Math.floor(d % 3600 / 60);
    var s = Math.floor(d % 3600 % 60);

    var hDisplay = h > 0 ? h + ':' : '';
    var mDisplay = m > 0 ? m + ':' : '';
    var sDisplay = s;
    return hDisplay + mDisplay + sDisplay; 
}