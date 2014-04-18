'use strict';

//var http = require('http');
var assert = require('assert');
var http = require('http');
//var FxAUser = require('./fxa:_user');
/**
 * Abstraction around FxA app.
 * app URL is passed in since FxA isn't a standalone app
 * (launched by Settings, Marketplace, FTU, FMD, test_apps, etc.)
 * @param client
 * @param URL
 * @constructor
 */
function FxA(client, URL, fxaUser) {
    //this.client = client;
    this.client = client.scope({ searchTimeout: 20000 });
    this.URL = URL;
//    var fxaNewUser = new FxAUser(client);
//    var fxaUser = fxaNewUser.newUser;
    this.email = fxaUser.email;
    this.password = fxaUser.password;
}

FxA.maxTimeInMS = 3000;
FxA._confirmationMessage = 'you are seconds away from verifying your Firefox Account';
FxA.mailHost = 'http://restmail.net/mail/';
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
    tabOpenFlow: '#openFlow',
    //fxaButton: '#mozId-fxa',
    //requestButton: '#request',

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
    pwInput: '#fxa-pw-input',
    pwInputPostCOPPA: '#fxa-pw-set-input',
    pwSetInput: '#fxa-pw-set-input',
    pwRefresh: '#fxa-pw-input-refresh',
    COPPAElementId: '#fxa-coppa',
    COPPASelectId: 'fxa-age-select',
    COPPAOptionVal: '1990 or earlier',
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
        //console.log("\n\t\tELEMENT: " + elementId);
        this.client.helper
            .waitForElement(elementId)
            .tap();
    },

    /**
     * special click function for <select> tags
     * see:
     * apps/settings/elements/languages.html
     * apps/settings/test/marionette/app/regions/language.js
     * @param elementId
     * @param selectId
     * @param optionValue
     */
    onClickSelectOption:  function(elementId, selectId, optionValue) {
        //console.log("\n\t\tELEMENT: " + elementId);
        //<select name="language.current"></select>
        //'languageChangeSelect': '#languages select[name="language.current"]',
        var ageSelect = elementId + ' select[id="' + selectId + '"]';
        this.client.helper.tapSelectOption(ageSelect, optionValue);

        //TODO(rpappa)
        // fails without this wait time - bundle with above
        this.client.helper.wait(FxA.maxTimeInMS);
    },

    /**
     * TODO
     * check restmail.net server for confirmation email
     * http.get behaving inconsistently within marionette with restmail API
     * WIP
     * @param email
     * @returns {boolean}
     */

    _getRestmail: function(url, callback) {
        var chunk = '';
        var chunks = '';

        var url = 'http://restmail.net/mail/rmpappalardo16@restmail.net';

        var options = {
            host: 'restmail.net',
            path: '/mail/rmpappalardo16@restmail.net',
            headers: {'Cache-Control':'no-cache'},
            method: 'GET'
        };

        //var url = 'http://google.com/';
        console.log("\n\t\tURL: " + url);
        var req = http.get(options, function(err, res) {
            res.setEncoding('utf8');
            var code = res.statusCode;
            //console.log(res.statusCode);

            if (res.statusCode === 200) {
              res.on('data', function (chunk) {
                chunks += chunk;
                //console.log("CHUNKS: " + chunks);
              });
              res.on('end', function() {
                callback(chunks);
              });
            } else {
                console.log("server returned no status code");
            }

        }).on('error', function(e) {
            console.log("HTTP ERROR: " + e.message);
        });

        // send request
        req.end();
    },

    makeCallback: function(email) {
        var chunks = '';
        var url = FxA.mailHost + email;

        this._getRestmail(FxA.mailHost +email, function(chunks) {
            if (chunks.length <= LEN_NO_MAIL) {
                console.log("\n\t\tNEW USER: no confirmation email");
            } else {
                console.log("\n\t\tEXISTING USER: confirmation email exists");
            }
            //console.log("isConfirmed: ",isConfirmed);
        });
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
    dumpPageSource: function (fileName) {
        var path = fileName || "page_dump.html";
        var fs=require('fs');

        client.pageSource(function (err, dump) {
            var LINE = new Array(100).join('*');

            //console.log(LINE + '\n' + dump + '\n' + LINE);

            var buffer = new Buffer(dump);

            fs.open(path, 'w', function(err, fd) {
                if (err) {
                    throw 'error opening file: ' + err;
                } else {
                    fs.write(fd, buffer, 0, buffer.length, null, function(err) {
                        if (err) throw 'error writing file: ' + err;
                        fs.close(fd, function() {
                            console.log('\n', "page dumped to: ", path);
                        })
                    });
                }
            });
        });
    }
};

module.exports = FxA;
