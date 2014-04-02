'use strict';

var FxA = require('./lib/fxa');
var assert = require('assert');

marionette('Launch UI Tests', function() {
  var app;
  var selectors;
  var client = marionette.client();
  var maxTimeInMS = 3000;

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
         //client.helper.wait(maxTimeInMS);
       });
    });

    client.findElement('#mozId-fxa', function(err, element) {
      if(err) {
        console.log("not found!!!");
      }
      element.click(function() {
        client.helper.wait(app.maxTimeInMS);
        //client.helper.wait(maxTimeInMS);
      });
    });

    client.switchToFrame(selectors.apiFxaFrame);
    console.log("switched to test-iframe");

    client.findElement('#request', function(err, element) {
      if(err) {
        console.log("not found!!!");
      }
      element.click(function() {
        client.helper.wait(maxTimeInMS);
      });


    });

    client.switchToFrame();
    client.switchToFrame(FxA.Selectors.fxaFrame);
  });  // end: setup


  suite('Suite of tests', function() {

      test('should enter (valid) email - for new user', function () {

          app.typeEmail(FxA.EMAIL);
          //assert.ok(url.indexOf(uiTestAppUrl) !== -1);

          app.onClick(FxA.Selectors.fxaModuleNext);

          //client.switchToFrame();
          //client.switchToFrame(FxA.Selectors.fxaFrame);

          //assert.ok(app.typePassword("hadjiisageek") !== -1);
          app.typePassword(FxA.PASSWORD);
          app.onClick(FxA.Selectors.fxaModuleNext);

          app.onClick(FxA.Selectors.fxaErrorOK);

          //app.dumpPageSource();
      });
  }); // end: suite

});  // end: marionette



