const path = require('path')

const express = require('express')
const bodyParser = require('body-parser')

const errorController = require('./controllers/error')
const mongoConnect = require('./util/database').mongoConnect
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
  User.findById('634beefab97907ee68be5ad6')
    .then((user) => {
      req.user = user

      console.log('USER!!!!!!!!!!!!!!!!!!!!!', user)
      next()
    })
    .catch((err) => console.log('Error from app.js app.use(user): ', err))
})

app.use('/admin', adminRoutes)
app.use(shopRoutes)

// Если к этому моменту мы не нашли никакого совпадающего роута, тогда вернем в ответе 404 страницу
app.use(errorController.get404)

mongoConnect(() => {
  app.listen(3000)
})

/*
/////////////////////////////////// ВАРИНАТ SQL ////////////////////////////////
/// Ниже представлен первоначальный код для работы с SQL БД

// Поиск текущего пользователя в БД и добавление объекта пользователя в запрос
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



// Импортируем sequelize для коннекта с БД
const sequelize = require('./util/database')
const Product = require('./models/product')
const User = require('./models/user')
const Cart = require('./models/cart')
const CartItem = require('./models/cart-item')
const Order = require('./models/order')
const OrderItem = require('./models/order-item')


// <<<<<<<<<<<<<<<<<Уставновление связей в БД>>>>>>>>>>>>>>>>>>>>>>
// Продукт создается юзером, поэтому belongTo
Product.belongsTo(User, {
  constraints: true,
  // Если удаляем пользователя, то удаляются все продукты, созданные им
  onDelete: 'CASCADE',
})
// Это необязательная строка (Product.belongTo достаточно). Но она вносит дополнительную ясность
User.hasMany(Product)
// Точно также, как и выше, можно было бы определить только одно направление hasOne или belongsTo. И этого было бы достаточно
User.hasOne(Cart)
Cart.belongsTo(User)
// Одна корзина может содержать много разных товаров
// through - где хранить эту связь
Cart.belongsToMany(Product, { through: CartItem })
// Один товар может находится в разных корзинах
Product.belongsToMany(Cart, { through: CartItem })
Order.belongsTo(User)
User.hasMany(Order)
Order.belongsToMany(Product, { through: OrderItem })

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
  .then(async (user) => {
    const cart = await user.getCart()

    return cart ? Promise.resolve() : user.createCart()
    // Это моя доработка, т.к. несмотря на свзяь 1-к-1, все равно создается несколько корзин.
    // В варианте Максимилиана выглядело так:
    // return user.createCart()
  })
  .then((cart) => {
    app.listen(3000)
  })
  .catch((err) => {
    console.log('ERROR', err)
  })
*/
