#!/bin/bash
#
# get_nyt.sh
#   Script to get the latest NYT news feed file.  Downloads to temp_nyt.json and then moves to nyt.json.
#   Calls the Times Newswire API.  For more info see:
#
#     http://developer.nytimes.com/docs/read/times_newswire_api
#
#   Set in cron to run every minute.
#
DATA_DIR="../data/"
TEMP_DATA_FILE="${DATA_DIR}temp_nyt.json"
DATA_FILE="${DATA_DIR}nyt.json"
#URL="http://api.nytimes.com/svc/news/v3/all/recent.json?order=updated_date&api-key=<your Times Newswire API key>"
URL="http://api.nytimes.com/svc/news/v3/all/recent.json?order=updated_date&api-key=849377a612159d6f095e5b41fd683fd7%3a1%3a61208313"


# Check if this process is already running, if so just return.
process_count=$(ps -ef 2>/dev/null | grep -i get_nyt.sh | grep -v grep | wc -l)

if [ $process_count -gt 2 ]; then    
    exit
fi


# Create data directory if it doesn't exist.
if [ ! -d $DATA_DIR ]; then
  mkdir -p $DATA_DIR
fi

# Download the data file and save to temp file.
if [ -f $DATA_FILE ]; then
    /usr/bin/curl $URL --output $TEMP_DATA_FILE --remote-time --time-cond $DATA_FILE
else 
    /usr/bin/curl $URL --output $TEMP_DATA_FILE --remote-time 
fi

# Rename temp data file to permanent data file location (mv is atomic).
if  [ -f $TEMP_DATA_FILE ] && [ -n $TEMP_DATA_FILE ]; then
    mv $TEMP_DATA_FILE $DATA_FILE
fi

exit 0




