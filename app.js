const path = require('path')

const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const session = require('express-session')
// session передаем в качестве параметра в след строке
const MongoDBStore = require('connect-mongodb-session')(session)

const errorController = require('./controllers/error')
const User = require('./models/user')

// Адрес для подлкючения к БД
const MONGODB_URI = 'mongodb+srv://testuser:testpassword@cluster0.n9aceoe.mongodb.net/shop'

const app = express()

// Хранилище для сессий
// uri - url для подключения к БД
// collection: "sessions" - заем имя коллекции для хранения данных о сессиях
const store = new MongoDBStore({
  uri: MONGODB_URI,
  collection: 'sessions',
})

// Говорим, что будем использовать ejs
app.set('view engine', 'ejs')
// И папку, в которой хранятся шаблоны
app.set('views', 'views')

const adminRoutes = require('./routes/admin')
const shopRoutes = require('./routes/shop')
const authRoutes = require('./routes/auth')

// Регистрируем парсер для body
// Теперь для каждого входящего запроса будет осуществляться парсинг body перед применением остальных middleware
app.use(bodyParser.urlencoded({ extended: false }))

// static - для всех входящих запросов определям папку со статическими файлами (стили, изображения, шрифты и т.д.)
app.use(express.static(path.join(__dirname, 'public')))

// Middleware для работы с сессиями
// secret - соль для формирования hash (должна быть длинная строка)
// resave: false - не надо пересохранять сессию на каждый запрос, а только в случае важных изменений
// saveUninitialized: false - в хранилище не будут попадать пустые сессии;
// store – экземпляр хранилища, которое будет использоваться для хранения сессии
app.use(
  session({
    secret: 'my secret',
    resave: false,
    saveUninitialized: false,
    store: store,
  })
)

// app.use((req, res, next) => {
//   User.findById('634ec2cb03f75fdfb8298fc7')
//     .then((user) => {
//       // Объект user вместе с запросом будет прокинут по всем остальным middleware в приложении
//       req.user = user
//       next()
//     })
//     .catch((err) => console.log('Error from app.js app.use(): ', err))
// })

app.use('/admin', adminRoutes)
app.use(shopRoutes)
app.use(authRoutes)

// Если к этому моменту мы не нашли никакого совпадающего роута, тогда вернем в ответе 404 страницу
app.use(errorController.get404)

mongoose
  .connect(MONGODB_URI)
  .then((result) => {
    // findOne - найдет первого пользователя в коллекции
    // Это добавлено для того, чтобы не создавать пользователя при каждом старте
    User.findOne().then((user) => {
      if (!user) {
        const user = new User({
          name: 'Ivan',
          email: 'ivan@test.com',
          cart: {
            items: [],
          },
        })

        // save - метод из mongoose
        user.save()
      }
    })

    app.listen(3000)
  })
  .catch((err) => console.log('Error from app.js mongoose.connect(): ', err))
