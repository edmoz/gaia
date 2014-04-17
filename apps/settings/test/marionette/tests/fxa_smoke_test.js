/**
 *
 * Created by rpappalardo on 4/14/14.
 */

'use strict';

var FxA = require('./../../../../../shared/test/marionette/lib/fxa');
var FxAUser = require('./../../../../../shared/test/marionette/lib/fxa_user');
var assert = require('assert');
//var SHARED_PATH = __dirname + '/../../../../shared/test/marionette/lib';

marionette('Launch: Settings > FxA Test', function() {
    var app;
    var selectors;
    var fxaUser;
    var client = marionette.client();

    var runSettingsMenu = function() {
        this.client.helper.wait(FxA.maxTimeInMS);
        assert.ok(this.onClick(FxA.Selectors.menuItemFxa) !== -1);
        this.client.helper.wait(FxA.maxTimeInMS);
        assert.ok(this.onClick(FxA.Selectors.fxaLogin) !== -1);

        this.client.switchToFrame();
        this.client.switchToFrame(FxA.Selectors.fxaFrame);
    };

    setup(function() {

        /**
         * String Origin of FxA app
         * @type {string}
         */
        var URL = 'app://settings.gaiamobile.org';
        //client.contentScript.inject(SHARED_PATH + '/fxa.js');

        app = new FxA(client, URL);
        app.runSettingsMenu = runSettingsMenu;
        selectors = FxA.Selectors;
        app.launch();
        app.runSettingsMenu();
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
    });

});  // end: marionette




