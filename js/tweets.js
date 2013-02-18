var max_id_str = "";
var update_timer = null;
var heard_ids = new Array();

$(function() {
    $.ajaxSetup ({
        cache: true,      // Enable caching of AJAX responses
    });
    
    if (window.location.hash) {
	decoded_hash = decodeURIComponent(window.location.hash.substr(1));
	$("#twitter_query").val(decoded_hash);
    }

    $('#twitter_query').on("keypress", function(e) {
	max_id_str = "";
        if (e.keyCode == 13) {
	    exp = /#/ig;
	    escaped_hash = encodeURIComponent($("#twitter_query").val());
	    console.log("HASH: " . escaped_hash);
	    top.document.location.hash = escaped_hash;
	    // TODO: stop timer and call get_tweet and then start new timer
	    check_for_tweet();
            return false;
        }
    });

    update_timer = window.setTimeout(check_for_tweet, 4000);
});

function check_for_tweet() {
    if (update_timer != null) {
	window.clearInterval(update_timer)	
    }
    update_timer = window.setTimeout(check_for_tweet, 30000);    

    var query = "#NYC";
    if ($("#twitter_query").val() != "") {
	query = $("#twitter_query").val();
    }

    var url = "http://medianoche.us/yalt/tweets.jsonp?q=" + encodeURIComponent(query);
    if (max_id_str != "") {
	url += "&max_id=" + max_id_str;
    }
    if ((typeof console !== "undefined") && (typeof console.log !== "undefined")) {
	console.log("checking for tweets: " + url);
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
	if (data["max_id_str"] == "-1") {
	    return;
	} else {
	   // max_id_str = data["max_id_str"];
	}
        tweets = data['results'];
	
	for (i in tweets)  {
	    var tweet = tweets[i];
	    if ((typeof tweet !== "undefined") && (typeof tweet.id !== "undefined")) {
	    } else {
		continue;
	    }

	    var id = tweet["id"];
	    var text = tweet["text"];
	    // XXX: check if already read
	    if (heard_ids.indexOf(id) >= 0) {
		continue;
	    }
	    heard_ids.push(id);

	    var tweet_html = '<blockquote class="twitter-tweet"><p>' + text + '</p>&mdash; ' + tweet['from_user_name'] +
		' (@' + tweet['from_user'] + ') <a href="https://twitter.com/' + tweet['from_user'] + '/status/' + tweet['id_str'] + '">' +
		'February 16, 2013</a></blockquote> <script async src="http://platform.twitter.com/widgets.js" charset="utf-8"></script>';



	    $("#tweets_div").html(tweet_html);
	    read_tweet(text);
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


function read_tweet(audio_str) {

    if ((typeof audio_str == "undefined") || (audio_str == null) || (audio_str == "")) {
	return;
    }

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

