'use strict';

var FxA = require('./../../../../../shared/test/marionette/lib/fxa');
var FxAUser = require('./../../../../../shared/test/marionette/lib/fxa_user');
var assert = require('assert');
//var SHARED_PATH = __dirname + '/../../../../shared/test/marionette/lib';

marionette('Launch test: FTU > FxA', function() {
    var app;
    var selectors;
    var fxaUser;
    var client = marionette.client();

    var clickThruPanel = function(panelId, buttonId) {
        if (panelId == '#wifi') {
            // The wifi panel will bring up a screen to show it is scanning for
            // networks. Not waiting for this to clear will blow test timing and cause
            // things to fail.
            client.helper.waitForElementToDisappear('#loading-overlay');
        }
        // waitForElement is used to make sure animations and page changes have
        // finished, and that the panel is displayed.
        client.helper.waitForElement(panelId);
        if (buttonId) {
            client.helper.wait(FxA.maxTimeInMS);
            var button = client.helper.waitForElement(buttonId);
            button.click();
        }
    };

    var runFTUMenu = function() {
        clickThruPanel('#languages', '#forward');
        clickThruPanel('#wifi', '#forward');
        clickThruPanel('#date_and_time', '#forward');
        clickThruPanel('#geolocation', '#forward');
        clickThruPanel('#import_contacts', '#forward');
        clickThruPanel('#firefox_accounts', selectors.createAccountOrLogin);

        this.client.switchToFrame();
        this.client.switchToFrame(FxA.Selectors.fxaFrame);
    };

    setup(function() {

        /**
         * String Origin of FTU app
         * @type {string}
         */
        var URL = 'app://communications.gaiamobile.org';
        //client.contentScript.inject(SHARED_PATH + '/fxa.js');

        app = new FxA(client, URL);
        selectors = FxA.Selectors;
        app.launch();
        app.runFTUMenu = runFTUMenu;
        app.runFTUMenu();
    });  // end: setup


    test('should step through flow for new user', function () {
        assert.ok(app.enterInput(selectors.emailInput, app.email) !== -1);
        assert.ok(app.onClick(selectors.moduleNext) !== -1);

        // FIX THIS:
        // Frackin marionette JS not tapping elements on COPPA page!!!!
        //assert.ok(app.selectAgeSelect(selectors.COPPAOption) !== -1);
        //assert.ok(app.onClick(selectors.moduleNext) !== -1);

        assert.ok(app.enterInput(selectors.passwordInput, app.password) !== -1);
        assert.ok(app.onClick(selectors.moduleNext) !== -1);
        assert.ok(app.onClick(selectors.moduleDone) !== -1);
        assert.ok(app.onClick('#forward') !== -1);
        //clickThruPanel('#firefox_accounts', '#forward');

        // INVALID PW
        //assert.ok(app.onClick(selectors.errorOK) !== -1);

        // DIAGNOSTIC
        //app.dumpPageSource();
    });

    /*
    teardown(function() {
        clickThruPanel('#welcome_browser', '#forward');
        clickThruPanel('#browser_privacy', '#forward');
        clickThruPanel('#finish-screen', undefined);
    });
    */


});
