var expect = require('chai').expect;
var http = require('http');
var express = require('express');
var sinon = require('sinon');
var sc = require('sinon-chai');
var api = require('../../js/api.js');
var model = require('../../js/model.js');
var dao = require('../../js/inmemorydao.js');
var PassThrough = require('stream').PassThrough;


function StubResponse() {
  PassThrough.call(this);
  this.body = "";
};
StubResponse.prototype = new PassThrough();
StubResponse.prototype.write = function(chunk, encoding, callback) {
  this.body += chunk;
};
StubResponse.prototype.writeHead = function(statusCode, headers){
  this.statusCode = statusCode;
  this.headers = headers;
}

describe('API', function() {
  var id;
  var title = "Machine Learning";
  var description = "Description";
  var proposerRole = "staff"; // change that to object
  var supervisor = "Mr. Donald";
  var roomNo = "JC0.26";
    var jobTitle = "Lecturer";
    var email = "jon.lewis@st-andrews.ac.uk";
    var telephone = "+441334463262";
    var proposals = ["123"];
    var interests = ["564"];


  var academicStaff = new model.AcademicStaff("jlewis", "staff", "Jonathan", "Lewis", jobTitle, email, telephone, roomNo,interests, "pass");

  var admin = new model.Admin("admin", "admin", "admin", "password", proposals);

  var student = new model.Student("njones", "student", "Nick", "Jones",  interests, "pass");

  beforeEach(function() {
    dao.clear();
  });

  describe('Create new dissertation', function () {
    beforeEach(function() {
      dao.clear();
    });
    var proposer = academicStaff;
    var dissertation = new model.Dissertation(title, description, proposer, proposerRole, supervisor);

    var createRequest = {
      method: 'POST',
      body: JSON.stringify(dissertation)

    };

    it('Succesfully created', function() {
      var response = new StubResponse();
      api.createDissertation(createRequest, response);
      expect(response.statusCode).to.equal(201);
    });


    it('Succesfully stored', function() {
      var response = new StubResponse();
      api.createDissertation(createRequest, response);
      expect(response.body).to.exit;
      var object = JSON.parse(response.body);
      expect(dao.getDissertations().length).to.equals(1);
    });

    it('Invalid Data', function() {
      var response = new StubResponse();
      api.createDissertation({method: 'POST', body: "{}"}, response);
      expect(response.statusCode).to.equal(400);
    });


  });



  describe('List all dissertations', function(){

    var proposer = academicStaff;

    var dissertation = new model.Dissertation(title, description, proposer, proposerRole, supervisor);


    it("Succesfully listed", function(){
      var response = new StubResponse();
      api.getDissertations({method: 'GET'}, response);
      expect(response.statusCode).to.equal(200);
    });

    it('Return a content-type header', function(){
      var response = new StubResponse();
      api.getDissertations({method: 'GET'}, response);
      expect(response.statusCode).to.equal(200);
      expect(response.headers).to.include({'content-type': 'application/json'});
    });

    it('Return a list of dissertations', function() {

      var response = new StubResponse();
      dao.storeDissertation(dissertation)
      api.getDissertations({method : 'GET'}, response);
      var results = JSON.parse(response.body);
      expect(results).to.be.instanceOf(Array);
      expect(results).to.have.lengthOf(1);

    });


  });

  describe('Get Dissertation Using ID', function () {

    var proposer = academicStaff;

    var dissertation = new model.Dissertation(title, description, proposer, proposerRole, supervisor);

    it('Successfully retrieved', function() {
      dao.storeDissertation(dissertation)
      var response = new StubResponse();
      api.getDissertationById({method: 'GET', params: {id: 2}}, response);
      expect(response.statusCode).to.equal(200);
    });

    it('Retrieve dissertation using non-numeric id', function() {
      var response = new StubResponse();
      api.getDissertationById({method: 'GET', params: {id: 'notanumber'}}, response);
      expect(response.statusCode).to.equal(400);
    });

    it('Dissertation not found', function() {
      var response = new StubResponse();
      api.getDissertationById({method: 'GET', params: {id: 5}}, response);
      expect(response.statusCode).to.equal(404);
    });

    it('Should return application/json mime type in content-type header', function() {
      var response = new StubResponse();
      dao.storeDissertation(dissertation);
      api.getDissertationById({method: 'GET', params: {id: 2}}, response);
      expect(response.headers).to.include({'content-type': 'application/json'});
    });

    it('Succesfully retrieved 2', function() {
      dao.storeDissertation(dissertation)
      var response = new StubResponse();
      api.getDissertationById({method: 'GET', params: {id: 2}}, response);

      var result = JSON.parse(response.body)

      expect(result.id).to.equals(2);

    });
  });

  describe("Update dissertation", function () {
    var proposer = academicStaff;
    var dissertation = new model.Dissertation(title, description, proposer, proposerRole, supervisor);

    it('Succesfully updated dissertation', function() {
      dao.storeUser(academicStaff);
      dao.storeDissertation(dissertation);

      var response = new StubResponse();
      var body = JSON.stringify({ id: 3, diss: { title: 'updated', description : 'updated as well' }});
      api.updateDissertation({method: 'PUT', params: {id: 3, user: academicStaff}, body: body}, response);
      expect(response.statusCode).to.equal(200);
    });

    it('No body provided for updating dissertation', function() {
      var response = new StubResponse();
      api.updateDissertation({method: 'PUT', params: {id: 0, user: academicStaff}}, response);
      expect(response.statusCode).to.equal(400);
    });

    it("Dissertation doesn't exist", function() {
      var response = new StubResponse();
      var body = JSON.stringify({ id: id+1 , bibData: {title: 'updated'}});
      api.updateDissertation({method: 'PUT', params: {id: 10, user: academicStaff}, body: body}, response);
      expect(response.statusCode).to.equal(404);
    });

    it('Dissertation JSON is invalid', function() {
      var response = new StubResponse();
      api.updateDissertation({method: 'PUT', params: {id: 0, user: academicStaff}, body: '{'}, response);
      expect(response.statusCode).to.equal(400);
    });

    it('Returns updated dissertation', function(){
      var response = new StubResponse();
      dao.storeDissertation(dissertation);
      var body = JSON.stringify({ id: 3, bibData: {title: 'updated' }});
      api.updateDissertation({method: 'PUT', params: {id: 3, user: academicStaff} ,body: body}, response);
      var result = JSON.parse(response.body);
      expect(result.title).to.equals("updated")

    });

    it('should never update id field', function() {
      dao.storeUser(student);
      dao.storeDissertation(dissertation);

      var response = new StubResponse();
      var body = JSON.stringify({ id: 3, diss: {title: 'updated', id : "10" }});
      api.updateDissertation({method: 'PUT', params: {id: 3, user: academicStaff} ,body: body}, response);

      expect(response.statusCode).to.equals(400);
    });

  });

  describe('Delete dissertation', function () {
    var proposer = academicStaff

    var dissertation = new model.Dissertation(title, description, proposer, proposerRole, supervisor);

    it('Successfully deleted', function() {
      dao.storeDissertation(dissertation)
      dao.storeUser(academicStaff)
      var response = new StubResponse();
      api.deleteDissertation({method: 'DELETE', params: {id: dissertation.id}, staffMember: academicStaff}, response);
      expect(response.statusCode).to.equal(200);
    });

    it('Dissertation not found', function() {
      var response = new StubResponse();
      api.deleteDissertation({method: 'DELETE', params: {id: 10}}, response);
      expect(response.statusCode).to.equal(404);
    });

    it('Successfully deleted 2', function() {
      var response = new StubResponse();
      api.deleteDissertation({method: 'DELETE', params: {id: 0}}, response);
      var dissertation = dao.getDissertationById(id);
      expect(dissertation).to.be.undefined;
    });



  });

  describe('Get users', function () {
    it('Successfully retrieved', function () {
      var response = new StubResponse();
      api.getUsers({method: 'GET'}, response);
      expect(response.statusCode).to.equal(200);
    });

    it('Should return application/json mime type in content-type header', function(){
      var response = new StubResponse();
      api.getUsers({method: 'GET'}, response);
      expect(response.statusCode).to.equal(200);
      expect(response.headers).to.include({'content-type': 'application/json'});
    });


    it('Returns two users', function() {
      var response = new StubResponse();
      dao.storeUser(academicStaff);
      dao.storeUser(student);

      api.getUsers({method: 'GET'}, response);
      expect(response.body).to.exit;
      var results = JSON.parse(response.body);

      expect(results).to.be.instanceOf(Array);
      expect(results).to.have.lengthOf(3);

    });
  });



  describe('Get user by id', function () {

    beforeEach(function() {
      dao.clear();
    });

    it('Successful user retrieval', function () {
      dao.storeUser(academicStaff);
      var response = new StubResponse();
      api.getUserById({method : 'GET', params : {id : "jlewis"}}, response);
      expect(response.statusCode).to.equal(200);
    });

    it("User does not exist", function() {
      var response = new StubResponse();
      api.getUserById({method: 'GET', params: {id: id+1}}, response);
      expect(response.statusCode).to.equal(404);
    });

    it('Returns user ', function() {
      dao.storeUser(academicStaff);
      var response = new StubResponse();
      api.getUserById({method: 'GET', params: {id: "jlewis"}}, response);
      var result = JSON.parse(response.body);
      expect(result.id).to.equal("jlewis");
      expect(result.role).to.equal("staff")
    });

    it("Returns only academic staff",function () {

      dao.storeUser(academicStaff);
      dao.storeUser(student);
      var response = new StubResponse();
      api.getStaffMembers({method: 'GET'}, response);
      var result = JSON.parse(response.body);
      expect(result.length).to.equals(1); // retrieves only the staff members
    })
  });



  describe("Create new user", function () {
    var createRequest = {
      method: 'POST',
      body: JSON.stringify(academicStaff),
      params : admin
    };

    var createRequestTwo = {
      method: 'POST',
      body: JSON.stringify(academicStaff),
      params : academicStaff
    };
    it("Succesfully created", function () {
      var response = new StubResponse();
      api.createNewUser(createRequest, response);
      expect(response.statusCode).to.equals(201);
    })

    it("Check JSON header", function () {
      var response = new StubResponse();
      api.createNewUser(createRequest, response);
      expect(response.statusCode).to.equal(201);
      expect(response.headers).to.include({'content-type': 'application/json'});
    })

    it("User with empty body", function () {
      var response = new StubResponse();
      api.createNewUser({method: 'POST', body: "{}"}, response);
      expect(response.statusCode).to.equal(400);
    })

    it("Store an user", function () {
      var response = new StubResponse();
      api.createNewUser(createRequest, response);
      var result = JSON.parse(response.body);
      expect(result.role).to.equals("staff");
    })

    it("Admin only property", function () {
      var response = new StubResponse();
      api.createNewUser(createRequestTwo, response);
      expect(response.statusCode).to.equal(400);
    })
  })



  describe("Delete user", function () {
    beforeEach(function() {
      dao.clear();
    });



    it("Succesfully deleted", function () {
      dao.storeUser(academicStaff);
      var response = new StubResponse();
      api.deleteUser({method: 'DELETE', params: { id: "jlewis", admin: admin}}, response);
      expect(response.statusCode).to.equal(200);
    })

    it("Succesfully Deleted 2", function () {
      dao.storeUser(academicStaff);
      expect(dao.getUsers().length).to.equals(2);
      var response = new StubResponse();
      api.deleteUser({method: 'DELETE', params: {id: "jlewis", admin: admin}}, response);
      expect(dao.getUsers().length).to.equals(1);
    })

    it("User not found", function () {
      dao.storeUser(academicStaff);
      expect(dao.getUsers().length).to.equals(2);
      var response = new StubResponse();
      api.deleteUser({method: 'DELETE', params: {id: 10, admin: admin}}, response);
      expect(response.statusCode).to.equals(404);
    })

    it("Admin only property", function () {
      dao.storeUser(academicStaff);
      expect(dao.getUsers().length).to.equals(2);
      var response = new StubResponse();
      api.deleteUser({method: 'DELETE', params: {id: "Dr Josh", admin: academicStaff}}, response);
      expect(dao.getUsers().length).to.equals(2);
    })

  })



  describe("Update an user", function () {

    var createRequest = {
      method: 'POST',
      body: JSON.stringify(academicStaff),
      params: admin
    };

    var createRequestTwo = {
      method: 'POST',
      body: JSON.stringify(academicStaff),
      params: academicStaff
    };

    it("Succesfully updated", function () {
      dao.storeUser(academicStaff);
      var response = new StubResponse();
      var body = JSON.stringify({ id: "lbright", user : {password : '12345'}});

      api.updateUser({method: 'PUT', params: {id: "jlewis", admin: admin}, body: body}, response);
      expect(response.statusCode).to.equal(200);
    })

    it('Body not provided', function() {
      var response = new StubResponse();
      api.updateUser({method: 'PUT', params: {id: 0, admin: admin}}, response);
      expect(response.statusCode).to.equal(400);
    });

    it('User not found', function() {
      var response = new StubResponse();
      var body = JSON.stringify({ id: id+1 , bibData: {title: 'updated'}});
      api.updateUser({method: 'PUT', params: {id: 10, admin: admin}, body: body}, response);
      expect(response.statusCode).to.equal(404);
    });

    it('Invalid JSON', function() {
      var response = new StubResponse();
      api.updateUser({method: 'PUT', params: {id: 0, admin: admin}, body: '{'}, response);
      expect(response.statusCode).to.equal(400);
    });

    it('Succesfully updated 2', function(){
      dao.storeUser(academicStaff);
      var response = new StubResponse();
      var body = JSON.stringify({ id: "lbright", user : {password : '12345'}});
      api.updateUser({method: 'PUT', params: {id: "jlewis", admin: admin}, body: body}, response);
      var result = JSON.parse(response.body);
      expect(result.password).to.equal('12345');
    });

    it('Admin only property', function(){
      dao.storeUser(academicStaff);
      var response = new StubResponse();
      var body = JSON.stringify({ id: "lbright", user : {password : '12345'}});
      api.updateUser({method: 'PUT', params: {id: "jlewis", admin: academicStaff}, body: body}, response);
      expect(response.statusCode).to.equal(400);
    });
  });

  describe("User interest in dissertation", function () {
    var areasOfInterest = [];
    var proposer = student;
    var dissertation = new model.Dissertation(title, description, proposer, proposerRole, supervisor);

    var createRequest = {
      method: 'POST',
      body: JSON.stringify(dissertation),
      params : {idDiss : "1", id : "njones", user: student}
    };

    var createRequestTwo = {
      method: 'POST',
      body: JSON.stringify(dissertation),
      params : {idDiss : "1", id : "njones", user: admin}
    };

    it('Succesfully added interest', function () {
      var response = new StubResponse();
      dao.storeUser(student);
      api.storeUserInterests(createRequest, response);
      expect(response.statusCode).to.equal(200);

    })

    it("Student only property", function () {
      var response = new StubResponse();
      dao.storeUser(student);
      api.storeUserInterests(createRequestTwo, response);
      expect(response.statusCode).to.equal(400);

    })

    it('Return application/json mime type in content-type header', function() {
      var response = new StubResponse();
      dao.storeUser(student);
      api.storeUserInterests(createRequest, response);
      expect(response.headers).to.include({'content-type': 'application/json'});
    });

    it('Successfully updated interest', function() {
      var response = new StubResponse();
      dao.storeUser(student);
      expect(dao.getUserById(student.id).interests.length).to.equals(3);
      api.storeUserInterests(createRequest, response);
      var createdResource = JSON.parse(response.body);
    });

    it('Invalid data for user interest', function() {
      var response = new StubResponse();
      api.storeUserInterests({method: 'POST', body: "{}"}, response);
      expect(response.statusCode).to.equal(400);
    });

  })

  describe("User interest in topic", function () {
    var areasOfInterest = [];
    var proposer = student;
    var dissertation = new model.Dissertation(title, description, proposer, proposerRole, supervisor);

    var createRequest = {
      method: 'POST',
      body: JSON.stringify(dissertation),
      params : {idDiss : "6", idUser : "njones", userChecked: student}
    };

    var createRequestTwo = {
      method: 'POST',
      body: JSON.stringify(dissertation),
      params : {idDiss : "6", idUser : "njones", userChecked: admin}
    };

    it("Assign dissertation", function () {
      dao.storeUser(student);
      dao.storeDissertation(dissertation);
      var response = new StubResponse();
      api.showInterestToDissertation(createRequest, response);
      expect(response.statusCode).to.equal(200);
    })

    it("Have someone else propose the dissertation for the student", function () {
      dao.storeUser(student);
      dao.storeDissertation(dissertation);
      var response = new StubResponse();
      api.showInterestToDissertation(createRequestTwo, response);
      expect(response.statusCode).to.equal(400);
    })

    it('Returns application/json mime type in content-type header', function() {
      var response = new StubResponse();
      dao.storeDissertation(dissertation);
      dao.storeUser(student);
      api.showInterestToDissertation(createRequest, response);
      expect(response.headers).to.include({'content-type': 'application/json'});
    });

    it('Data is invalid', function() {
      var response = new StubResponse();
      api.showInterestToDissertation({method: 'POST', body: "{}"}, response);
      expect(response.statusCode).to.equal(400);
    });
  });
});
