angular.module('starter.config', [])
.constant('DB_CONFIG', {
    name: 'DB',
    tables: [
      {
            name: 'notes',
            columns: [
                {name: 'id', type: 'integer primary key'},
                {name: 'title', type: 'text'},
                {name: 'remarks', type: 'text'},
                {name: 'amount', type: 'float'},
                {name: 'created_at', type: 'text'},
                {name: 'parent', type: 'integer'},
                {name: 'note_category', type: 'integer'}
            ]
        }
    ]
})
.constant('APP_CONFIG', {
    note_folder: '1',
    note: '2'
});