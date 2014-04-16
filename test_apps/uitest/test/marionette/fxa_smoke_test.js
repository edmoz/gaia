'use strict';

var FxA = require('./../../../../shared/test/marionette/lib/fxa');
var FxAUser = require('./../../../../shared/test/marionette/lib/fxa_user');
var assert = require('assert');
//var SHARED_PATH = __dirname + '/../../../../shared/test/marionette/lib';

marionette('Launch test: UITest > API > FxA', function() {
  var app;
  var selectors;
  var fxaUser;
  var client = marionette.client();

  var runUITestMenu = function() {
    this.client.helper.wait(FxA.maxTimeInMS);
    assert.ok(this.onClick(FxA.Selectors.tabAPI) !== -1);
    assert.ok(this.onClick(FxA.Selectors.fxaButton) !== -1);
    client.switchToFrame(FxA.Selectors.apiFxaFrame);
    assert.ok(this.onClick(FxA.Selectors.requestButton) !== -1);

    this.client.switchToFrame();
    this.client.switchToFrame(FxA.Selectors.fxaFrame);
   };

  setup(function() {

    /**
     * String Origin of UITest app
     * @type {string}
     */
    var URL = 'app://uitest.gaiamobile.org';
    //client.contentScript.inject(SHARED_PATH + '/fxa.js');

    app = new FxA(client, URL);
    app.runUITestMenu = runUITestMenu;
    selectors = FxA.Selectors;
    app.launch();
    app.runUITestMenu();
  });  // end: setup

   test('should be a new user account', function () {
     assert.ok(!app.accountExists(app.email), 'account already exists!');
   });

  // COPPA page isn't working with marionette js .tap(), .click()
  // so, disabling for now
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

  test('should be an existing user account', function () {
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



