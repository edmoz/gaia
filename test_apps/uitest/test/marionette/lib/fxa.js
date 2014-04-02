'use strict';
/**
 * Abstraction around FxA app.
 * @constructor
 * @param {Marionette.Client} client for operations.
 */
function FxA(client) {
    //this.client = client;
    this.client = client.scope({ searchTimeout: 20000 });

}
/**
 * @type String Origin of FxA app
 */
FxA.URL = 'app://uitest.gaiamobile.org';
FxA.EMAIL = 'moz.johnny.quest@gmail.com';
FxA.PASSWORD = 'hadjiisageek';

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

FxA.Selectors = {
    body: 'body',
    bodyReady: 'body .view-body',
    apiFxaFrame: 'test-iframe',
    fxaFrame:  'fxa-iframe',
    fxaEmailInput: '#fxa-email-input',
    fxaPasswordInput: '#fxa-pw-input',
    fxaPasswordSetInput: '#fxa-pw-set-input',
    fxaPasswordRefresh: '#fxa-pw-input-refresh',
    fxaModuleNext: '#fxa-module-next',
    fxaErrorOK: '#fxa-error-ok'
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

    typeEmail: function (email) {
        this.client.helper
            .waitForElement(FxA.Selectors.fxaEmailInput)
            .sendKeys(email)
        this.client.helper.wait(FxA.maxTimeInMS);
    },

    typePassword: function (password) {
        this.client.helper
            .waitForElement(FxA.Selectors.fxaPasswordInput)
            .sendKeys(password)
        this.client.helper.wait(FxA.maxTimeInMS);
    },

    onClick:  function (buttonId) {
        this.client.helper.wait(FxA.maxTimeInMS);
        this.client.findElement(buttonId, function(err, element) {
            if(err) {
                //console.log(buttonId + " not found!!!");
            } else {
                element.click(function () {
                    //console.log("clicking: " + buttonId)
                });
            }
        });
        this.client.helper.wait(FxA.maxTimeInMS);
    },

    /**
     * Returns a localized string from a properties file.
     * @param {String} file to open.
     * @param {String} key of the string to lookup.
     */
    l10n: function (file, key) {
        var string = this.client.executeScript(function (file, key) {
            var xhr = new XMLHttpRequest();
            var data;
            xhr.open('GET', file, false); // Intentional sync
            xhr.onload = function (o) {
                data = JSON.parse(xhr.response);
            };
            xhr.send(null);
            return data;
        }, [file, key]);

        return string[key]._;
    },

    dumpPageSource: function () {
      client.pageSource(function (err, dump) {
        console.log('****************************************');
        console.log(dump);
        console.log('****************************************');
      });
    }
};

module.exports = FxA;
