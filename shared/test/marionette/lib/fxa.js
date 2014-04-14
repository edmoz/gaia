'use strict';

var assert = require('assert');
//var FxAUser = require('./fxa_user');
/**
 * Abstraction around FxA app.
 * app URL is passed in since FxA isn't a standalone app
 * (launched by Settings, Marketplace, FTU, FMD, test_apps, etc.)
 * @param client
 * @param URL
 * @constructor
 */
function FxA(client, URL) {
    //this.client = client;
    this.client = client.scope({ searchTimeout: 20000 });
    this.URL = URL;
}

FxA.maxTimeInMS = 3000;

FxA.config = {
    settings: {
        // disable keyboard ftu because it blocks our display
        'keyboard.ftu.enabled': false,
        //'ftu.manifestURL': null,
        //'lockscreen.enabled': false
        // fxa is now preffed off by default
        'identity.fxaccounts.ui.enabled': true
    },
    prefs: {
        //'dom.w3c_touch_events.enabled': 1,
        // FxA-related prefs from sam
        'dom.identity.enabled': true,
        'toolkit.identity.debug': true,
        'dom.inter-app-communication-api.enabled': true,
        'dom.identity.syntheticEventsOk': true,
        // fxa is now preffed off by default
        //'identity.fxaccounts.ui.enabled': true,
        // enable debugging of certified/system apps
        'devtools.debugger.forbid-certified-apps': false,

        // this enables marionette which lets you run performance tests
        // see https://developer.mozilla.org/en-US/docs/Mozilla/Firefox_OS/Platform/Testing/Gaia_performance_tests
        'marionette.defaultPrefs.enabled': true,
        // this sets the port for remote debugging your application on the device
        'devtools.debugger.remote-port': 60000,
        // this enables the remote debugger
        'devtools.debugger.remote-enabled': true,
        // this outputs debug information about the Radio Interface Layer in logcat
        'ril.debugging.enabled': true
        //'devtools.debugger.forbid-certified-apps': false
    }
};

/*
 * TODO:
 * break off front-end specific selectors so they can reside
 * together with test_apps or apps
 */

FxA.Selectors = {
  body: 'body',
  bodyReady: 'body .view-body',

  // test_apps/uitest
  apiFxaFrame: 'test-iframe',
  fxaFrame:  'fxa-iframe',
  tabAPI: '#API',
  fxaButton: '#mozId-fxa',
  requestButton: '#request',

  // test_apps/test-fxa-client
  // apps/settings
  // apps/communications/ftu
  // apps/homescreen/everything.me/modules/Results/providers?? marketplace
  // apps/findmydevice

  // fxa - these will stay here
  emailInput: '#fxa-email-input',
  passwordInput: '#fxa-pw-input',
  passwordSetInput: '#fxa-pw-set-input',
  passwordRefresh: '#fxa-pw-input-refresh',
  COPPA: '#fxa-age-select',
  COPPAOption: 'option[value="1990"]',
  moduleNext: '#fxa-module-next',
  moduleDone: '#fxa-module-done',
  errorOK: '#fxa-error-ok'
};

FxA.prototype = {
    /**
     * Launches FxA app and focuses on frame.
     */
    launch: function () {
      var client = this.client;
      client.apps.launch(this.URL);
      client.apps.switchToApp(this.URL);
    },

    relaunch: function () {
      this.client.apps.close(this.URL, 'FxA');
      this.launch();
    },

    selectAgeSelect: function(selectOption) {
      this.client.helper.wait(FxA.maxTimeInMS);
      assert.ok(this.onClickLong(FxA.Selectors.COPPA) !== -1);
      //assert.ok(this.onClick('#fxa-year-of-birth') !== -1);
      this.client.helper.wait(FxA.maxTimeInMS);
      //assert.ok(this.onClick(selectOption) !== -1);
      this.client.helper.wait(FxA.maxTimeInMS);

      //this.client.findElement('#time-header a[href="/event/add/"]');
    },

    clickDone: function() {
      this.client.switchToFrame();
      this.client.switchToFrame(FxA.Selectors.fxaFrame);
      this.client.helper.wait(FxA.maxTimeInMS);
      assert.ok(this.onClick(FxA.Selectors.moduleDone) !== -1);
      this.client.helper.wait(FxA.maxTimeInMS);
      this.client.helper.wait(FxA.maxTimeInMS);
    },

    enterInput: function (inputId, inputString) {
      this.client.helper
          .waitForElement(inputId)
          .sendKeys(inputString)
      this.client.helper.wait(FxA.maxTimeInMS);
    },

    onClick:  function(elementId) {
      //this.client.helper.wait(FxA.maxTimeInMS);
      console.log("ELEMENT: " + elementId);
      this.client.helper
          .waitForElement(elementId)
          .tap();
    },

    /**
     * FIX:
     * This is a kludge to figure out why marionette JS tap()/click() isn't
     * working on COPPA page
     * Delete this function when done
     */
    onClickLong:  function(elementId) {
        //this.client.helper.wait(FxA.maxTimeInMS);
        this.dumpPageSource();
        console.log("long ELEMENT: " + elementId);
        //this.client.findElement("#fxa-age-select", function(err, element) {
        this.client.findElement(elementId, function(err, element) {
          if(err) {
            console.log(elementId + " not found");
          } else {
              console.log(elementId + " found");
          };
        });
        this.client.helper
            .waitForElement(elementId)
            .click();
    },

    dumpPageSource: function () {
      client.pageSource(function (err, dump) {
        var LINE = new Array(100).join('*');
        console.log(LINE + '\n' + dump + '\n' + LINE);
      });
    }

//    /**
//     * create a unique email every time using a timestamp
//     * convert timestamp to base 36 to shrink it down
//     */
//
//    _getUniqueUsername: function () {
//       var date = new Date();
//       var YYYY = date.getFullYear().toString().substr(2,2);
//       var MM = date.getMonth();
//       var DD = date.getDay();
//       var hh = date.getHours();
//       var mm = date.getMinutes();
//       var ss = date.getSeconds();
//       var uniqueNum = YYYY + MM + DD + hh + mm + ss;
//       uniqueNum = this._convertFromBaseToBase(uniqueNum, 10, 36);
//       return 'kilroy_' + uniqueNum;
//    },
//
//    _convertFromBaseToBase: function(str, fromBase, toBase){
//      var num = parseInt(str, fromBase);
//      return num.toString(toBase);
//    },
//
//    /**
//     * TODO:
//     * enhance this function to also allow for generation of
//     * a variety of "invalid" email strings
//     * strings
//     * @returns {string}
//     * @private
//     */
//    _getEmail: function() {
//      var email;
//      email = this._getUniqueUsername() + '@restmail.net';
//      // HARD-WIRING EXISTING EMAIL TIL COPPA ISSUE FIXED
//      email = 'rmpappalardo@gmail.com';
//      return email;
//    },
//
//    /**
//     * TODO:
//     * enhance this function to also allow for generation of
//     * a variety of "invalid" password strings
//     * @returns {string}
//     * @private
//     */
//    _getPassword: function() {
//        return '12345678';
//    },
//
//    getNewUser: function() {
//        var user = new Object();
//        user['email'] = this._getEmail();
//        user['password'] = this._getPassword();
//      return user;
//    },
//
//    validateEmail: function() {
//        var http = require('http');
//        var mailHost = 'http://restmail.net/';
//        //var client = http.request(3000, mailHost);
//        var params = 'mail/kilroy_nniwk3@restmail.net';
//        http.get(mailHost + params, function(res) {
//            console.log("Got response: " + res.statusCode);
//            res.setEncoding('utf8');
//            res.on('data', function (chunk) {
//                console.log('BODY: ' + chunk);
//            });
//        }).on('error', function(e) {
//            console.log("Got error: " + e.message);
//        });
//        /*
//        //var request = client.request('PUT', '/users/1');
//        //request.write("stuff");
//        var request = client.request('GET', params);
//        reques
//        request.write("stuff");
//        request.end();
//        request.on("response", function (response) {
//            // handle the response
//        });
//        */
//    }

};

module.exports = FxA;
