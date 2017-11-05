var Sequelize = require('sequelize');

export const sequelize = new Sequelize('recommendations', 'root', 'test1234', {
  host: 'localhost',
  dialect: 'mysql',

  pool: {
    max: 5,
    min: 0,
    idle: 10000
  }
});