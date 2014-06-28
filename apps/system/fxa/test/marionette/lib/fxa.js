'use strict';

//var http = require('http');
var assert = require('assert');
var http = require('http');
//var FxAUser = require('./fxa:_user');
/**
 * Abstraction around FxA app.
 * app URL is passed in since FxA isn't a standalone app
 * (launched by Settings, Marketplace, FTU, FMD, test_apps, etc.)
 *
 * @param client
 * @param fxaUser
 * @constructor
 */
//function FxA(client, URL, fxaUser) {
function FxA(client, fxaUser) {
    //this.client = client;
    this.client = client.scope({ searchTimeout: 20000 });
    this.email = fxaUser.email;
    this.password = fxaUser.password;
    this.accountExists = false;
}

FxA.maxTimeInMS = 3000;
FxA._confirmationMessage = 'you are seconds away from verifying your Firefox Account';
FxA.mailHost = 'http://restmail.net/mail/';
FxA.SETTINGS_ORIGIN = 'app://settings.gaiamobile.org';
FxA.UITEST_ORIGIN = 'app://uitest.gaiamobile.org';
FxA.TEST_FXA_CLIENT_ORIGIN = 'app://test-fxa-client.gaiamobile.org';
FxA.FTU_ORIGIN = 'app://communications.gaiamobile.org';

var LEN_NO_MAIL = 10;

FxA.config = {
    settings: {
        // disable keyboard ftu because it blocks our display
        'keyboard.ftu.enabled': false,
        //'ftu.manifestURL': null,
        //'lockscreen.enabled': false
        'identity.fxaccounts.ui.enabled': true
    },
    prefs: {
        //'dom.w3c_touch_events.enabled': 1,
        // FxA-related prefs from sam
        'dom.identity.enabled': true,
        'toolkit.identity.debug': true,
        'dom.inter-app-communication-api.enabled': true,
        'dom.identity.syntheticEventsOk': true,
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
        'ril.debugging.enabled': true,
        //'devtools.debugger.forbid-certified-apps': false

        // pass in FxA server config when instantiating marionette
        // default:
        // dev
        // 'identity.fxaccounts.auth.uri': 'https://api-accounts.dev.lcip.org/v1'
        // stage
        //'identity.fxaccounts.auth.uri': 'https://api-accounts.stage.mozaws.net/v1'
        // prod
        //'identity.fxaccounts.auth.uri': 'https://api.accounts.firefox.com/v1';
    }
};

FxA.Selectors = {
    body: 'body',
    bodyReady: 'body .view-body',

    // test_apps/uitest
    apiFxaFrame: '#test-iframe',
    fxaFrame:  '#fxa-iframe',
    tabAPI: '#API',
    fxaButton: '#mozId-fxa',
    requestButton: '#request',

    // test_apps/test-fxa-client
    tabOpenFlow: '#openFlow',

    // apps/settings
    menuItemFxa: '#menuItem-fxa',
    menuItemFmd: '#menuItem-findmydevice',
    fxaLogin: '#fxa-login',
    fmdLogin: '#findmydevice-login',
    fxaCancelAccountConfirmation: '#fxa-cancel-confirmation',
    menuItemWifi: '#menuItem-wifi',
    wifiIconBack: 'span[class="icon icon-back"]',
    wifiToggleOnOff: 'span[data-l10n-id="wifi"]',

    // apps/communications/ftu
    forward: '#forward',
    createAccountOrLogin: '#fxa-create-account',

    // apps/homescreen/everything.me/modules/Results/providers?? marketplace
    // apps/findmydevice

    emailInput: '#fxa-email-input',
    pwInput: '#fxa-pw-input',
    pwInputPostCOPPA: '#fxa-pw-set-input',
    pwSetInput: '#fxa-pw-set-input',
    pwRefresh: '#fxa-pw-input-refresh',
    COPPAElementId: '#fxa-coppa',
    COPPASelectId: 'fxa-age-select',
    COPPAOptionVal: '1990 or earlier',
    COPPAOptionValToFail: '2002',
    moduleNext: '#fxa-module-next',
    moduleDone: '#fxa-module-done',
    errorOK: '#fxa-error-ok'
};

FxA.prototype = {
    /**
     * Launches FxA app and focuses on frame.
     */
    launch: function (origin) {
        var client = this.client;

        // do unless FTU
        if(origin.search("communications") === -1) {
            client.apps.launch(origin);
        }
        client.apps.switchToApp(origin);
    },

    relaunch: function (origin) {
        this.client.apps.close(origin, 'FxA');
        this.launch(origin);
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

    onClick:  function(searchSelector) {
        var element = this.client.findElement(searchSelector);
        this.client.helper
            .waitForElement(element)
            .tap();
    },

    /**
     * special click function for <select> tags
     * @param elementId
     * @param selectId
     * @param optionValue
     */
    onClickSelectOption:  function(elementId, selectId, optionValue) {
        //<select name="language.current"></select>
        //'languageChangeSelect': '#languages select[name="language.current"]',
        var searchSelector = elementId + ' select[id="' + selectId + '"]';
        var select = this.client.findElement(searchSelector);
        this.client.helper.tapSelectOption(select, optionValue);

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

        console.log("\n\t\tURL: " + url);
        var req = http.get(url, function(res, err) {
            res.setEncoding('utf8');
            var code = res.statusCode;
            //console.log(res.statusCode);

            if (res.statusCode === 200) {
              res.on('data', function (chunk) {
                chunks += chunk;
                console.log("CHUNKS: " + chunks);
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

    getAccountExists: function(email) {
        var chunks = '';
        var url = FxA.mailHost + email;

        this._getRestmail(FxA.mailHost +email, function(chunks) {
            if (chunks.length <= LEN_NO_MAIL) {
                console.log("\n\t\tNEW USER: no confirmation email");
            } else {
                console.log("\n\t\tEXISTING USER: confirmation email exists");
            }
        });
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
