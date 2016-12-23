var basicAuth = require('basic-auth');
var dao = require('./inmemorydao.js');

exports.basicAuth = function(username, password) {
  return function(req, res, next) {
    var user = basicAuth(req);
    if(user !== undefined){
      var userObject = dao.getUserById(user.name);
    }
    if(userObject == undefined) {
      if (!user || user.name !== username || user.pass !== password) {
        res.set('WWW-Authenticate', 'Basic realm=Authorization Required');
        return res.sendStatus(401);
      }
    } else {
      var objectUsername = userObject.id;
      var objectPassword = userObject.password;

      if(user.pass !== objectPassword){
        res.set('WWW-Authenticate', 'Basic realm=Authorization Required');
        return res.sendStatus(401);
      }
    }
    req.authenticatedUser = userObject;
    next();
  };
};
