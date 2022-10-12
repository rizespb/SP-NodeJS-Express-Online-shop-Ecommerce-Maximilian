const Sequelize = require('sequelize')

// 1st - name of DB
// 2nd - user name
// 3rd - user password
const sequelize = new Sequelize('node-complete', 'root', 'MYSQLpassword123', {
  dialect: 'mysql',
  host: 'localhost',
})

module.exports = sequelize

/*
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
