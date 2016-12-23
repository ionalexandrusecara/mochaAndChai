
var expect = require('chai').expect;
var testCase = require('chai').describe;
var model = require('../../js/model.js');

describe('API Model', function() {
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

    var proposer = academicStaff;
    var dissertation = new model.Dissertation(title, description, proposer, proposerRole, supervisor);
    dissertation2 = new model.Dissertation(title, description, proposer, proposerRole, supervisor)

    describe('Model Specification', function() {

        describe('User', function(){
            it('should be an instance of a Student', function() {
                var student2 = new model.Student(("njones", "student", "Nick", "Jones",  interests, "pass"));
                expect(student2).to.be.an.instanceof(model.Student);
            });

            it('Should be an instance of a Role', function() {
                expect(student.role) == model.Dissertation.role;
            });
        });

    });

    describe('Dissertation', function() {
        it('Should be an instance of a Dissertation', function() {
            expect(dissertation).to.be.an.instanceof(model.Dissertation);
        });

        it('Should be an instance of a Title', function() {
            expect(dissertation.title) == model.Dissertation.title;
        });
    });

});