exports.getLogin = (req, res, next) => {
  res.render('auth/login', {
    pageTitle: 'Login',
    path: '/login',
    isAuthenticated: req.session.isLoggedIn,
  })
}

exports.postLogin = (req, res, next) => {
  // isLoggedIn - любое имя
  req.session.isLoggedIn = true

  res.redirect('/')
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
