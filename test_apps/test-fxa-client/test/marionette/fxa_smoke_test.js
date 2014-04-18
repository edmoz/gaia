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
  var fxaNewUser = new FxAUser(client);
  var fxaUser = fxaNewUser.newUser;

  var runFxAClientTestMenu = function() {
    this.client.helper.wait(FxA.maxTimeInMS);
    assert.ok(this.onClick(selectors.tabOpenFlow) !== -1);

    this.client.switchToFrame();
    this.client.switchToFrame(selectors.fxaFrame);
  };

  setup(function() {
    var URL = 'app://test-fxa-client.gaiamobile.org';
    //client.contentScript.inject(SHARED_PATH + '/fxa.js');
    app = new FxA(client, URL, fxaUser);
    app.runFxAClientTestMenu = runFxAClientTestMenu;
    selectors = FxA.Selectors;
    app.launch();
    app.runFxAClientTestMenu();
  });  // end: setup

  test.skip('should be a new user account', function () {
    assert.ok(!app.accountExists(app.email), 'account already exists!');
  });

  test('should step through flow for new user', function () {
     assert.ok(app.enterInput(selectors.emailInput, app.email) !== -1);
     assert.ok(app.onClick(selectors.moduleNext) !== -1);

     app.onClickSelectOption(
         selectors.COPPAElementId,
         selectors.COPPASelectId,
         selectors.COPPAOptionVal);

     assert.ok(app.onClick(selectors.moduleNext) !== -1);
     assert.ok(app.enterInput(selectors.pwInputPostCOPPA, app.password) !== -1);
     assert.ok(app.onClick(selectors.moduleNext) !== -1);
     assert.ok(app.onClick(selectors.moduleDone) !== -1);
  });

  test.skip('should be an existing user account', function () {
    assert.ok(app.accountExists(app.email), 'account doesn\'t exist yet!');
  });

  test('should step through flow for existing user', function () {
    assert.ok(app.enterInput(selectors.emailInput, app.email) !== -1);
    assert.ok(app.onClick(selectors.moduleNext) !== -1);

    assert.ok(app.enterInput(selectors.pwInput, app.password) !== -1);
    assert.ok(app.onClick(selectors.moduleNext) !== -1);

    assert.ok(app.onClick(selectors.moduleDone) !== -1);
  });

});  // end: marionette



