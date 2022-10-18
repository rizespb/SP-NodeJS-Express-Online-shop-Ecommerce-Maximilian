/*
/////////////////////////////////// ВАРИНАТ Sequelize //////////////////////////
/// Ниже представлен второй вариант кода для работы с sql БД через Sequelize
const Sequelize = require('sequelize')

const Sequelize = require('sequelize')

const sequelize = require('../util/database')

// 1st - 'user' - имя модели
// 2st - Описание структуры таблицы - полей и пр.
const CartItem = sequelize.define('cartItem', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    // id будет являться первичным ключом, по которому будут выстраиваться связи между таблицами
    primaryKey: true,
  },
  quantity: Sequelize.INTEGER,
})

module.exports = CartItem
*/
