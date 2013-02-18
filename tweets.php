<?php
/**
 * tweets.php - Wrapper around Twitter search service.  Supports json and jsonp.
 *   tweets.json?q=<query>
 *     
 *   | Parameter | Description                       | Notes    |
 *   |-----------|-----------------------------------|----------|
 *   | q         | Query for Twitter search.         | Required |
 *   | callback  | Function name for jsonp callback. | Optional |
 *   | max_id    | The max_id from the last search.  | Optional |
 */
require_once("common.php");


$format = "json";
$callback="callback";
$query = "#nytimes";
$max_id = "";
if (!empty($_GET['q'])) {
    $query = $_GET['q'];
}
if (!empty($_GET['callback'])) {
    $callback = $_GET['callback'];
}
if (!empty($_GET['max_id'])) {
    $max_id = $_GET['max_id'];
}


$path_parts = pathinfo($_SERVER['SCRIPT_URL']);
$format = $path_parts['extension'];

if ($format == "json") {
    header('Content-type: application/json');
} else if ($format == "jsonp") {
    header('Content-type: application/javascript');
    if (empty($callback)) {
        send_response(null, "json", 400, '{"status": "error", "code": 400, "message":"jsonp requires a callback function name be set."}');
    }           
} else {
    header('Content-type: application/json');      
    send_response (null, "json", "415", '{"status": "error", "code": 415, "message":"Unsupported response format ' . $format . '."}');
    exit(0);
}



$url = "http://search.twitter.com/search.json?lang=en&result_type=recent&q=" . urlencode($query);
if (!empty($max_id)) {
    $url .= "&since_id=" . $max_id;
}

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_HEADER, false);
curl_setopt($ch,CURLOPT_CONNECTTIMEOUT,10);
curl_setopt($ch,CURLOPT_RETURNTRANSFER,1);
curl_setopt($ch,CURLOPT_SSL_VERIFYPEER,false);
curl_setopt($ch,CURLOPT_SSL_VERIFYHOST,false);

if (!($response_data = curl_exec($ch))) {
    send_response($url, $format, 502, '{"status":"error", "code": 502, "message":"Problem curling Twitter search service. ' . curl_error($ch) . '"}', $callback);
} else {
    send_response($url, $format, 200, $response_data, $callback);
}
curl_close($ch);


function send_response($url, $format, $code, $response, $callback = NULL) {
    http_response_code($code);
    // add the url we called to the response
    if (!empty($url)) {
        $response[0] = ",";
        $response = '{"twitter_search_url":"' . $url . '"' . $response;
    }
    if ($format == "jsonp") {
        print $callback . "(\n" . $response . "\n)\n";
        exit(0);
    }
    print  $response;  
}






?>

