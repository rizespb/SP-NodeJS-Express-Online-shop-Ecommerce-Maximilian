const express = require('express')

// Валидация поступающих данных
const { check, body } = require('express-validator/check')

const authController = require('../controllers/auth')

const User = require('../models/user')

const router = express.Router()

router.get('/login', authController.getLogin)

router.get('/signup', authController.getSignup)

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Please enter a valid email address.').normalizeEmail(),
    body('password', 'Password has to be valid.').isLength({ min: 4 }).isAlphanumeric().trim(),
  ],
  authController.postLogin
)

// check принимает поле или массив с названиями полей, которые мы хотим валидировать. check будет искать это поле практически везде: в body, headers, в куках и пр. - и валидировать его
router.post(
  '/signup',
  [
    check('email')
      .isEmail()
      .withMessage('Please enter a valid email')
      // Можно добавить свой собственный кастомный валидатор
      // Он должен прокидывать ошибку, если value содержит ошибки
      .custom((value, { req }) => {
        // if (value === 'testtest@test.com') {
        //   throw new Error('This email address is forbidden')
        // }
        // return true

        // custom валидатор может возвращать true/error или Просим
        // Зарезолвленнйы просим - валидация прошла
        // Отклоненный промис - валидация не прошла
        // Проверяем, не занят ли такой емейл
        return User.findOne({ email: value }).then((userDoc) => {
          if (userDoc) {
            return Promise.reject('This email address is forbidden')
          }
        })
      }),
    //isAlphanumeric - циры и буквы
    // 2nd - сообщение об ошибке, которое будет применяться ко ВСЕМ валидаторам
    body('password', 'Please enter a password with only numbers and text ahs at least 4 characters').isLength({ min: 4 }).isAlphanumeric(),
    body('confirmPassword').custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Passwords have to match!')
      }
    }),
  ],
  authController.postSignup
)

router.post('/logout', authController.postLogout)

// Страница сброса пароля
router.get('/reset', authController.getReset)

// Запрос на сброс пароля
router.post('/reset', authController.postReset)

// Страница ввода нового пароля
router.get('/reset/:token', authController.getNewPassword)

// Запрос на установку нового пароля
router.post('/new-password', authController.postNewPassword)

module.exports = router
