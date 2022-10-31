const mongoose = require('mongoose')

const fileHelper = require('../util/file')

const { validationResult } = require('express-validator/check')

const Product = require('../models/product')

exports.getAddProduct = (req, res, next) => {
  // private route
  if (!req.session.isLoggedIn) {
    return res.redirect('/login')
  }

  // Метод render добавляется движком шаблонизатора
  // edit-product - универсальная форма для добавления или роедактирования продукта
  res.render('admin/edit-product', {
    pageTitle: 'Add Product',
    path: '/admin/add-product',
    // Фалаг editing указывает на то, является ли это режимом редактирования (true) существующего товара или режимом добавления (false) нового товара
    editing: false,
    // Наличие ошибок валидации
    hasError: false,
    errorMessage: null,
    validationErrors: [],
  })
}

// Добавление нового продукта
exports.postAddProduct = (req, res, next) => {
  const title = req.body.title
  // Файл хранится в req.file
  const image = req.file
  const price = req.body.price
  const description = req.body.description

  // Если image === undefined, значит multer не пропустил файл из-за неправльного расширения
  if (!image) {
    return res.status(422).render('admin/edit-product', {
      pageTitle: 'Add Product',
      path: '/admin/add-product',
      // Фалаг editing указывает на то, является ли это режимом редактирования (true) существующего товара или режимом добавления (false) нового товара
      editing: false,
      hasError: true,
      product: {
        title: title,
        price: price,
        description: description,
      },
      errorMessage: 'Attached file is not an image',
      validationErrors: [],
    })
  }

  const errors = validationResult(req)

  // Если есть ошибки валидации, снова возвращаем ту же страницу
  if (!errors.isEmpty()) {
    return res.status(422).render('admin/edit-product', {
      pageTitle: 'Add Product',
      path: '/admin/add-product',
      // Фалаг editing указывает на то, является ли это режимом редактирования (true) существующего товара или режимом добавления (false) нового товара
      editing: false,
      hasError: true,
      product: {
        title: title,
        price: price,
        description: description,
      },
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array(),
    })
  }

  // Путь на диске к загурженному файлу
  const imageUrl = image.path

  // Product - это модель
  // В модель Product передаем объект в соответствии со схемой productSchema
  const product = new Product({
    title: title,
    price: price,
    description: description,
    imageUrl: imageUrl,
    userId: req.user._id,
  })

  product
    // Метод save предоставляет mongoose
    .save()
    .then((result) => {
      console.log('Created Product')
      res.redirect('/admin/products')
    })
    .catch((err) => {
      console.log('Error from postAddProduct: ', err)

      //   res.redirect('/500')

      const error = new Error(err)
      error.httpStatusCode = 500

      // Передача ошибки в качестве аргумента в скажет Express пропустить все остальные middleWare и перейти к middleware для обработки ошибок - Error Handling Middleware
      return next(error)
    })
}

exports.getProducts = (req, res, next) => {
  // find - метод из mongoose
  Product.find({ userId: req.user._id })
    // select - для найденных элементов получить только указанные поля - title price
    // минус "-" перед _id - удалить данные об _id из полученных объектов
    // .select('title price -_id')
    // populate - если установлена связь между объектами, то по указанному полю мы получим все данные о связанном объекте в поле userId
    // .populate('userId')
    // Или вторым параметром можем указать, какие именно данные о связанном оюъекте мы хотим получить
    // .populate('userId', 'name')
    .then((products) => {
      console.log(products)
      res.render('admin/products', {
        prods: products,
        pageTitle: 'Admin Products',
        path: 'admin/products',
      })
    })
    .catch((err) => {
      console.log('Error from getProducts: ', err)

      const error = new Error(err)
      error.httpStatusCode = 500

      return next(error)
    })
}

// Страница для редактирования документа
exports.getEditProduct = (req, res, next) => {
  // Доп проверка на то, что продукт реактируется - передача в query-параметре edit = 'true'
  const editMode = req.query.edit

  if (!editMode) {
    return res.redirect('/')
  }

  const prodId = req.params.productId

  Product.findById(prodId)
    .then((product) => {
      // Метод render добавляется движком шаблонизатора
      // edit-product - универсальная форма для добавления или роедактирования продукта
      res.render('admin/edit-product', {
        pageTitle: 'Edit Product',
        path: '/admin/edit-product',
        // Фалаг editing указывает на то, является ли это режимом редактирования (true) существующего товара или режимом добавления (false) нового товара
        editing: editMode,
        product: product,
        // Наличие ошибок валидации
        hasError: false,
        errorMessage: null,
        validationErrors: [],
      })
    })
    .catch((err) => {
      console.log('Error from getEditProduct: ', err)

      const error = new Error(err)
      error.httpStatusCode = 500

      return next(error)
    })
}

// Обновление информации о продукте
exports.postEditProduct = (req, res, next) => {
  const prodId = req.body.productId

  const updatedTitle = req.body.title
  const updatedPrice = req.body.price
  const image = req.file
  const updatedDesc = req.body.description

  const errors = validationResult(req)

  // Если есть ошибки валидации, снова возвращаем ту же страницу
  if (!errors.isEmpty()) {
    return res.status(422).render('admin/edit-product', {
      pageTitle: 'Edit Product',
      path: '/admin/edit-product',
      // Фалаг editing указывает на то, является ли это режимом редактирования (true) существующего товара или режимом добавления (false) нового товара
      editing: true,
      hasError: true,
      product: {
        title: updatedTitle,
        price: updatedPrice,
        description: updatedDesc,
        _id: prodId,
      },
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array(),
    })
  }

  Product.findById(prodId)
    // Мы получили product и благодаря mongoose можем мутировать этот объек, а потом вызвать save()
    .then((product) => {
      // Если текущий пользователь не является создателем этого продукта, то заканчиваем и делаем редирект - доп защита
      if (product.userId.toString() !== req.user._id.toString()) {
        return res.redirect('/')
      }

      product.title = updatedTitle
      product.price = updatedPrice
      product.description = updatedDesc

      // Если новый файл не загружен, тогда сохраним прежнее изображение (старый путь к файлу) - не будем обновлять это поле в БД
      if (image) {
        // Удаляем старый файл изображения
        fileHelper.deleteFile(product.imageUrl)

        product.imageUrl = image.path
      }

      return product.save().then(() => {
        console.log('UPDATED PRODUCT')
        res.redirect('/admin/products')
      })
    })
    .catch((err) => {
      console.log('Error from postEditProduct: ', err)

      const error = new Error(err)
      error.httpStatusCode = 500

      return next(error)
    })
}

exports.postDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId

  Product.findById(prodId)
    .then((product) => {
      if (!product) {
        return next(new Error('Product not found'))
      }

      // Удаляем старый файл изображения
      fileHelper.deleteFile(product.imageUrl)

      return Product.deleteOne({ _id: prodId, userId: req.user._id })
    })
    .then(() => {
      console.log('DESTROYED PRODUCT')
      res.redirect('/admin/products')
    })
    .catch((err) => {
      console.log('Error from postDeleteProduct: ', err)

      const error = new Error(err)
      error.httpStatusCode = 500

      return next(error)
    })

  // findByIdAndRemove - метод из mongoose
  //   Product.findByIdAndRemove(prodId)
  // Если текущий пользователь не является создателем этого продукта, то заканчиваем и делаем редирект - доп защита
}
