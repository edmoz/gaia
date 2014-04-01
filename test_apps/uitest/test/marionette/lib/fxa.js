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
    //apiFxaFrame: 'iframe[src*="tests_html/API/fxa.html"]',
    apiFxaFrame: 'test-iframe',
    fxaFrame:  'fxa-iframe'
    //duplicateHeader: '#title'
};

FxA.prototype = {
    /**
     * Launches FxA app and focuses on frame.
     */
    launch: function() {
        var client = this.client;
        client.apps.launch(FxA.URL);
        client.apps.switchToApp(FxA.URL);
        //this.client.helper.waitForElement(FxA.Selectors.bodyReady);
    },
    relaunch: function() {
        this.client.apps.close(FxA.URL, 'FxA');
        this.launch();
    },

    typeEmail: function(email) {
        this.client.helper
            //.waitForElement(Selector.composeEmailInput)
            .waitForElement("#fxa-email-input")
            .sendKeys(email);
    },


    /**
     * Returns a localized string from a properties file.
     * @param {String} file to open.
     * @param {String} key of the string to lookup.
     */
    l10n: function(file, key) {
        var string = this.client.executeScript(function(file, key) {
            var xhr = new XMLHttpRequest();
            var data;
            xhr.open('GET', file, false); // Intentional sync
            xhr.onload = function(o) {
                data = JSON.parse(xhr.response);
            };
            xhr.send(null);
            return data;
        }, [file, key]);

        return string[key]._;
    },

    waitForSlideDown: function(element) {
        var bodyHeight = this.client.findElement(FxA.Selectors.body).
            size().height;
        var test = function() {
            return element.location().y >= bodyHeight;
        };
        this.client.waitFor(test);
    },

    waitForSlideUp: function(element) {
        var test = function() {
            return element.location().y <= 0;
        };
        this.client.waitFor(test);
    },

    waitForFormShown: function() {
        var form = this.client.helper.waitForElement(FxA.Selectors.form),
            location;
        var test = function() {
            location = form.location();
            return location.y <= 0;
        };
        this.client.waitFor(test);
    },

    waitForFormTransition: function() {
        var selectors = FxA.Selectors,
            bodyHeight = this.client.findElement(selectors.body).size().height,
            form = this.client.findElement(selectors.form);
        var test = function() {
            var location = form.location();
            return location.y >= bodyHeight;
        };
        this.client.waitFor(test);
    },

    enterContactDetails: function(details) {

        var selectors = FxA.Selectors;

        details = details || {
            givenName: 'Hello',
            familyName: 'Contact'
        };

        this.waitForFormShown();

        for (var i in details) {
            // Camelcase details to match form.* selectors.
            var key = 'form' + i.charAt(0).toUpperCase() + i.slice(1);

            this.client.findElement(selectors[key])
                .sendKeys(details[i]);
        }

        this.client.findElement(selectors.formSave).click();

        this.waitForFormTransition();
    },

    addContact: function(details) {
        var selectors = FxA.Selectors;

        var addContact = this.client.findElement(selectors.formNew);
        addContact.click();

        this.enterContactDetails(details);

        this.client.helper.waitForElement(selectors.list);
    }

};

module.exports = FxA;
