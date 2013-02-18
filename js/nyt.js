var update_timer = null;
var heard_articles = new Array();

$(function() {
    $.ajaxSetup ({
        cache: true,      // Enable caching of AJAX responses
    });
    
    update_timer = window.setTimeout(check_for_headlines, 4000);
});

function check_for_headlines() {
    if (update_timer != null) {
	window.clearInterval(update_timer)	
    }
    update_timer = window.setTimeout(check_for_headlines, 120000);    

    var url = "http://api.nytimes.com/svc/news/v3/all/recent.jsonp?api-key=849377a612159d6f095e5b41fd683fd7%3a1%3a61208313&order=updated_date";

    if ((typeof console !== "undefined") && (typeof console.log !== "undefined")) {
	console.log("checking for headlines: " + url);
    }
    $.ajax({
	type: 'GET',	
	url: url,
	crossDomain: true,
	dataType: 'jsonp',
	jsonpCallback: "callback"
    }).done(function ( data ) {
        if ((typeof console !== "undefined") && (typeof console.log !== "undefined")) {
            console.log("GET:", url);
            console.log("Data:", data);
        }

        var articles = data['results'];
	for (i in articles)  {
	    var article = articles[i];
	    var url = article["url"];
	    if (heard_articles.indexOf(url) >= 0) {
		continue;
	    }
	    if (article['section'] == "Corrections") {
		continue;
	    }
	    heard_articles.push(url);

	    var photo_html = "";
	    if (typeof article['multimedia'] !== "undefined") {
		var photos = article['multimedia'];
		for (pi in photos)  {
		    var photo = photos[pi];
		    if (photo['format'] == "Standard Thumbnail") {
			photo_html = "<td><a href='" + article['url'] + "' target='_blank'><img src='" + photo['url'] + "'/></a></td>";
			break;
		    }
		}
	    }

	    var article_html = "<div class='nyt_article'><table border='0' cellpadding='4' cellspacing='0'><tr><td>" +
		"<span class='headline'><a href='" + article['url'] + "' target='_blank'>" + article['title'] + "</a></span><br/><span class='byline'>" + 
		article['byline'] + "</span>" +
		"</td>" +
		photo_html +
		"</tr>" +
		"<tr><td colspan='2'><span class='summary'>" + article['abstract'] + "</span></td></tr></table></div>";

	    $("#nyt_headlines_div").prepend(article_html);
	    read_headline(article['title'] + " " + article['abstract']);

	    break;
        }

    }).fail(function ( jqXHR ) {            
	var error_message = jqXHR["statusText"] + ", " + jqXHR["status"];

        if (jqXHR["responseText"] != undefined) {
	    var response_text = eval('(' + jqXHR["responseText"] + ')');
            error_message += ", " + response_text["errors"];
        }

        if ((typeof console !== "undefined") && (typeof console.log !== "undefined")) {
            console.log(error_message);
        }
    });                  

}


function read_headline(audio_str) {

    if ((typeof audio_str == "undefined") || (audio_str == null) || (audio_str == "")) {
	return;
    }

    /* remove HTML */
    audio_str = removeHTML(audio_str);

    /* remove urls */
    var exp = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
    audio_str = audio_str.replace(exp,""); 

    /* remove special characters */
    //exp = /\./ig;
    //audio_str = audio_str.replace(exp," ");
    exp = /\//ig;
    audio_str = audio_str.replace(exp," ");
    exp = /#/ig;
    audio_str = audio_str.replace(exp,"");
    exp = /@/ig;
    audio_str = audio_str.replace(exp,"");
    //audio_str = audio_str.replace("'","");
    //audio_str = audio_str.replace("-"," ");
    //audio_str = audio_str.replace(":",",");

    if ((typeof console !== "undefined") && (typeof console.log !== "undefined")) {
	console.log ("reading string: " + audio_str);
    }

    //var url = "http://translate.google.com/translate_tts?ie=utf-8&tl=en&q=" + encodeURI(audio_str);
    //var url = "http://tts.duolingo.com/tts/speak/en/" + encodeURI(audio_str);
    var url = "http://tts-api.com/tts.mp3?q=" + encodeURI(audio_str);

    $("#tts_player_div").html('<audio id="headline_player" autoplay="autoplay"><source src="' + url + '" type="audio/mpeg"></audio>');
}


function getQueryString (name) {
  return unescape(window.location.search.replace(new RegExp("^(?:.*[&\\?]" + escape(name).replace(/[\.\+\*]/g, "\\$&") + "(?:\\=([^&]*))?)?.*$", "i"), "$1"));
}


function replaceURLWithHTMLLinks(text) {
    var exp = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
    return text.replace(exp,"<a href='$1' target='_blank'>$1</a>"); 
}

function removeHTML(html)
{
   var tmp = document.createElement("DIV");
   tmp.innerHTML = html;
   return tmp.textContent||tmp.innerText;
}

if(!Array.prototype.indexOf) {
    Array.prototype.indexOf = function(needle) {
        for(var i = 0; i < this.length; i++) {
            if(this[i] === needle) {
                return i;
            }
        }
        return -1;
    };
}

