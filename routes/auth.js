const express = require('express')

// Валидация поступающих данных
const { check } = require('express-validator/check')

const authController = require('../controllers/auth')

const router = express.Router()

router.get('/login', authController.getLogin)

router.get('/signup', authController.getSignup)

router.post('/login', authController.postLogin)

// check принимает поле или массив с названиями полей, которые мы хотим валидировать. check будет искать это поле практически везде: в body, headers, в куках и пр. - и валидировать его
router.post('/signup', check('email').isEmail().withMessage('Please enter a valid email'), authController.postSignup)

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
