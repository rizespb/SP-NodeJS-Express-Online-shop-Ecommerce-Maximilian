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

// multer - парсер для извлечения файлов из body
const multer = require('multer')

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

// Конфигурация хранилища для файлов для multer
const fileStorage = multer.diskStorage({
  // destination - имя папки для сохранения
  destination: (req, file, callback) => {
    callback(null, 'images')
  },
  // filename - имя файла
  filename: (req, file, callback) => {
    callback(null, Date.now() + '-' + file.originalname)
  },
})

// Фильтруем файлы по типу
const fileFilter = (req, file, callback) => {
  if (file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg') {
    // true - если реашем сохранять файл
    callback(null, true)
  } else {
    // false - если реашем не сохранять файл
    callback(null, false)
  }
}

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

// multer - парсер для извлечения файлов из body
// single означает, что мы ожидаем один файл (не много)
// image - файл будет в поле image body
// dest: 'images' - multer соберет полученный файл из буфера из бинарных данных обратно в файл и положит в папку /images
// app.use(multer({ dest: 'images' }).single('image'))
// storage - конфигурация хранилища файлов
// fileFilter - фильтр файлов (в нашем случае по расширению)
app.use(multer({ storage: fileStorage, fileFilter: fileFilter }).single('image'))

// static - для всех входящих запросов определям папку со статическими файлами (стили, изображения, шрифты и т.д.)
// Запросы к этим файлам будут обрабатываться автоматически и будет возвращен файл в ответ на запрос
app.use(express.static(path.join(__dirname, 'public')))
app.use('/images', express.static(path.join(__dirname, 'images')))

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

// Этот middleware пробрасывает во ВСЕ view, которые будет возвращать сервер в res.render указанные в locals переменные
// Он не имеет прямого отношения к библиотеке csurf
app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn
  res.locals.csrfToken = req.csrfToken()
  next()
})

// Получаем пользователя, если он авторизован
app.use((req, res, next) => {
  if (!req.session.user) {
    return next()
  }

  User.findById(req.session.user._id)
    .then((user) => {
      if (!user) {
        return next()
      }

      req.user = user

      next()
    })
    .catch((err) => {
      next(new Error(err))
    })
})

app.use('/admin', adminRoutes)
app.use(shopRoutes)
app.use(authRoutes)

app.get('/500', errorController.get500)

// Если к этому моменту мы не нашли никакого совпадающего роута, тогда вернем в ответе 404 страницу
app.use(errorController.get404)

// Это специальный middleWare (Express узнает его по четырем аргументам) - Error Handling Middleware
// Если таких middleWare несколько, они будут выполнены все по порядку "сверху вниз"
// Этот Error Handling Middleware будет вызван, если в функцию next передать объект ошибки или пробросить ошибку в любом (вроде бы) месте приложения вне блока try catch
app.use((error, req, res, next) => {
  // res.status(error.httpStatusCode).render(...)
  //   res.redirect('/500')
  res.status(500).render('500', {
    pageTitle: 'Error',
    path: '/500',
    isAuthenticated: req.session.isLoggedIn,
  })
})

mongoose
  .connect(MONGODB_URI)
  .then((result) => {
    app.listen(3000)
  })
  .catch((err) => console.log('Error from app.js mongoose.connect(): ', err))
