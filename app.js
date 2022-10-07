const path = require('path')

const express = require('express')
const bodyParser = require('body-parser')

const errorController = require('./controllers/error')

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

app.listen(3000)
