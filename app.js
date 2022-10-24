const path = require('path')

const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const session = require('express-session')
// session передаем в качестве параметра в след строке
const MongoDBStore = require('connect-mongodb-session')(session)

// Защита от Cross-Site Request Forgery атак – межсайтовая подделка запроса
const csrf = require('csurf')

// Flash-сообщения - это сообщения, которые сохраняются в сессии и доступны в обработчике маршрута, на который выполняется следующий переход. Flash-сообщение удаляется из сессии после того, как оно было отображено в представлении.
const flash = require('connect-flash')

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

// Инициализация защиты от CSRF-атак
// Можно добавить настройки, но и по дефолту работает ок
const csrfProtection = csrf({})

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

// Обязательно после инициализации сессии это делать
app.use(csrfProtection)

// Обязательно после инициализации сессии это делать
app.use(flash())

// Получаем пользователя, если он авторизован
app.use((req, res, next) => {
  if (!req.session.user) {
    return next()
  }

  User.findById(req.session.user._id)
    .then((user) => {
      req.user = user

      next()
    })
    .catch((err) => console.log('Error from app.js app.use(): ', err))
})

// Этот middleware пробрасывает во ВСЕ view, которые будет возвращать сервер в res.render указанные в locals переменные
// Он не имеет прямого отношения к библиотеке csurf
app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn
  res.locals.csrfToken = req.csrfToken()
  next()
})

app.use('/admin', adminRoutes)
app.use(shopRoutes)
app.use(authRoutes)

// Если к этому моменту мы не нашли никакого совпадающего роута, тогда вернем в ответе 404 страницу
app.use(errorController.get404)

mongoose
  .connect(MONGODB_URI)
  .then((result) => {
    app.listen(3000)
  })
  .catch((err) => console.log('Error from app.js mongoose.connect(): ', err))
