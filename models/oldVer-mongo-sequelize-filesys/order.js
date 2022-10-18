const Sequelize = require('sequelize')

const sequelize = require('../util/database')

// 1st - 'user' - имя модели
// 2st - Описание структуры таблицы - полей и пр.
const Order = sequelize.define('order', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    // id будет являться первичным ключом, по которому будут выстраиваться связи между таблицами
    primaryKey: true,
  },
})

module.exports = Order
