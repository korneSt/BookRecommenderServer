var sequelize = new Sequelize('database', 'username', 'password', {
  host: 'localhost',
  dialect: 'mysql',

  pool: {
    max: 5,
    min: 0,
    idle: 10000
  },

});

// Or you can simply use a connection uri
var sequelize = new Sequelize('postgres://user:pass@example.com:5432/dbname');