
var url$ = $('#url');
var audio$ = $('#audio');
var err$ = $('#err');

function sec2min(d) {
    const ss = Number(d);
    if(!ss) return '';
    const iso = new Date(ss * 1000).toISOString();
    return ss < 3600 ? iso.substr(14, 5) : iso.substr(11, 8);
}

Handlebars.registerHelper('sec2min', sec2min);

var tmplItems = Handlebars.compile($('#list-items').html());

window.app = {
	errt: null,
	mode: 'video',//or 'playlist'
	error: m => {
		err$.text(m);
		clearTimeout(app.errort);
		app.errort = setTimeout(()=> {
			err$.text('')
		},3000);
	}
};

audio$[0]._startime = 0;

audio$.on('playing', e => {
	$('#playing').css('visibility','visible');

	var url = audio$.attr('src').split('url=')[1];

	$('#list li').removeClass('play');
	$('#list li[data-url="'+url+'"]').addClass('play')
})
.on('timeupdate', function() {
   const p = (this.currentTime / $('#list li.play').data('duration')) * 100
   	   , cur = sec2min(this._startime + this.currentTime);
   $('#list li.play progress').attr('value', p);

   $('#list li time b').text(cur?cur+' / ':'');
})
.on('paused', e => {
	$('#playing').css('visibility','hidden');
})
.on('ended', e => {
	var next$ = $('#list li.play').next('li');
	if(app.mode==='playlist' && next$.length) {
		next$.trigger('click');
	}
	$('#playing').css('visibility','hidden');
	$('#list li').removeClass('play');
});

$('#play').on('click', e => {
	let url;
	try {
		url = new URL($.trim($('#url').val()));
	}
	catch(err) {
		app.error(err.message)
	}

	if($('#list li').length==0) {
		if(url.pathname=='/playlist') {

			app.mode = 'playlist';

			$.getJSON(location.origin+'/playlist?url='+url, (json)=> {

				if(json.err){
					app.error(json.err);
				}
				else if(json.items.length)
					$('#list').html(tmplItems(json));
			});
		}
		else if(url.pathname=='/watch' || url.hostname=='youtu.be') {

			app.mode = 'video';

			$.getJSON(location.origin+'/video?url='+url, (json)=> {

				if(json.err) {
					app.error(json.err)
				}
				else
					$('#list').html(tmplItems({items: [json]}));
			});
		}
		else
			app.error('it is not a youtube link')
	}

	$('#list li .tit').first().trigger('click');
});

$('#pause').on('click', e => {
	audio$[0].pause();
	$('#playing').css('visibility','hidden');
});

$('#list')
.on('click','li .tit', e => {

	var li$ = $(e.currentTarget).parent('li'),
		url = li$.data('url');

	audio$.attr('src', location.origin+'/stream?url=' + url);
	audio$[0].play();
})
.on('click','li progress', e => {

	var li$ = $(e.currentTarget).parent('li'),
		duration = Number(li$.data('duration'))
		url = li$.data('url');

	const x = e.pageX - e.target.offsetLeft
    	, y = e.pageY - e.target.offsetTop
    	, perc = Math.round(x * e.target.max / e.target.offsetWidth, 2)

    audio$[0]._startime = Math.round((duration * perc)/100);

    const cur = sec2min(audio$[0]._startime);
    const params = $.param({
    	url,
    	startime: audio$[0]._startime
    });

    $(e.target).attr('value', perc);

    //TODO set startime
    audio$.attr('src', location.origin+'/stream?' + params);
	audio$[0].play();
});

async function paste(input) {

	if (navigator.clipboard) {
	  const text = await navigator.clipboard.readText();

	  if(text.substr(0,4)=='http') {
	  	input.value = text;
	  }
	  else {
	  	app.error('Not youtube url in clipboard')
	  }
	}
}

/*url$.on('focus', e => {

	paste(this);
});*/

//DEBUG
//if(location.hostname==='localhost') {
if(location.hash==='#debug') {
	setTimeout(()=>{
	//var lis = "https://www.youtube.com/playlist?list=PL-g83uREdYKIfm3mZOHpEKrQK10gaLZgH";
	var vid = "https://www.youtube.com/watch?v=0_RB5GNH6J4";

	url$.val(vid).trigger('focus');

	},100)
}