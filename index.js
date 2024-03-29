
const express = require('express');
const path = require('path');
const _ = require('underscore');
//const fs = require('fs');

const ytstream = require('youtube-audio-stream');
//const decoder = require('lame').Decoder

const ytdl = require('ytdl-core');
const ytplaylist = require('ytpl'); //playlist resolver

//const passport = require('passport');

const app = express();
const PORT = process.env.PORT || 9065;

function min2sec(m) {
	var parts = m.split(':');
	return parseInt(parts[0]) * 60 + parseInt(parts[1]);
}

//logging
app.use((req, res, next) => {
	var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
	console.log('Request:',new Date().toISOString(), ip, req.method, req.url);
	next();
});

app.disable('x-powered-by');
app.use(express.static('static', {
//	maxAge: 1000*60*60*24*30*3,//in milliseconds, 3 months
//	etag: false
}));

app.get('/stream', function(req, res) {

	if(!req.query.url) {
		res.status(400).send('url param not found');
		return
	}

	var u = new URL(req.query.url),
		begin = (Number(req.query.startime)*1000) || 0;

//TODO https://github.com/JamesKyburz/youtube-audio-stream/issues/67

	console.log('Process stream...', u.href, 'begin:',begin);

	if(u.pathname==='/watch') {
		vurl = u.href;
	}

 	res.set({
      //'Content-Type': 'audio/mpeg3',
      'Transfer-Encoding': 'chunked'
    });

	try {

		ytstream(vurl, {begin})
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


app.get('/download', function(req, res) {

	if(!req.query.url) {
		res.status(400).send('url param not found');
		return
	}

	var u = new URL(req.query.url);

	var ref = new URL(req.header('Referer'));

	console.log('Process download...', u.href);

	if(u.pathname==='/watch' && ref.hostname==='youtubecaster.herokuapp.com') {
		vurl = u.href;
	}
	else
		return;

    var id = u.searchParams.get('v');

    res.setHeader('Content-Type', 'video/mp4');
    res.setHeader('Content-Disposition', 'attachment; filename="' + id + '.mp4"');

	try {

		ytdl(vurl, {filter: format => format.container === 'mp4'})
		.pipe(res).on('error', function(e) {
			console.log('stream error', e)
		}).on('data', function(e) {
			console.log('ONDATA download...', e)
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

	console.log('Process video...', req.query.url);

	if(u.pathname==='/watch' || u.hostname==='youtu.be') { //video

		var id = u.searchParams.get('v');

		ytdl.getInfo(u.href).then(info => {

			var out = {
				title: info.videoDetails.title,
				url: info.videoDetails.video_url,
				thumbnail: info.videoDetails.thumbnail.thumbnails[0].url,
				duration: Number(info.videoDetails.lengthSeconds),
				channel: info.videoDetails.ownerProfileUrl
			};

//console.log('ytdl.getInfo',JSON.stringify(info));
console.log('ytdl.getInfo',out);

			res.json(out);

		}).catch((err) => {

			console.log('Error:', err.message);

			var mes = 'video not found';
			if(err.message=='Status code: 429')
				mes = 'too many requests please try again later';
			res.json({err: mes})
		});
	}
});

app.get('/playlist', function(req, res) {

//	https://www.youtube.com/playlist?list=PL-g83uREdYKIfm3mZOHpEKrQK10gaLZgH
//
	var u = new URL(req.query.url);

	console.log('Process playlist...', req.query.url);

	if(u.pathname==='/playlist') { //playlist

		var list = u.searchParams.get('list');

		ytplaylist(list).then(list => {

			list.items = _.map(list.items, (i)=> {
				if(i.duration)
					i.duration = min2sec(i.duration);
				return i
			});

			res.json(list);

		}).catch((err) => {
			console.log('Error:', err.code, err.message);
			res.json({err: 'playlist not found'})
		});

		return
	}
})

/* listen */
app.listen(PORT, function () {
    console.log(new Date().toISOString(), 'listening http://localhost:'+PORT);
});


/*app.get('/signin', function(req, res) {
    res.sendFile(path.join(__dirname + '/signin.html'));
});

app.post('/login', passport.authenticate('local', {
	successRedirect: '/',
    failureRedirect: '/login'
}));*/