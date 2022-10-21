const User = require('../models/user')

exports.getLogin = (req, res, next) => {
  res.render('auth/login', {
    pageTitle: 'Login',
    path: '/login',
    isAuthenticated: req.session.isLoggedIn,
  })
}

exports.postLogin = (req, res, next) => {
    // Когда мы сохраняем в объект session (который предоставляется пакетом 'express-session') что-либо на фронте создается кука с идентификатором сессии и происходит синхронизация с Монго
  User.findById('634ec2cb03f75fdfb8298fc7')
    .then((user) => {
      // Объект user вместе с запросом будет прокинут по всем остальным middleware в приложении
      req.session.user = user
      req.session.isLoggedIn = true

      // Т.к. при сохранении user и isLoggedIn в session происходит синхронизация с Монго, это может занять время и при редиректе мы увидим еще не обновленные данные
      // Вызывать метод save необязательно, но это гарантирует, что при редиректе пользователь увидит обновленные данные
      req.session.save((err) => {
        console.log('Error from postLogin req.session.save(): ', err)

        res.redirect('/')
      })
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
