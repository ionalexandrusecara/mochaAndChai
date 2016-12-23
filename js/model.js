

(function() { // wrap into a function to scope content

  /***********************************************************************************
   * @constructor
   *
   ***********************************************************************************/

  var projectId = 0;

  function User(id, role, givenName, surname, interests, password){
    this.id = id;
    this.givenName = givenName;
    this.surname = surname;
    this.role = role;
    this.password = password;
    this.interests = interests;

  }

  function Student(id, role, givenName, surname, interests, password){
    User.call(this, id, "student", givenName, surname, interests, password);
  }

  function AcademicStaff(id, role, givenName, surname, jobTitle, email, telephoneNumber , roomNumber, interests, password){
    User.call(this, id, "staff", givenName, surname , interests, password);
    this.email = email;
    this.telephoneNumber = telephoneNumber;
    this.roomNumber = roomNumber;
    this.jobTitle = jobTitle;
  }

  function Admin(id, role, name, password, proposals){
    this.role = "admin";
    this.password = "admin";
    User.call(this,id,  name, role, password, proposals);
  }

  User.prototype = {
    getRole : function () {
      return this.role;
    },
    getPassoword : function() {
      return this.password;
    }
  }

  function Dissertation(title, description, proposer, proposerRole,  supervisor){
    this.id = projectId++;
    this.title = title;
    this.description = description;
    this.supervisor = supervisor;
    this.proposerRole = proposerRole;
    this.proposer = proposer;
  }

  Dissertation.prototype = {
    getId : function () {
      return this.id;
    },
    getTitle : function () {
      return this.title;
    },
    getSupervisor : function () {
      return this.supervisor;
    },
    getProposer : function () {
      return this.proposer;
    }

  }




  /***********************************************************************************
   * Exception classes
   ***********************************************************************************/

  /**
   * Error thrown when validation of inputs fails.
   */
  function ValidationError(msg, filename, linenumber) {
    Error.call(this, msg, filename, linenumber);
  }
  ValidationError.prototype = Error.prototype;

  /***********************************************************************************
   * Module imports and exports
   ***********************************************************************************/
  var moduleExports = {

    Dissertation : Dissertation,
    User : User,
    Student : Student,
    AcademicStaff : AcademicStaff,
    Admin : Admin
  }

  if(typeof __dirname == 'undefined') {
    window.hello = moduleExports;
  } else {
    module.exports = moduleExports;

    var validator = require('validator');
  }
})();