const path = require('path')

const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')

const errorController = require('./controllers/error')
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
      // На основании данных из БД мы создаем JS-объект user, в котором будут хранится те же данные, что и в БД (имя, фамилия, id)
      // Чтобы иметь возможность легко работать с ним в JS
      req.user = new User(user.name, user.email, user.cart, user._id)
      next()
    })
    .catch((err) => console.log('Error from app.js app.use(): ', err))
})

app.use('/admin', adminRoutes)
app.use(shopRoutes)

// Если к этому моменту мы не нашли никакого совпадающего роута, тогда вернем в ответе 404 страницу
app.use(errorController.get404)

mongoose
  .connect('mongodb+srv://testuser:testpassword@cluster0.n9aceoe.mongodb.net/shop?retryWrites=true&w=majority')
  .then((result) => {
    app.listen(3000)
  })
  .catch((err) => console.log('Error from app.js mongoose.connect(): ', err))
