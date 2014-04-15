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

  /**
   * Commenting out COPPA pages and hard-wiring only existing
   * FxA account for now.
   * FIX: not executing .tap(), .click() on COPPA this page
   */

  /*
  test('should step through flow for new user', function () {
     //assert.ok(app.isConfirmedEmail(app.email) === false,
     //    'should be a new account!' );
     assert.ok(app.enterInput(selectors.emailInput, app.email) !== -1);
     assert.ok(app.onClick(selectors.moduleNext) !== -1);

     assert.ok(app.selectAgeSelect(selectors.COPPAOption) !== -1);
     assert.ok(app.onClick(selectors.moduleNext) !== -1);

     assert.ok(app.enterInput(selectors.passwordInput, app.password) !== -1);
     assert.ok(app.onClick(selectors.moduleNext) !== -1);
     assert.ok(app.onClick(selectors.moduleDone) !== -1);

     // INVALID PW
     //assert.ok(app.onClick(selectors.errorOK) !== -1);

     // DIAGNOSTIC
     //app.dumpPageSource();
  });
  */

  test('should step through flow for existing user', function () {
      app.isConfirmedEmail(app.email);
      //assert.ok(app.isConfirmedEmail(app.email) === false,
       //   'should be an existing account!');
      assert.ok(app.enterInput(selectors.emailInput, app.email) !== -1);
      assert.ok(app.onClick(selectors.moduleNext) !== -1);

      assert.ok(app.enterInput(selectors.passwordInput, app.password) !== -1);
      assert.ok(app.onClick(selectors.moduleNext) !== -1);

      assert.ok(app.onClick(selectors.moduleDone) !== -1);
  });

});  // end: marionette



