angular.module('starter.services', ['starter.config'])

/**
 * A simple example service that returns some data.
 */
.factory('Friends', function() {
  // Might use a resource here that returns a JSON array

  // Some fake testing data
  var friends = [
    { id: 0, name: 'Scruff McGruff' },
    { id: 1, name: 'G.I. Joe' },
    { id: 2, name: 'Miss Frizzle' },
    { id: 3, name: 'Ash Ketchum' }
  ];

  return {
    all: function() {
      return friends;
    },
    get: function(friendId) {
      // Simple index lookup
      return friends[friendId];
    }
  }
})

// DB wrapper
.factory('DB', function($q, DB_CONFIG) {
    var self = this;
    self.db = null;

    self.init = function() {
        // Use self.db = window.sqlitePlugin.openDatabase({name: DB_CONFIG.name}); in production
        self.db = window.openDatabase(DB_CONFIG.name, '1.0', 'database', -1);

        angular.forEach(DB_CONFIG.tables, function(table) {
            var columns = [];

            angular.forEach(table.columns, function(column) {
                columns.push(column.name + ' ' + column.type);
            });

            var query = 'CREATE TABLE IF NOT EXISTS ' + table.name + ' (' + columns.join(',') + ')';
            self.query(query);
            console.log('Table ' + table.name + ' initialized');

        });
        self.db.transaction(function(tx){

        // tx.executeSql("INSERT INTO notes(title, amount, created_at, parent, note_category) VALUES(?,?,?,?,?)", ["WT", -500.0,(new Date).getTime().toString(), 1, 1]);
        // tx.executeSql("INSERT INTO notes(title, amount, created_at, parent, note_category) VALUES(?,?,?,?,?)", ["TR", -500.0,(new Date).getTime().toString(), 7, 2]);
        //   tx.executeSql("INSERT INTO notes(title, amount, created_at, parent, note_category) VALUES(?,?,?,?,?)", ["WT", -500.0,(new Date).getTime().toString(), 6, 2]);
        });
    };

    self.query = function(query, bindings) {
        bindings = typeof bindings !== 'undefined' ? bindings : [];
        var deferred = $q.defer();

        self.db.transaction(function(transaction) {
            transaction.executeSql(query, bindings, function(transaction, result) {
                deferred.resolve(result);
            }, function(transaction, error) {
                deferred.reject(error);
            });
        });

        return deferred.promise;
    };

    self.fetchAll = function(result) {
        var output = [];

        for (var i = 0; i < result.rows.length; i++) {
            output.push(result.rows.item(i));
        }

        return output;
    };

    self.fetch = function(result) {
        return result.rows.item(0);
    };

    return self;
})

.factory('Notes', function(DB, $rootScope) {
    var self = this;

    var parentId = null;

    self.all = function() {
        return DB.query('SELECT * FROM notes')
        .then(function(result){
            return DB.fetchAll(result);
        });
    };

    self.getById = function(id) {
        return DB.query('SELECT * FROM notes WHERE id = ?', [id])
        .then(function(result){
            return DB.fetch(result);
        });
    };

    self.getRoots = function() {
      return DB.query('SELECT * FROM notes WHERE parent = 0')
      .then(function(result) {
        return DB.fetchAll(result);
      });
    };

    self.getChildren = function(id) {
      return DB.query('SELECT * FROM notes where parent = ?', [id])
      .then(function(result){
          return DB.fetchAll(result);
      });
    };

    self.updateSum = function(noteId) {
      console.log('updateSum:'+noteId);
      DB.query('SELECT SUM(amount) as samount FROM notes WHERE parent = ?', [noteId])
      .then(function(result){
        var sum = DB.fetch(result).samount;
        DB.query('UPDATE notes SET amount = ? WHERE id = ?', [sum, noteId]);
        self.getById(noteId).then(function(result) {
          parentId = result.parent;
          if (parentId > 0) {
            self.updateSum(parentId);
          }
        });
      });
    };

    self.updateNote = function(note) {
      return DB.query('UPDATE notes SET title = ?, amount = ? WHERE id = ?', [note.title, note.amount, note.id])
      .then(function(result){
        if(note.parent > 0){
          self.updateSum(note.parent);
        }
      });
    };

    self.deleteNote = function(note) {
      DB.query('DELETE from notes WHERE id = ?', [note.id]);
      if(note.parent > 0) {
        self.updateSum(note.parent);
      }
      return DB.query('SELECT * from notes WHERE parent = ? AND note_category = ?', [note.id, 1])
      .then(function(result){
        var l_notes = DB.fetchAll(result);
        l_notes.forEach(function(n){
          self.deleteNote(n);
        });
      });
    };

    self.createNote = function(note) {
      return DB.query("INSERT INTO notes(title, amount, created_at, parent, note_category) VALUES(?,?,?,?,?)",[note.title, note.amount, (new Date).getTime().toString(), note.parent, note.note_category])
      .then(function(result) {
        if(note.parent > 0) {
          self.updateSum(note.parent);
        }
      });
    };

    self.total = function(note) {
      return DB.query('SELECT SUM(amount) as samount FROM notes WHERE parent = ?', [note.id])
      .then(function(result){
        return DB.fetch(result).samount;
      });
    };

    return self;
});