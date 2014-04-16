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
    get _email() {
        var email;
        email = this._uniqueUserName + '@restmail.net';
        // HARD-WIRING EXISTING EMAIL TIL COPPA ISSUE FIXED
        email = 'rmpappalardo15@restmail.net';
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

    _convertFromBaseToBase: function(str, fromBase, toBase){
        var num = parseInt(str, fromBase);
        return num.toString(toBase);
    }
};

module.exports = FxAUser;
