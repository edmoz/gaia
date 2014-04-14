'use strict';
/**
 * Abstraction around FxA app.
 * @constructor
 * @param {Marionette.Client} client for operations.
 */

var assert = require('assert');

function FxA(client) {
    //this.client = client;
    this.client = client.scope({ searchTimeout: 20000 });
}
/**
 * @type String Origin of FxA app
 */
FxA.URL = 'app://uitest.gaiamobile.org';

// EXISTING USER
//FxA.EMAIL = 'rmpappalardo@gmail.com';
//FxA.EMAIL = 'johnny.quest@restmail.net';

// NEW USER
FxA.EMAIL = 'race.bannon@restmail.net';

// INVALID USER - 3 periods are not good
//FxA.EMAIL = 'moz.johnny.quest@gmail.com';

FxA.PASSWORD = '12345678';

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
 * break off front-end specific selectors & functions so they can reside
 * with test_apps / apps
 * FxA specific stuff will eventually need to be shared and thus will live
 * in gaia/shared/test
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

    // fxa
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
        client.apps.launch(FxA.URL);
        client.apps.switchToApp(FxA.URL);
    },

    relaunch: function () {
        this.client.apps.close(FxA.URL, 'FxA');
        this.launch();
    },

    // test_apps/uitest
    selectFxaTest: function() {
        this.client.helper.wait(FxA.maxTimeInMS);
        assert.ok(this.onClick(FxA.Selectors.tabAPI) !== -1);
        assert.ok(this.onClick(FxA.Selectors.fxaButton) !== -1);
        client.switchToFrame(FxA.Selectors.apiFxaFrame);
        assert.ok(this.onClick(FxA.Selectors.requestButton) !== -1);

        this.client.switchToFrame();
        this.client.switchToFrame(FxA.Selectors.fxaFrame);
    },

    //
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
        var LINE = '*******************************************************************************';
        console.log(LINE + '\n' + dump + '\n' + LINE);
      });
    }
};

module.exports = FxA;
