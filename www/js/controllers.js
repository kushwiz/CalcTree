angular.module('starter.controllers', [])

.controller('DashCtrl', function($scope, $ionicNavBarDelegate, Notes) {

  $scope.data = {
    showDelete: false
  };

  $scope.init = function() {
    Notes.getRoots().then(function(result){
      $scope.notes = result;
      $scope.rootNote = {title: 'Root Folder', note_category: 1};
    });
    $scope.data = {
      showDelete: false
    };
  };

  $scope.logger = function(string) {
    console.log(string);
  };

  $scope.parseDate = function(timestamp){
    return (new Date(parseInt(timestamp))).toDateString();
  };

})

.controller('FriendsCtrl', function($scope, Friends) {
  $scope.friends = Friends.all();
})

.controller('FriendDetailCtrl', function($scope, $stateParams, Notes) {
  console.log('here in');
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
    Note.updateNote(note);
    $location.path('/friend/'+note.parent);
  };

})

.controller('AccountCtrl', function($scope) {
});
