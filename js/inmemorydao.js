(function() {

  var lookup = {};
  clear();




  function clear() {
    lookup = {
      dissertationsById : [],
      userById : [{id : "admin", password : "admin", role:"admin"}]
    }
  }

  function getUserById(inputID) {

    for (ids in lookup.userById) {
      if (lookup.userById[ids].id == inputID) {
        return lookup.userById[ids];
      }
    }
  }

  function getUsers(){
    var array = [];
    for(var id in lookup.userById) {
      array.push(lookup.userById[id]);
    }
    return array;
  }

  function getStaffMembers(){
    var array = [];
    for(var id in lookup.userById){
      if(lookup.userById[id].role === "staff") {
        array.push(lookup.userById[id]);
      }
    }
    return array;
  }



  function storeDissertation(dissertation){


      var json = dissertation;
      var id = dissertation.id;
      lookup.dissertationsById[id] = dissertation;


  }

  function addDissertationToUser(dissertation, id) {

    var user = getUserById(id);
    var dissertation = dissertation;
    user.interests.push(dissertation);

  }


  function storeUser(user){

    lookup.userById[user.id] = user;
  }

  function getDissertations(){
    var array = [];
    for(var id in lookup.dissertationsById) {
      array.push(lookup.dissertationsById[id]);
    }
    return array;
  }

  function getDissertationById(id){
    return lookup.dissertationsById[id];
  }

  function deleteDissertation(id){
    delete lookup.dissertationsById[id];
  }

  function deleteUser(id){

    delete lookup.userById[id];
  }




  module.exports = {
    clear: clear,
    getDissertations : getDissertations,
    getDissertationById : getDissertationById,
    getUserById : getUserById,
    deleteDissertation : deleteDissertation,
    storeDissertation : storeDissertation,
    storeUser : storeUser,
    getUsers : getUsers,
    getStaffMembers : getStaffMembers,
    deleteUser : deleteUser,
    addDissertationToUser: addDissertationToUser
  }

})();