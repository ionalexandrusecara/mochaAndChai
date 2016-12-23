

var expect = require('chai').expect;
var sinon = require('sinon');
var sc = require('sinon-chai');
var dao = require('../../js/inmemorydao.js');

var model = require('../../js/model.js');


describe('DAO', function() {

  beforeEach(function() {
    dao.clear();
  });
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

  var student = new model.Student("njones", "student", "Nick", "Jones",  interests, "passs");

  var proposer = student;

  var dissertation = new model.Dissertation(title, description, proposer, proposerRole, supervisor);


  it('Store a student and an academic staff', function () {

    dao.storeUser(academicStaff);
    dao.storeUser(student);
    var size = dao.getUsers().length;

    expect(size).to.equals(3);

  });

  it("Get user using id" , function () {
    dao.storeUser(academicStaff);
    var academicStaff2 = dao.getUserById(academicStaff.id)
    var id = academicStaff2.id;
    expect(id).to.equals("jlewis")
  });

  it("Delete user", function () {

    dao.storeUser(student);
    expect(dao.getUsers().length).to.equals(2);
    dao.deleteUser(student.id);
    expect(dao.getUsers().length).to.equals(1);
  });

  it('Store dissertation', function () {

    dao.storeDissertation(dissertation);
    expect(dao.getDissertations().length).to.equals(1)

  });

  it("Delete dissertation", function () {

    dao.storeDissertation(dissertation);
    expect(dao.getDissertations().length).to.equals(1);

    dao.deleteDissertation(JSON.stringify(dissertation.id));
    expect(dao.getDissertations().length).to.equals(0)

  });

  it("Get dissertation using id", function () {
    dao.storeDissertation(dissertation);
    var dissertation2 = dao.getDissertationById(dissertation.id)
    var id = dissertation2.id;
    expect(id).to.equals(0);
  })
});