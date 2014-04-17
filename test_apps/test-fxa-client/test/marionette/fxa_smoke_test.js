'use strict';

var FxA = require('./../../../../shared/test/marionette/lib/fxa');
var FxAUser = require('./../../../../shared/test/marionette/lib/fxa_user');
var assert = require('assert');
//var SHARED_PATH = __dirname + '/../../../../shared/test/marionette/lib';

marionette('Launch: Test FxA Client', function() {
  var app;
  var selectors;
  var fxaUser;
  var client = marionette.client();

  var runFxAClientTestMenu = function() {
    this.client.helper.wait(FxA.maxTimeInMS);
    assert.ok(this.onClick(selectors.tabOpenFlow) !== -1);

    this.client.switchToFrame();
    this.client.switchToFrame(selectors.fxaFrame);
  };

  setup(function() {
    var URL = 'app://test-fxa-client.gaiamobile.org';
    //client.contentScript.inject(SHARED_PATH + '/fxa.js');
    app = new FxA(client, URL);
    app.runFxAClientTestMenu = runFxAClientTestMenu;
    selectors = FxA.Selectors;
    app.launch();
    app.runFxAClientTestMenu();
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
     app.onClickCOPPA(selectors.COPPAOption);
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



