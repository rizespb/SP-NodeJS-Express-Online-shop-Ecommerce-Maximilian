const User = require('../models/user')

exports.getLogin = (req, res, next) => {
  res.render('auth/login', {
    pageTitle: 'Login',
    path: '/login',
    isAuthenticated: req.session.isLoggedIn,
  })
}

exports.postLogin = (req, res, next) => {
  User.findById('634ec2cb03f75fdfb8298fc7')
    .then((user) => {
      // Объект user вместе с запросом будет прокинут по всем остальным middleware в приложении
      req.session.user = user
      req.session.isLoggedIn = true
      res.redirect('/')
    })
    .catch((err) => console.log('Error from app.js app.use(): ', err))
}

// Удаление сессии
exports.postLogout = (req, res, next) => {
  // Если будет ошибка, ее передадут в колбэк, который будет вызван после удаления сессии
  // destroy предоставляется библиотекой
  req.session.destroy((err) => {
    console.log(err)

    res.redirect('/')
  })
}
