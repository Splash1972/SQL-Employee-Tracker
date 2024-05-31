const Sequelize = require('sequelize');

const sequelize = new Sequelize(process.env.POSTGRESURI)

module.exports = sequelize;
