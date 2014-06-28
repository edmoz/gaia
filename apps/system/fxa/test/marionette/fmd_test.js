'use strict';

var FxA = require('./lib/fxa'),
    FxAUser = require('./lib/fxa_user'),
    Server = require('./lib/server'),
    constants = require('./lib/constants'),
    assert = require('assert');

var STAGE = process.env['FXA_URL'] || "https://api-accounts.stage.mozaws.net/v1";

marionette('Launch: FxA - Smoke Tests (app: settings, server: stage)', function() {
    var server = new Server('stage');
    FxA.config.prefs["identity.fxaccounts.auth.uri"] = STAGE;
    var client = marionette.client(FxA.config);
    var selectors;
    var app;
    var fxaUser;
    var userType = constants.USER_EXISTING;
    var fxa_user = process.env['FXA_USER'] || 'ed111@restmail.net';
    var fxa_pw = process.env['FXA_PASSWORD'] || '12345678';

    var runSettingsMenu = function() {
      // these waits are only to allow visual validation
      this.client.helper.wait(FxA.maxTimeInMS);
      assert.ok(this.onClick(selectors.menuItemFmd) !== -1);
      this.client.helper.wait(FxA.maxTimeInMS);
      assert.ok(this.onClick(selectors.fmdLogin) !== -1);

      this.client.switchToFrame();
      var frame = this.client.findElement(selectors.fxaFrame);
      this.client.switchToFrame(frame);
    };

    setup(function() {
        var fxaUserObj = new FxAUser(client);
        fxaUser = fxaUserObj.user(userType);
        app = new FxA(client, fxaUser);
        app.runSettingsMenu = runSettingsMenu;
        selectors = FxA.Selectors;
        app.launch(FxA.SETTINGS_ORIGIN);
        app.runSettingsMenu();
    });

    test('should walk flow for: Settings > Find My Device (existing user)', function () {
        assert.ok(app.enterInput(selectors.emailInput, fxa_user) !== -1);
        assert.ok(app.onClick(selectors.moduleNext) !== -1);

        assert.ok(app.enterInput(selectors.pwInput, fxa_pw) !== -1);
        assert.ok(app.onClick(selectors.moduleNext) !== -1);

        assert.ok(app.onClick(selectors.moduleDone) !== -1);
        client.switchToFrame();

        client.helper.wait(30*1000);
        // this is a dummy call - not sure why wait isn't
        assert.ok(app.onClick(selectors.menuItemFmd) !== -1);
    });

});  // end: marionette




