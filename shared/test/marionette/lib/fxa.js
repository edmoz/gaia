'use strict';

//var http = require('http');
var assert = require('assert');
var http = require('http');
var FxAUser = require('./fxa_user');
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
    var fxaNewUser = new FxAUser(client);
    var fxaUser = fxaNewUser.newUser;
    this.email = fxaUser.email;
    this.password = fxaUser.password;
}

FxA.maxTimeInMS = 3000;
FxA._confirmationMessage = 'you are seconds away from verifying your Firefox Account';
FxA._mailHost = 'http://restmail.net/mail/';
var LEN_NO_MAIL = 10;

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
    menuItemFxa: '#menuItem-fxa',
    fxaLogin: '#fxa-login',

    // apps/communications/ftu
    forward: '#forward',
    createAccountOrLogin: '#fxa-create-account',

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

        // do unless FTU
        if(this.URL.search("communications") === -1) {
            client.apps.launch(this.URL);
        }
        client.apps.switchToApp(this.URL);
    },

    relaunch: function () {
        this.client.apps.close(this.URL, 'FxA');
        this.launch();
    },

    selectAgeSelect: function(selectOption) {
        this.client.helper.wait(FxA.maxTimeInMS);
        assert.ok(this.onClickFrack(FxA.Selectors.COPPA) !== -1);
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
    },

    enterInput: function (inputId, inputString) {
        this.client.helper
            .waitForElement(inputId)
            .sendKeys(inputString)
        this.client.helper.wait(FxA.maxTimeInMS);
    },

    onClick:  function(elementId) {
        console.log("ELEMENT: " + elementId);
        this.client.helper
            .waitForElement(elementId)
            .tap();
    },

    /**
     * FIX:
     * This is a kludge to figure out why Frackin marionette JS tap()/click() isn't
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

    /**
     * check restmail.net server for confirmation email
     * @param email
     * @returns {boolean}
     */

    _getRestmail: function(url, callback) {
        var chunk = '';
        var chunks = '';

        console.log("URL: " + url);
        http.get(url, function(res){
            res.setEncoding('utf8');

            res.on('data', function (chunk) {
              chunks += chunk;
            });

            res.on('end', function() {
              if (chunks.length <= LEN_NO_MAIL) {
                //console.log("NEW USER: no confirmation email");
                callback(false);
              } else {
                //console.log("EXISTING USER: confirmation email exists");
                callback(true);
              }
            });
        }).on('error', function(e) {
            console.log("HTTP ERROR: " + e.message);
        });
    },

    accountExists: function(email) {
      var url = FxA._mailHost + email;

      this._getRestmail(url, function(isConfirmed) {
          return isConfirmed
      })

    },

    /**
     * TODO
     * cleanup restmail email
     * cleanup FxA account
     * @param email
     */
    _deleteRestmail: function(email) {
        /*
         //var request = client.request('PUT', '/users/1');
         //request.write("stuff");
         var request = client.request('GET', params);
         reques
         request.write("stuff");
         request.end();
         request.on("response", function (response) {
         // handle the response
         });
         */
    },

    /**
     * diagnostic only
     */
    dumpPageSource: function () {
        client.pageSource(function (err, dump) {
            var LINE = new Array(100).join('*');
            console.log(LINE + '\n' + dump + '\n' + LINE);
        });
    }
};

module.exports = FxA;
