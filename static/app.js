var url$ = $('#url');
var audio$ = $('#audio');
var err$ = $('#err');

Handlebars.registerHelper('sec2min', function(d) {
    d = Number(d);
    var h = Math.floor(d / 3600),
    	m = Math.floor(d % 3600 / 60),
    	s = Math.floor(d % 3600 % 60),
    	H = h > 0 ? h + ':' : '',
    	M = m + ':';
    function z(n) {return('0' + n).slice(-2);}
    return z(H) + z(M) + z(s)
});

var tmplItems = Handlebars.compile($('#list-items').html());

window.app = {
	errt: null,
	mode: 'video',//or 'playlist'
	err: function(m) {
		err$.text(m);
		clearTimeout(app.errt);
		app.errt = setTimeout(()=> {
			err$.text('')
		},3000);
	}
};


audio$.on('playing', function(e) {
	$('#playing').css('visibility','visible');
	
	var url = audio$.attr('src').split('url=')[1];

	$('#list li').removeClass('play');
	$('#list li[data-url="'+url+'"]').addClass('play')
})
.on('timeupdate', function() {
	var p = (this.currentTime / $('#list li.play').data('duration')) * 100;
   $('#list li.play progress').attr('value', p)
})
.on('paused', function(e) {
	$('#playing').css('visibility','hidden');
})
.on('ended', function(e) {
	var next$ = $('#list li.play').next('li');
	if(app.mode==='playlist' && next$.length) {
		next$.trigger('click');
	}
	$('#playing').css('visibility','hidden');
	$('#list li').removeClass('play');
});

$('#play').on('click', function(e) {
	try {
	var url = new URL($.trim($('#url').val()));
	}catch(err) {
		app.err(err.message)
	}
	if($('#list li').length==0) {
		if(url.pathname=='/playlist') {
			
			app.mode = 'playlist';

			$.getJSON(location.origin+'/playlist?url='+url, (json)=> {
				
				if(json.err){
					app.err(json.err);
				}
				else if(json.items.length)
					$('#list').html(tmplItems(json));
			});
		}
		else if(url.pathname=='/watch' || url.hostname=='youtu.be') {

			app.mode = 'video';

			$.getJSON(location.origin+'/video?url='+url, (json)=> {

				if(json.err) {
					app.err(json.err)
				}
				else
					$('#list').html(tmplItems({items: [json]}));
			});
		}
		else
			app.err('it is not a youtube link')
	}

	$('#list li').first().trigger('click');
});

$('#pause').on('click', function(e) {
	audio$[0].pause();
	$('#playing').css('visibility','hidden');
});

$('#list').on('click','li', function(e) {
	var li$ = $(e.currentTarget),
		url = li$.data('url');
	audio$.attr('src', location.origin+'/stream?url=' + url);
	audio$[0].play();
})

async function paste(input) {
  const text = await navigator.clipboard.readText();
  if(text.substr(0,4)=='http')
  	input.value = text;
}

url$.on('focus', function(e) {
	paste(this);
	setTimeout(()=> {
		$('#play').trigger('click');
	},100)
});

//DEBUG
if(location.hostname==='localhost')//location.hash=='#debug')
setTimeout(()=>{
var lis = "https://www.youtube.com/playlist?list=PL-g83uREdYKIfm3mZOHpEKrQK10gaLZgH";
var vid = "https://www.youtube.com/watch?v=Vm55LE4V3kY";

url$.val(lis).trigger('focus');

},100)