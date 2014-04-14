'use strict';

var assert = require('assert');

/**
 * FxA user handler for email, password & string validation
 * @param client
 * @constructor
 */
function FxAUser(client) {
    this.client = client.scope({ searchTimeout: 20000 });
}

FxAUser.maxTimeInMS = 3000;

FxAUser.prototype = {
    /**
     * create a unique email every time using a timestamp
     * convert timestamp to base 36 to shrink it down
     */

    //_getUniqueUsername: function () {
    get _uniqueUserName() {
        var date = new Date();
        var YYYY = date.getFullYear().toString().substr(2,2);
        var MM = date.getMonth();
        var DD = date.getDay();
        var hh = date.getHours();
        var mm = date.getMinutes();
        var ss = date.getSeconds();
        var uniqueNum = YYYY + MM + DD + hh + mm + ss;
        uniqueNum = this._convertFromBaseToBase(uniqueNum, 10, 36);
        return 'kilroy_' + uniqueNum;
    },

    /**
     * TODO:
     * enhance this function to also allow for generation of
     * a variety of "invalid" email strings
     * strings
     * @returns {string}
     * @private
     */
    //_getEmail: function() {
    get _email() {
        var email;
        //email = this._getUniqueUsername() + '@restmail.net';
        email = this._uniqueUsername + '@restmail.net';
        // HARD-WIRING EXISTING EMAIL TIL COPPA ISSUE FIXED
        email = 'rmpappalardo@gmail.com';
        return email;
    },

    /**
     * TODO:
     * enhance this function to also allow for generation of
     * a variety of "invalid" password strings
     * @returns {string}
     * @private
     */
    //_getPassword: function() {
    get _password() {
        return '12345678';
    },

    //getNewUser: function() {
    get newUser() {
        var user = new Object();
        user['email'] = this._email;
        user['password'] = this._password;
        return user;
    },

    /**
     * TODO
     */
    _validateEmail: function() {
        var http = require('http');
        var mailHost = 'http://restmail.net/';
        //var client = http.request(3000, mailHost);
        var params = 'mail/kilroy_nniwk3@restmail.net';
        http.get(mailHost + params, function(res) {
            console.log("Got response: " + res.statusCode);
            res.setEncoding('utf8');
            res.on('data', function (chunk) {
                console.log('BODY: ' + chunk);
            });
        }).on('error', function(e) {
            console.log("Got error: " + e.message);
        });
        /*
         //var request = client.request('PUT', '/users/1');
         //request.write("stuff");
         var request = client.request('GET', params);
         reques
         request.write("stuff");
         request.end();
         request.on("response", function (response) {
         // handle the response
         });
         */
    },

    _convertFromBaseToBase: function(str, fromBase, toBase){
        var num = parseInt(str, fromBase);
        return num.toString(toBase);
    }
};

module.exports = FxAUser;
