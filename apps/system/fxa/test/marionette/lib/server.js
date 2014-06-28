function Server(type) {
  this._server_type = type;
}

Server.prototype = {
    /**
     * given server type, return uri for identity.fxaccounts.auth.uri
     *
     * @param type
     * @returns {string}
     */
  url: function(type) {
    var path;
    switch(type) {
      case "dev":
        path = 'api-accounts.dev.lcip.org/v1';
        break;
      case "stage":
        path = 'api-accounts.stage.mozaws.net/v1';
        break;
      default:
        path = 'api.accounts.firefox.com/v1';
        break;
  }
    return 'https://' + path;
  }
};

module.exports = Server;