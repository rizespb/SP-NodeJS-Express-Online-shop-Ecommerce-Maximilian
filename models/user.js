const mongodb = require('mongodb')
const getDb = require('../util/database').getDb

const ObjectId = mongodb.ObjectId

class User {
  constructor(username, email) {
    this.name = username
    this.email = email
  }

  save() {
    const db = getDb()

    db.collection('users').insertOne(this)
  }

  static findById(userId) {
    const db = getDb()

    // next возвращает первый (или последний?) из найденных документов
    return db
      .collection('users')
      .findOne({ _id: new ObjectId(userId) })
      .then((user) => {
        console.log(user)

        return user
      })
      .catch((err) => console.log('Error from User.findById: ', err))
  }
}

module.exports = User

/*
/////////////////////////////////// ВАРИНАТ Sequelize //////////////////////////
/// Ниже представлен второй вариант кода для работы с sql БД через Sequelize
const Sequelize = require('sequelize')
const Sequelize = require('sequelize')

const sequelize = require('../util/database')

// 1st - 'user' - имя модели
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
*/
