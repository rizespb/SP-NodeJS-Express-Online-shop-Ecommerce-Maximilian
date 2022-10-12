const Sequelize = require('sequelize')

const sequelize = require('../util/database')

// 1st - 'product' - имя модели
// 2st - Описание структуры таблицы - полей и пр.
const User = sequelize.define('user', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    // id будет являться первичным ключом, по которому будут выстраиваться связи между таблицами
    primaryKey: true,
  },
  name: Sequelize.STRING,
  email: Sequelize.STRING,
})

module.exports = User
