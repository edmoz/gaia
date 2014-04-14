'use strict';

var FxA = require('./../../../../shared/test/marionette/lib/fxa');
var FxAUser = require('./../../../../shared/test/marionette/lib/fxa_user');
var assert = require('assert');
//var SHARED_PATH = __dirname + '/../../../../shared/test/marionette/lib';

marionette('Launch UITest > API > FxA', function() {
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
     * String Origin of FxA app
     * @type {string}
     */
    var URL = 'app://uitest.gaiamobile.org';
    //client.contentScript.inject(SHARED_PATH + '/fxa.js');

    var fxaNewUser = new FxAUser(client);
    fxaUser = fxaNewUser.newUser;

    app = new FxA(client, URL);
    app.runUITestMenu = runUITestMenu;
    selectors = FxA.Selectors;
    app.launch();
    app.runUITestMenu();
  });  // end: setup

  test('should step through flow for new user', function () {
     //app.validateEmail();
     assert.ok(app.enterInput(selectors.emailInput, fxaUser.email) !== -1);
     assert.ok(app.onClick(selectors.moduleNext) !== -1);

     // FIX THIS:
     // Marionette JS not tapping elements on COPPA page!!!!
     // Frack!!!
     //assert.ok(app.selectAgeSelect(selectors.COPPAOption) !== -1);
     //assert.ok(app.onClick(selectors.moduleNext) !== -1);

     assert.ok(app.enterInput(selectors.passwordInput, fxaUser.password) !== -1);
     assert.ok(app.onClick(selectors.moduleNext) !== -1);
     assert.ok(app.onClick(selectors.moduleDone) !== -1);

     // INVALID PW
     //assert.ok(app.onClick(selectors.errorOK) !== -1);

     // DIAGNOSTIC
     //app.dumpPageSource();

  });

  test('should step through flow for existing user', function () {
    assert.ok(app.enterInput(selectors.emailInput, fxaUser.email) !== -1);
    assert.ok(app.onClick(selectors.moduleNext) !== -1);

    assert.ok(app.enterInput(selectors.passwordInput, fxaUser.password) !== -1);
    assert.ok(app.onClick(selectors.moduleNext) !== -1);
    assert.ok(app.onClick(selectors.moduleDone) !== -1);

    // INVALID PW
    //assert.ok(app.onClick(selectors.errorOK) !== -1);
  });

});  // end: marionette



