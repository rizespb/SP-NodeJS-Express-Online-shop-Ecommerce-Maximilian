exports.getLogin = (req, res, next) => {
  console.log(req.session.isLoggedIn)

  res.render('auth/login', {
    pageTitle: 'Login',
    path: '/login',
    // isAuthenticated: isLoggedIn,
    isAuthenticated: false,
  })
}

exports.postLogin = (req, res, next) => {
  // isLoggedIn - любое имя
  req.session.isLoggedIn = true

  res.redirect('/')
}
