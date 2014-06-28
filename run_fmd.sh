#!/usr/bin/env bash
# Needs Selenium/WebDriver running http://selenium-release.storage.googleapis.com/2.42/selenium-server-standalone-2.42.2.jar
# java -jar selenium-server-standalone-2.42.2.jar

export FXA_USER=ed111@restmail.net
export FXA_PASSWORD=12345678

echo 'launching marionette.js'
make test-integration-test TEST_FILES=apps/system/fxa/test/marionette/fmd_test.js > fmd_marionette.log 2>&1 &
echo 'sleep 20'
sleep 20
echo 'launching fmd stage'
echo 'notice the geolocation icon in the fxOS status bar, when push message sent'
echo 'leaving windows open so you can interact'
python fmd_locate.py
