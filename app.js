const path = require('path')

const express = require('express')
const bodyParser = require('body-parser')

const errorController = require('./controllers/error')

// Импортируем sequelize для коннекта с БД
const sequelize = require('./util/database')
const Product = require('./models/product')
const User = require('./models/user')

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

app.use((req, res, next) => {
  User.findByPk(1)
    .then((user) => {
      req.user = user
      next()
    })
    .catch((err) => {
      console.log('Error User.findByPk(1): ', err)
    })
})

app.use('/admin', adminRoutes)
app.use(shopRoutes)

// Если к этому моменту мы не нашли никакого совпадающего роута, тогда вернем в ответе 404 страницу
app.use(errorController.get404)

// Уставновление связей в БД
// Продукт создается юзером, поэтому belongTo
Product.belongsTo(User, {
  constraints: true,
  // Если удаляем пользователя, то удаляются все продукты, созданные им
  onDelete: 'CASCADE',
})
// Это необязательная строка (Product.belongTo достаточно). Но она вносит дополнительную ясность
User.hasMany(Product)

// Подключаемся к БД. Идет синхронизация: создание описанных в моделях таблиц и установка связей (если связи описаны)
// { force: true } - только для редима разработки - пересоздавать таблицы каждый раз при старте приложения
sequelize
  //   .sync({ force: true })
  .sync()
  .then((result) => {
    return User.findByPk(1)
    // console.log(result)
  })
  .then((user) => {
    if (!user) {
      return User.create({ name: 'Ivan', email: 'test@test.com' })
    }

    return Promise.resolve(user)
  })
  .then((user) => {
    // console.log(user)
    app.listen(3000)
  })
  .catch((err) => {
    console.log('ERROR', err)
  })
