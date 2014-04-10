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

  test('should enter (valid) credentials - for new user', function () {

    assert.ok(app.typeEmail(FxA.EMAIL) !== -1);
    assert.ok(app.onClick(selectors.moduleNext) !== -1);
    assert.ok(app.typePassword(FxA.PASSWORD) !== -1);
    assert.ok(app.onClick(selectors.moduleNext) !== -1);
    assert.ok(app.onClick(selectors.errorOK) !== -1);

    //app.dumpPageSource();
  });

});  // end: marionette



