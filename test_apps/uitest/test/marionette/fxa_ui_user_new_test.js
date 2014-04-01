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
    client.helper.wait(maxTimeInMS);


    client.findElement('#API', function(err, element) {
       if(err) {
          console.log("API tab not found!!!");
       }

       element.click(function() {
         client.helper.wait(maxTimeInMS);
       });
    });

    client.findElement('#mozId-fxa', function(err, element) {
      if(err) {
        console.log("mozId-fxa not found!!!");
      }

      element.click(function() {
        client.helper.wait(maxTimeInMS);
      });
    });

    client.switchToFrame(selectors.apiFxaFrame);
    console.log("switched to test-iframe");

    client.findElement('#request', function(err, element) {
      if(err) {
        console.log("request not found!!!");
      }
      element.click(function() {
        client.helper.wait(maxTimeInMS);
      });

    });

    client.switchToFrame();
    client.switchToFrame("fxa-iframe");


    app.typeEmail("moz.johnny.quest@gmail.com");
      /*
    client.findElement('#fxa-email-input', function(err, element) {
      if(err) {
         console.log("email not found!!!");
      }
      console.log("email found!");
      element.click(function() {
        client.helper.waitForElement(element)
            .sendKeys('foo');
        });
        client.helper.wait(maxTimeInMS);
    });
    */

    client.helper.sendKeys("Johnny Tremendo", function(err, element) {
        if(err) {
            console.log('sending keys');
        }
    });
  });  // end: setup



  suite('Suite of tests', function() {
      test('should enter new (valid) user', function () {
          //var event = client.findElement('API-Tests');
          //var url = client.getUrl();
          //assert.ok(url.indexOf(uiTestAppUrl) !== -1);
      });
      test('should validate age', function () {
      });
      test('should enter (valid) password', function () {
      });

  }); // end: suite

});  // end: marionette



