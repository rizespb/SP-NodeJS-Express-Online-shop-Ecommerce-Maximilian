const path = require('path')

const express = require('express')
const bodyParser = require('body-parser')

const errorController = require('./controllers/error')

// Импортируем sequelize для коннекта с БД
const sequelize = require('./util/database')

const app = express()

// Говорим, что будем использовать ejs
app.set('view engine', 'ejs')
// И папку, в которой хранятся шаблоны
app.set('views', 'views')

const adminRoutes = require('./routes/admin')
const shopRoutes = require('./routes/shop')

// Регистрируем парсер для body
// Теперь для каждого входящего запроса будет осуществляться парсинг body перед применением остальных middleware
app.use(bodyParser.urlencoded({ extended: false }))

// static - для всех входящих запросов определям папку со статическими файлами (стили, изображения, шрифты и т.д.)
app.use(express.static(path.join(__dirname, 'public')))

app.use('/admin', adminRoutes)
app.use(shopRoutes)

// Если к этому моменту мы не нашли никакого совпадающего роута, тогда вернем в ответе 404 страницу
app.use(errorController.get404)

// Подключаемся к БД. Идет синхронизация: создание описанных в моделях таблиц и установка связей (если связи описаны)
sequelize
  .sync()
  .then((result) => {
    // console.log(result)
    app.listen(3000)
  })
  .catch((err) => {
    console.log('ERROR', err)
  })
