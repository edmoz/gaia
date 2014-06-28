'use strict';

var assert = require('assert'),
    constants = require('./constants');

/**
 * FxA user handler for email, password & string validation
 * @param client
 * @constructor
 */
function FxAUser(client) {
    this.client = client.scope({ searchTimeout: 20000 });
    this.mailHost = 'restmail.net';
}

FxAUser.maxTimeInMS = 3000;

FxAUser.prototype = {
    /**
     * create a unique email every time using a timestamp
     * convert timestamp to base 36 to shrink it down
     */
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
        email = this._uniqueUserName + '@' + this.mailHost;//restmail.net';
        //console.log('\n\t\tgenerating new account: ', email);
        return email;
    },

    /**
     * TODO:
     * enhance to allow for generation of a variety of "invalid" password strings
     * @returns {string}
     * @private
     */
    //_getPassword: function() {
    get _password() {
        return '12345678';
    },

    user: function(userType) {
      var user = new Object();
      switch(userType) {
          case constants.USER_NEW:
            user['email'] = this._email;
            user['password'] = this._password;
            break;
          //case constants.USER_EXISTING:
          default:
            //this user must already exist on dev,stage,prod
            user['email'] = 'ed111@restmail.net'; //'kilroy_exists' + '@' + this.mailHost;
            user['password'] = this._password;
            break;
      }
      return user;
    },

    _convertFromBaseToBase: function(str, fromBase, toBase){
        var num = parseInt(str, fromBase);
        return num.toString(toBase);
    }
};

module.exports = FxAUser;
