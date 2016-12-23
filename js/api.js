var _ = require('lodash');
var express = require('express');
var bodyParser = require('body-parser');
var validator = require('validator');
var model = require('./model.js');
var dao = require('./inmemorydao.js');
var utils = require('./utils');


(function() {

  module.exports = {
    runApp: runApp,
    configureApp: configureApp, // separates out from runApp for testing
    getDissertations : getDissertations, // new
    getDissertationById : getDissertationById,
    createDissertation : createDissertation,
    deleteDissertation : deleteDissertation,
    updateDissertation : updateDissertation,
    getUsers : getUsers,
    getUserById : getUserById,
    getStaffMembers : getStaffMembers,
    createNewUser : createNewUser,
    deleteUser : deleteUser,
    updateUser : updateUser,
    storeUserInterests : storeUserInterests,
    showInterestToDissertation : interestInDissertation,
    ApiError: ApiError
  };

  function runApp() {
    var app = express();
    configureApp(app);
    app.use('/here', function(req,res,next){
      userObject = req.authenticatedUser;
      res.end('Logged in: ' + userObject.id + '!')
    });
    app.use(express.static('content'));
    app.listen(8080);
  }

  runApp();

  function configureApp(app) {

    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(bodyParser.json());
    app.use('/', utils.basicAuth('admin', 'admin'));
    app.get('/dissertations', getDissertations);
    app.get('/dissertation/id/:id', getDissertationById),
        app.delete('dissertation/id/:id', deleteDissertation),
    app.post('/dissertation', createDissertation),
        app.get('/users', getUsers);
    app.get('/user/id/:id', getUserById),
        app.get('/staffUsers', getStaffMembers),
        app.post('/user', createNewUser),
        app.delete('/user/id/:id', deleteUser),
        app.post('/user/id/:id', updateUser)
    app.post('/dissertation/:id/allocation/:userid', storeUserInterests)
    app.post('/dissertation/:id/interest/:userid', interestInDissertation),
        app.use(express.static('static'));
  }


  /***********************************************************************************
   * Handler Functions
   ***********************************************************************************/


  function getUsers(request, response){
    var users = dao.getUsers();

    response.writeHead(200, [{'content-type': 'application/json'}]);

    response.end(JSON.stringify(users));
  }


  function getDissertations(request, response){  //new it works
    var dissertations = dao.getDissertations();


    var json = JSON.stringify(dissertations, function (key, value) {
      if(key == 'entry'){
        return undefined;
      }
      else{
        return value;
      }
    })


    response.writeHead(200, [{'content-type': 'application/json'}]);
    response.end(json);
  }


  function getStaffMembers(request, response){

    var staffMembers = dao.getStaffMembers();
    var json = JSON.stringify(staffMembers, function (key, value) {
      if(key == 'entry'){
        return undefined;
      }
      else{
        return value;
      }
    })


    response.writeHead(200, [{'content-type': 'application/json'}]);
    response.end(json);
  }

  function getDissertationById(request, response){
    var id = Number(request.params.id);
    if(isNaN(id)){
      response.writeHead(400);
      response.end('');
      return;
    }

    var dissertation = dao.getDissertationById(id);


    if(dissertation == undefined){
      response.writeHead(404);
      response.end('');
      return;
    }
    response.writeHead(200, [{'content-type': 'application/json'}]);
    response.end(JSON.stringify(dissertation));
  }



  function getUserById(request, response){
    var user = dao.getUserById(request.params.id);
    if(user == undefined){
      response.writeHead(404);
      response.end('');
      return;
    }

    response.writeHead(200, [{'content-type': 'application/json'}]);

    response.end(JSON.stringify(user));
  }

  function createDissertation(request, response){

    if(request.body.length <= 2) { // 2 means it empty
      response.writeHead(400);
      response.end('No body in request.');
      return;
    }

    var json;
    try {
      json = request.body;
    }
    catch (err){
      response.writeHead(400);
      response.end(JSON.stringify(err));
      return;
    }

    dao.storeDissertation(json);
    response.writeHead(201, [{'content-type': 'application/json'}]);
    response.end(json);

  }

  function createNewUser(request, response){

    if(request.body.length <= 2) { // 2 means it empty
      response.writeHead(400);
      response.end('No body in request.');
      return;
    }
    var json;
    try {
      json = request.body;
    }
    catch (err){
      response.writeHead(400);
      response.end(JSON.stringify(err));
      return;
    }

    var user = request.params;


    if(typeof user == 'undefined') {
      response.writeHead(404);
      response.end('not found');
      return;
    } else {
      if(user.role === "admin"){
        dao.storeUser(json);
        response.writeHead(201, [{'content-type': 'application/json'}]);
        response.end(json);
      } else {
        response.writeHead(400);
        response.end('wrong user');
        return;
      }
    }
  }

  function updateUser(request, response){

    if(!('body' in request) || request.body.length <=2){
      response.writeHead(400);
      response.end('No body in request.');
      return;
    }


    var object;
    try {
      object = request.body;
    } catch(err) {
      response.writeHead(400);
      response.end(JSON.stringify(err));
      return;
    }
    var id = request.params.id;
    var user = dao.getUserById(id);
    var admin = request.params.admin;

    if(typeof user == 'undefined') {
      response.writeHead(404);
      response.end('not found');
      return;
    }

    object = JSON.parse(object);
    object = object[Object.keys(object)[1]];


    if('id' in object){
      response.writeHead(400);
      return;
    }

    if(typeof admin == 'undefined') {
      response.writeHead(404);
      response.end('not found');
      return;
    } else {
      if(admin.role === "admin"){
        _.merge(user, object);

        response.writeHead(200, [{'content-type': 'application/json'}]);
        response.end(JSON.stringify(user));
      } else {
        response.writeHead(400);
        response.end('wrong user');
        return;
      }
    }

  }

  function interestInDissertation(request, response){
    if(!('body' in request) || request.body.length <= 2) {

      response.writeHead(400);
      response.end('No body in request.');
      return;
    }
    var object;
    try {
      object = request.body;
    } catch(err) {
      response.writeHead(400);
      response.end(JSON.stringify(err));
      return;
    }
    var idUser = request.params.idUser;
    var idDissertation = request.params.idDiss;
    var dissertation = dao.getDissertationById(idDissertation);
    var user = dao.getUserById(idUser);
    var userToCheck = request.params.userChecked;



    if(typeof userToCheck == 'undefined') {
      response.writeHead(404);
      response.end('not found');
      return;
    } else {
      if(userToCheck.id === idUser){

        response.writeHead(200, [{'content-type': 'application/json'}]);
        response.end(JSON.stringify(dissertation));
      } else {
        response.writeHead(400);
        response.end('wrong user');
        return;
      }
    }
  }

  function storeUserInterests(request, response){
    if(!('body' in request) || request.body.length <= 2) {
      response.writeHead(400);
      response.end('No body in request.');
      return;
    }
    var object;
    try {
      object = request.body;
    } catch(err) {
      response.writeHead(400);
      response.end(JSON.stringify(err));
      return;
    }

    var id = request.params.id;
    var user = dao.getUserById(id);
    var userToCheck = request.params.user;


    if(typeof user == 'undefined') {
      response.writeHead(404);
      response.end('not found');
      return;
    }

    object = JSON.parse(object);

    if(typeof userToCheck == 'undefined') {
      response.writeHead(404);
      response.end('not found');
      return;
    } else {
      if(userToCheck.id === id){
        dao.addDissertationToUser(object, id);

        response.writeHead(200, [{'content-type': 'application/json'}]);
        response.end(JSON.stringify(object));
      } else {
        response.writeHead(400);
        response.end('wrong user');
        return;
      }
    }



  }

  function updateDissertation(request, response){
    if(!('body' in request) || request.body.length <= 2) { // 2 means its empty
      response.writeHead(400);
      response.end('No body in request.');
      return;
    }
    var object;
    try {
      object = request.body;
    } catch(err) {
      response.writeHead(400);
      response.end(JSON.stringify(err));
      return;
    }
    var id = request.params.id; // take id from path element
    var dissertation = dao.getDissertationById(id);
    var user = request.params.user;
    if(typeof dissertation == 'undefined') {
      response.writeHead(404);
      response.end('not found');
      return;
    } else {
      var proposer = dissertation.proposer;
    }
    object = JSON.parse(object);
    object = object[Object.keys(object)[1]];
    if('id' in object){
      response.writeHead(400);
      return;
    }
    if(typeof user == 'undefined') {
      response.writeHead(404);
      response.end('not found');
      return;
    } else {
      if(user.id === proposer.id){
        dao.deleteDissertation(request.params.id);
        response.writeHead(200);
        response.end(JSON.stringify(object));
      } else {
        response.writeHead(400);
        response.end('wrong user');
        return;
      }
    }
  }


  function deleteDissertation(request, response){
    var dissertation = dao.getDissertationById(request.params.id);
    var user = request.staffMember;
    if(dissertation == undefined){
      response.writeHead(404);
      response.end('');
      return;
    } else {
      var proposer = dissertation.proposer;
    }

    if(typeof user == 'undefined') {
      response.writeHead(404);
      response.end('not found');
      return;
    } else {
      if(user.id === proposer.id){
        dao.deleteDissertation(request.params.id);
        response.writeHead(200);
        response.end('');
      } else {
        response.writeHead(400);
        response.end('wrong user');
        return;
      }
    }
  }

  function deleteUser(request, response){
    var id = request.params.id;
    var user = dao.getUserById(id);

    var admin = request.params.admin;


    if(user == undefined){
      response.writeHead(404);
      response.end('');
      return;
    }

    if(typeof admin == 'undefined') {
      response.writeHead(404);
      response.end('not found');
      return;
    } else {
      if(admin.role === "admin"){
        dao.deleteUser(id);
        response.writeHead(200);
        response.end('');
      } else {
        response.writeHead(400);
        response.end('wrong user');
        return;
      }
    }
  }

  /***********************************************************************************
   * Excpetion classes
   ***********************************************************************************/

  /**
   * @constructor
   * Error thrown by the API.
   */
  function ApiError(msg, filename, linenumber) {
    Error.call(this, msg, filename, linenumber);
  }
  ApiError.prototype = Error.prototype;

})();