const mongodb = require('mongodb')
const MongoClient = mongodb.MongoClient

let _db

const mongoConnect = (callback) => {
  // testuser и testpassword - логин и пароль, устанавливаемые в Atlas
  MongoClient.connect('mongodb+srv://testuser:testpassword@cluster0.n9aceoe.mongodb.net/shop?retryWrites=true&w=majority')
    .then((client) => {
      console.log('CONNECTED!!!!!!!!!!!!!!!')

      // Указываем имя БД в кластере, к которой хотим подключиться
      // Можно сотавить пустым, тогда сущности будут добавляться в БД 'test'
      _db = client.db()
      callback()
    })
    .catch((err) => {
      console.log('Error from MongoClient.connect: ', err)
      throw err
    })
}

const getDb = () => {
  if (_db) {
    return _db
  }

  throw 'No database found'
}

exports.mongoConnect = mongoConnect
exports.getDb = getDb

/*
/////////////////////////////////// ВАРИНАТ SQL ////////////////////////////////
/// Ниже представлен первоначальный код для работы с SQL БД и sequelize
const Sequelize = require('sequelize')

// 1st - name of DB
// 2nd - user name
// 3rd - user password
const sequelize = new Sequelize('node-complete', 'root', 'MYSQLpassword123', {
  dialect: 'mysql',
  host: 'localhost',
})

module.exports = sequelize

*/

/*
/////////////////////////////////// ВАРИНАТ хранение в файлах json ////////////////////////////////
/// Ниже представлен первоначальный код для работы с SQL БД
Ниже представлен первоначальный код для подключения к напрямую к БД MySQL
const mysql = require('mysql2')


// Можно каждый раз при обращении к БД создавать и закрывать соединения. А можно создать пул соединений, который будет управлять соединениями для множества запросов к БД
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  database: 'node-complete',
  password: 'MYSQLpassword123',
})

// Позволит нам использовать промисы при обращении к БД, а не коллбэки
module.exports = pool.promise()

*/
