const crypto = require('crypto')

// Для хэширования паролей и сравнивания хэшей
const bcrypt = require('bcryptjs')

// nodemailer и sendgridTransport для отправки емейлов
const nodemailer = require('nodemailer')

// Валидация
const { validationResult } = require('express-validator/check')

const User = require('../models/user')

// Для чтения env-файлов
const dotenv = require('dotenv')
dotenv.config()

// Для сервиса рассылок SendGrid
// const sendgridTransport = require('nodemailer-sendgrid-transport')

// const transporter = nodemailer.createTransport(
//   sendgridTransport({
//     auth: {
//       // api_user и api_key предоставляются сервисом SendGrid
//       // api_user: some_user_name,
//       api_key: 'some_api_key_from_sendgrid',
//     },
//   })
// )

// Для рассылок через Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'rizespbdev@gmail.com',
    pass: process.env.GMAIL_APP_PASSWORD,
  },
})

exports.getLogin = (req, res, next) => {
  // message будет массивом сообщений, а не просто сообщением
  let message = req.flash('error')
  if (message.length > 0) {
    message = message[0]
  } else {
    message = null
  }

  res.render('auth/login', {
    pageTitle: 'Login',
    path: '/login',
    errorMessage: message,
  })
}

// Получение страницы регистрации
exports.getSignup = (req, res, next) => {
  // message будет массивом сообщений, а не просто сообщением
  let message = req.flash('error')
  if (message.length > 0) {
    message = message[0]
  } else {
    message = null
  }

  res.render('auth/signup', {
    pageTitle: 'Sign up',
    path: '/signup',
    errorMessage: message,
    // Предыдущие введенные значения - пустые строки для первоого посещения страницы
    oldInput: {
      email: '',
      password: '',
      confirmPassword: '',
    },
    validationErrors: [],
  })
}

// Авторизация
exports.postLogin = (req, res, next) => {
  const email = req.body.email
  const password = req.body.password

  // Ошбики валидации
  const errors = validationResult(req)

  // Если есть ошибки
  if (!errors.isEmpty()) {
    console.log('Validation errors array from postSignup', errors.array())

    return res.status(422).render('auth/login', {
      pageTitle: 'Login',
      path: '/login',
      errorMessage: errors.array()[0].msg,
    })
  }

  User.findOne({ email: email })
    .then((user) => {
      if (!user) {
        // Сообщение, которое надо сохранить в сессии для следующего рендера
        // 1st - ключ, по которому сохраним данные
        // 2dn - Сообщение, которое надо передать
        req.flash('error', 'Invalid email or password')

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

  // Ошбики валидации
  const errors = validationResult(req)

  // Если есть ошибки
  if (!errors.isEmpty()) {
    console.log('Validation errors array from postSignup', errors.array())

    return res.status(422).render('auth/signup', {
      pageTitle: 'Sign up',
      path: '/signup',
      errorMessage: errors.array()[0].msg,
      // Предыдущие введенные значения
      oldInput: {
        email: email,
        password: password,
        confirmPassword: req.body.confirmPassword,
      },
      validationErrors: errors.array(),
    })
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

      // Отправка письма после регистрации
      return transporter.sendMail({
        to: email,
        from: 'shop@myshop.com',
        subject: 'Signup succeeded',
        html: '<h1>You successfully signed up!</h1>',
      })
    })
    .catch((err) => {
      console.log('Error from postSignup transporter.sendMail: ', err)
    })
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

// Страница сброса пароля
exports.getReset = (req, res, next) => {
  // message будет массивом сообщений, а не просто сообщением
  let message = req.flash('error')
  if (message.length > 0) {
    message = message[0]
  } else {
    message = null
  }

  res.render('auth/reset', {
    pageTitle: 'Reset password',
    path: '/reset',
    errorMessage: message,
  })
}

// Запрос на сброс пароля
exports.postReset = (req, res, next) => {
  // Генерируем токен для сброса пароля
  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      console.log('Error from postReset crypto.randomBytes: ', err)
      return res.redirect('/reset')
    }

    // Передаем hex, т.к. буфер в hex и мы хотим сразу сконвертировать в ASCII
    const token = buffer.toString('hex')

    User.findOne({
      email: req.body.email,
    })
      .then((user) => {
        if (!user) {
          req.flash('error', 'No account with that email found')

          return res.redirect('/reset')
        }

        user.resetToken = token
        // resetTokenExpiration - 1 час
        user.resetTokenExpiration = Date.now() + 3600000

        user.save()
      })
      .then((result) => {
        res.redirect('/')

        transporter.sendMail({
          to: req.body.email,
          from: 'shop@myshop.com',
          subject: 'Password reset',
          html: `
          <p>You requested a password reset</p>
          <p>Click this <a href="http://localhost:3000/reset/${token}">link</a> to set new password</p>
          `,
        })
      })
      .catch((err) => {
        console.log('Error from postReset User.findOne: ', err)
      })
  })
}

// Страница для ввода нового пароля
exports.getNewPassword = (req, res, next) => {
  const token = req.params.token

  // $gt - resetTokenExpiration должна быть больше - gt - greater - чем текущий момент времени
  User.findOne({ resetToken: token, resetTokenExpiration: { $gt: Date.now() } })
    .then((user) => {
      // message будет массивом сообщений, а не просто сообщением
      let message = req.flash('error')
      if (message.length > 0) {
        message = message[0]
      } else {
        message = null
      }

      console.log(user._id.toString())
      res.render('auth/new-password', {
        pageTitle: 'New password',
        path: '/new-password',
        errorMessage: message,
        userId: user._id.toString(),
        passwordToken: token,
      })
    })
    .catch((err) => {
      console.log('Error from getNewPassword User.findOne: ', err)
    })
}

// Усатновка нового пароля
exports.postNewPassword = (req, res, next) => {
  const newPassword = req.body.password
  const userId = req.body.userId
  const passwordToken = req.body.passwordToken
  let resetUser

  // $gt - resetTokenExpiration должна быть больше - gt - greater - чем текущий момент времени
  User.findOne({ resetToken: passwordToken, resetTokenExpiration: { $gt: Date.now() }, _id: userId })
    .then((user) => {
      resetUser = user

      return bcrypt.hash(newPassword, 12)
    })
    .then((hashedPassword) => {
      resetUser.password = hashedPassword
      resetUser.resetToken = undefined
      resetUser.resetTokenExpiration = undefined

      return resetUser.save()
    })
    .then((result) => {
      res.redirect('/login')
    })
    .catch((err) => {
      console.log('Error from postNewPassword User.findOne: ', err)
    })
}
