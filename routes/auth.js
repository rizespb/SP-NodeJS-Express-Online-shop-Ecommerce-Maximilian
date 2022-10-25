const express = require('express')

const authController = require('../controllers/auth')

const router = express.Router()

router.get('/login', authController.getLogin)

router.get('/signup', authController.getSignup)

router.post('/login', authController.postLogin)

router.post('/signup', authController.postSignup)

router.post('/logout', authController.postLogout)

// Страница сброса пароля
router.get('/reset', authController.getReset)

// Запрос на сброс пароля
router.post('/reset', authController.postReset)

// Страница ввода нового пароля
router.get('/reset/:token', authController.getNewPassword)

// Запрос на установку нового пароля
router.get('/new-password', authController.postNewPassword)

module.exports = router
