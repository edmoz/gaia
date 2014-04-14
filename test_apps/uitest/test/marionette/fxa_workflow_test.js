'use strict';

var FxA = require('./lib/fxa');
var assert = require('assert');

marionette('Launch FxA UI Tests', function() {
  var app;
  var selectors;
  var client = marionette.client();

  setup(function() {
    app = new FxA(client);
    selectors = FxA.Selectors;
    app.launch();
    app.selectFxaTest();

  });  // end: setup


  /*
   * look at apps/calendar/test/marionetter/today_test.js
   * defines scenarios in an array
   * then wraps tests in a forEach
   */

  test('should enter (valid) credentials - for new user', function () {
     var newUser = false;
     assert.ok(app.enterInput(selectors.emailInput, FxA.EMAIL) !== -1);
     assert.ok(app.onClick(selectors.moduleNext) !== -1);

     //if (newUser) {
         assert.ok(app.selectAgeSelect(selectors.COPPAOption) !== -1);
         assert.ok(app.onClick(selectors.moduleNext) !== -1);
     //}
     //assert.ok(app.typePassword(FxA.PASSWORD) !== -1);
     assert.ok(app.enterInput(selectors.passwordInput, FxA.PASSWORD) !== -1);
     assert.ok(app.onClick(selectors.moduleNext) !== -1);
     assert.ok(app.onClick(selectors.moduleDone) !== -1);

     // INVALID PW
     //assert.ok(app.onClick(selectors.errorOK) !== -1);

     // DIAGNOSTIC
     //app.dumpPageSource();
  });

});  // end: marionette



