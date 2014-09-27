angular.module('starter.controllers', [])

.controller('DashCtrl', function($scope, $state, Notes) {

  $scope.data = {
    showDelete: false
  };

  Notes.getRoots().then(function(result){
    $scope.notes = result;
    $scope.rootNote = {id: 0, title: 'Root Folder', note_category: 1};
  });

  $scope.logger = function(string) {
    console.log(string);
  };

  $scope.deleteNote = function(note) {
    Notes.deleteNote(note);
    $scope.data.showDelete = false;
    Notes.getRoots().then(function(result){
      $scope.notes = result;
      $scope.rootNote = {title: 'Root Folder', note_category: 1};
    });
  };

  $scope.newNote = function() {
    $state.go('tab.new-note',{parent: $scope.rootNote.id});
  };

  $scope.parseDate = function(timestamp){
    return (new Date(parseInt(timestamp))).toDateString();
  };

  $scope.prettyAmount = function(number){
    return number.toLocaleString();
  };

})

.controller('FriendsCtrl', function($scope, Friends) {
  $scope.friends = Friends.all();
})

.controller('FriendDetailCtrl', function($scope, $stateParams, Notes, $state) {
  Notes.getById($stateParams.friendId).then(function(result){
    $scope.rootNote = result;
    $scope.dummy = angular.copy($scope.rootNote);
    if (result.note_category == 1) {
      Notes.getChildren(result.id).then(function(result) {
        $scope.notes = result;
      });
    } else {
      $scope.notes = [];
    }
  });

  $scope.updateNote = function(note) {
    Notes.updateNote(note);
    if(note.parent > 0){
      $state.go('tab.friend-detail', {friendId: note.parent});
    } else {
      $state.go('tab.dash');
    }
  };

  $scope.newNote = function() {
    $state.go('tab.new-note',{parent: $scope.rootNote.id});
  };

  $scope.deleteNote = function(note) {
    Notes.deleteNote(note);
    $scope.data.showDelete = false;
    Notes.getById($stateParams.friendId).then(function(result){
      $scope.rootNote = result;
      $scope.dummy = angular.copy($scope.rootNote);
      if (result.note_category == 1) {
        Notes.getChildren(result.id).then(function(result) {
          $scope.notes = result;
        });
      } else {
        $scope.notes = [];
      }
    });
  };


})

.controller('AccountsCtrl', function(){

})

.controller('NewNotesCtrl', function($scope, $stateParams, $state, Notes) {

  $scope.newNote = {};

  console.log('new note test:'+$stateParams.parent);

  $scope.createNote = function() {
    console.log('creating a new note for parent:'+ $stateParams.parent);
    $scope.newNote.parent = $stateParams.parent;
    if($scope.newNote.note_category == true) {
      $scope.newNote.note_category = 1;
      $scope.newNote.amount = 0;
    } else {
      $scope.newNote.note_category = 2;
    }
    Notes.createNote($scope.newNote).then(function(){
      if($scope.newNote.parent == 0){
        $state.go('tab.dash');
      } else {
        $state.go('tab.friend-detail', {friendId: $scope.newNote.parent});
      }
    });
  };

});
