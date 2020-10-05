
const express = require('express');
//const through = require('through');
const path = require('path');

const stream = require('youtube-audio-stream')
const decoder = require('lame').Decoder
//const speaker = require('speaker')

const app = express();
const PORT = process.env.PORT;

/*function write(buf) {
    console.log('writing...');
    this.queue('okkkk');
}

function end() {
    this.queue(null);
}

var str = through(write, end);
*/

app.get('/', function(req, res) {
	var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
	console.log('get index', ip);
    res.sendFile(path.join(__dirname + '/index.html'));
});


app.get('/stream', function(req, res) {

	console.log('get stream', req.query.url);
 	
 	res.set({
      //'Content-Type': 'audio/mp3',
      'Transfer-Encoding': 'chunked'
    });

	stream(req.query.url)
	//.pipe(decoder())
	.pipe(res)
	//var s = req.pipe(str).pipe(res);
	//.pipe(new speaker())

});


/* listen */
app.listen(PORT, function () {
    console.log('listening on port ' + PORT + '...');
});
