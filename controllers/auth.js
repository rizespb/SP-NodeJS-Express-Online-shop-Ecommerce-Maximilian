const bcrypt = require('bcryptjs')

const User = require('../models/user')

exports.getLogin = (req, res, next) => {
  res.render('auth/login', {
    pageTitle: 'Login',
    path: '/login',
    errorMessage: req.flash('error'),
  })
}

exports.getSignup = (req, res, next) => {
  res.render('auth/signup', {
    pageTitle: 'Sign up',
    path: '/signup',
  })
}

// Авторизация
exports.postLogin = (req, res, next) => {
  const email = req.body.email
  const password = req.body.password

  User.findOne({ email: email })
    .then((user) => {
      if (!user) {
        // Сообщение, которое надо сохранить в сессии для следующего рендера
        // 1st - ключ, по которому сохраним данные
        // 2dn - Сообщение, которое надо передать
        req.flash('error', 'Invalid email')

        return res.redirect('/login')
      }

      bcrypt
        .compare(password, user.password)
        .then((doMatch) => {
          // doMatch - булево - соправл хэш или нет
          if (doMatch) {
            // Когда мы сохраняем в объект session (который предоставляется пакетом 'express-session') что-либо на фронте создается кука с идентификатором сессии и происходит синхронизация с Монго
            // Объект user вместе с запросом будет прокинут по всем остальным middleware в приложении
            req.session.user = user
            req.session.isLoggedIn = true

            // Т.к. при сохранении user и isLoggedIn в session происходит синхронизация с Монго, это может занять время и при редиректе мы увидим еще не обновленные данные
            // Вызывать метод save необязательно, но это гарантирует, что при редиректе пользователь увидит обновленные данные
            return req.session.save((err) => {
              console.log('Error from postLogin req.session.save(): ', err)

              return res.redirect('/')
            })
          }

          res.redirect('/login')
        })
        .catch((err) => {
          console.log('Error from postLogin bcrypt.compare: ', err)

          res.redirect('/login')
        })
    })
    .catch((err) => console.log('Error from postLogin: ', err))
}

// Регистрация
exports.postSignup = (req, res, next) => {
  const email = req.body.email
  const password = req.body.password
  const confirmPassword = req.body.confirmPassword

  // Проверяем, не занят ли такой емейл
  User.findOne({ email: email })
    .then((userDoc) => {
      if (userDoc) {
        return res.redirect('/signup')
      }

      // 1st - строка для хэширования
      // 2st - соль
      return bcrypt
        .hash(password, 12)
        .then((hashPassword) => {
          const user = new User({
            email: email,
            password: hashPassword,
            cart: { items: [] },
          })

          return user.save()
        })
        .then((result) => {
          console.log('REDIRECT TO LOGIN')
          res.redirect('/login')
        })
    })
    .catch((err) => console.log('Error from postSignup: ', err))
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
