'use strict';

var FxA = require('./lib/fxa');
var assert = require('assert');

marionette('Launch UI Tests', function() {
  var app;
  var selectors;
  var client = marionette.client();

  setup(function() {
    app = new FxA(client);
    selectors = FxA.Selectors;
    app.launch();
    client.helper.wait(app.maxTimeInMS);


    client.findElement('#API', function(err, element) {
       if(err) {
          console.log("not found!!!");
       }
       element.click(function() {
         client.helper.wait(app.maxTimeInMS);
       });
    });

    client.findElement('#mozId-fxa', function(err, element) {
      if(err) {
        console.log("not found!!!");
      }
      element.click(function() {
        client.helper.wait(app.maxTimeInMS);
      });
    });

    client.switchToFrame(selectors.apiFxaFrame);

    client.findElement('#request', function(err, element) {
      if(err) {
        console.log("not found!!!");
      }
      element.click(function() {
        client.helper.wait(app.maxTimeInMS);
      });
    });

    client.switchToFrame();
    client.switchToFrame(FxA.Selectors.fxaFrame);
  });  // end: setup


  suite('Suite of tests', function() {

      test('should enter (valid) email - for new user', function () {

          assert.ok(app.typeEmail(FxA.EMAIL) !== -1);
          app.onClick(FxA.Selectors.fxaModuleNext);

          app.typePassword(FxA.PASSWORD);
          app.onClick(FxA.Selectors.fxaModuleNext);

          app.onClick(FxA.Selectors.fxaErrorOK);

          //assert.ok(app.typePassword("hadjiisageek") !== -1);
          //app.dumpPageSource();
      });
  }); // end: suite

});  // end: marionette



