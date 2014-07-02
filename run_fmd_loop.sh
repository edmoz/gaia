#!/usr/bin/env bash
# Needs Selenium/WebDriver running http://selenium-release.storage.googleapis.com/2.42/selenium-server-standalone-2.42.2.jar
# java -jar selenium-server-standalone-2.42.2.jar

export FXA_USER=ed111@restmail.net
export FXA_PASSWORD=12345678

for i in $(eval echo {1..$1})
do
echo $(date +"%T")
CT=`curl 'https://fmd.stage.mozaws.net/status/' | awk '{ print substr( $0, 15, 2 ) }'`
echo 'goroutines:'
echo $CT
if [ $CT -gt 99 ]
then
    echo 'too many goroutines'
    exit
fi

make test-integration-test TEST_FILES=apps/system/fxa/test/marionette/fmd_test.js > fmd_marionette.log 2>&1 &
sleep 20
python fmd_locate.py

sleep 120
done
