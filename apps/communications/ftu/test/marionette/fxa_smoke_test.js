'use strict';

var FxA = require('./../../../../../shared/test/marionette/lib/fxa');
var FxAUser = require('./../../../../../shared/test/marionette/lib/fxa_user');
var assert = require('assert');
//var SHARED_PATH = __dirname + '/../../../../shared/test/marionette/lib';

marionette('Launch: FTU > FxA', function() {
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

        app.dumpPageSource();
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
        this.client.switchToFrame(selectors.fxaFrame);
    };

    var runFTUMenuTeardown = function() {
        app.dumpPageSource();
        for(var item in this.client.findElements('*')) {

            console.log(item);
            for (var name in item) {
              if (item.hasOwnProperty(name)) {
                console.log(name);
              }
            }
        }

        //this.client.switchToFrame();
        //this.client.switchToFrame(selectors.fxaFrame);
        //app.onClick("#forward")
        /*
        clickThruPanel('#firefox_accounts', '#navbar-next');
        clickThruPanel('#welcome_browser', '#forward');
        clickThruPanel('#browser_privacy', '#forward');
        clickThruPanel('#finish-screen', undefined);
        */
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
        app.runFTUMenuTeardown = runFTUMenuTeardown;
        app.runFTUMenu();
    });  // end: setup

    // COPPA page isn't working with .tap(), .click()
    // so, disabling for now

    test.skip('should be a new user account', function () {
      assert.ok(!app.accountExists(app.email), 'account already exists!');
    });

    test.skip('should step through flow for new user', function () {
        assert.ok(app.enterInput(selectors.emailInput, app.email) !== -1);
        assert.ok(app.onClick(selectors.moduleNext) !== -1);

        assert.ok(app.selectAgeSelect(selectors.COPPAOption) !== -1);
        assert.ok(app.onClick(selectors.moduleNext) !== -1);

        assert.ok(app.enterInput(selectors.passwordInput, app.password) !== -1);
        assert.ok(app.onClick(selectors.moduleNext) !== -1);
        assert.ok(app.onClick(selectors.moduleDone) !== -1);
        assert.ok(app.onClick('#forward') !== -1);
        //clickThruPanel('#firefox_accounts', '#forward');

        // DIAGNOSTIC
        //app.dumpPageSource();
    });

    test.skip('should be an existing user account', function () {
      assert.ok(app.accountExists(app.email), 'account doesn\'t exist yet!');
    });

    test('should step through flow for existing user', function () {
        assert.ok(app.enterInput(selectors.emailInput, app.email) !== -1);
        assert.ok(app.onClick(selectors.moduleNext) !== -1);

        assert.ok(app.enterInput(selectors.passwordInput, app.password) !== -1);
        assert.ok(app.onClick(selectors.moduleNext) !== -1);
        assert.ok(app.onClick(selectors.moduleDone) !== -1);
        app.runFTUMenuTeardown();
    });



});
