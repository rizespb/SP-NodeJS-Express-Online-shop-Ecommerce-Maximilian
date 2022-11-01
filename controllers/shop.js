const fs = require('fs')
const path = require('path')

const PDFDocument = require('pdfkit')

const Product = require('../models/product')
const Order = require('../models/Order')

// Количество товаров на странице
const ITEMS_PER_PAGE = 2

exports.getProducts = (req, res, next) => {
  // Пагинация
  const page = req.query.page || 1
  let totalItems

  Product.find()
    .countDocuments()
    .then((numProducts) => {
      totalItems = numProducts

      // find - метод из mongoose
      return (
        Product.find()
          // Для пагинации: пропускаем skip указанное количество результатов
          // limit - получить указанное количество документов
          .skip((page - 1) * ITEMS_PER_PAGE)
          .limit(ITEMS_PER_PAGE)
      )
    })
    .then((products) => {
      res.render('shop/product-list', {
        prods: products,
        pageTitle: 'Products',
        path: '/products',
        currentPage: +page,
        hasNextPage: ITEMS_PER_PAGE * page < totalItems,
        hasPreviousPage: page > 1,
        nextPage: +page + 1,
        previousPage: page - 1,
        lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE),
      })
    })
    .catch((err) => {
      console.log('ERROR: ', err)

      const error = new Error(err)
      error.httpStatusCode = 500

      return next(error)
    })
}

exports.getProduct = (req, res, next) => {
  const prodId = req.params.productId

  // findById - метод из mongoose
  Product.findById(prodId)
    .then((product) => {
      res.render('shop/product-detail', {
        product: product,
        pageTitle: product.title,
        path: '/products',
      })
    })
    .catch((err) => console.log(err))
}

exports.getIndex = (req, res, next) => {
  // Пагинация
  const page = req.query.page || 1
  let totalItems

  Product.find()
    .countDocuments()
    .then((numProducts) => {
      totalItems = numProducts

      // find - метод из mongoose
      return (
        Product.find()
          // Для пагинации: пропускаем skip указанное количество результатов
          // limit - получить указанное количество документов
          .skip((page - 1) * ITEMS_PER_PAGE)
          .limit(ITEMS_PER_PAGE)
      )
    })
    .then((products) => {
      res.render('shop/index', {
        prods: products,
        pageTitle: 'Shop',
        path: '/',
        currentPage: +page,
        hasNextPage: ITEMS_PER_PAGE * page < totalItems,
        hasPreviousPage: page > 1,
        nextPage: +page + 1,
        previousPage: page - 1,
        lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE),
      })
    })
    .catch((err) => {
      console.log('Error from getIndex: ', err)

      const error = new Error(err)
      error.httpStatusCode = 500

      return next(error)
    })
}

exports.getCart = (req, res, next) => {
  // Мы добавили объект user в запрос res в middleWare в app.js
  // Метод getCart у юзеров после установления связей в app.js Cart.belongsTo(User)
  req.user
    // Наполнить поле productId данными о связанном объекте
    .populate('cart.items.productId')
    .then((user) => {
      const products = user.cart.items

      res.render('shop/cart', {
        pageTitle: 'Your cart',
        path: '/cart',
        products: products,
      })
    })
    .catch((err) => {
      console.log('Error from controllers.shop getCart: ', err)

      const error = new Error(err)
      error.httpStatusCode = 500

      return next(error)
    })
}

// Добавить товар в корзину
exports.postCart = (req, res, next) => {
  const prodId = req.body.productId

  Product.findById(prodId)
    .then((product) => {
      return req.user.addToCart(product)
    })
    .then((result) => {
      console.log(result)
      res.redirect('/cart')
    })
    .catch((err) => {
      console.log('Error from controllers.shop postCart: ', err)

      const error = new Error(err)
      error.httpStatusCode = 500

      return next(error)
    })
}

// Удаление товара из корзины
exports.postCartDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId

  // Мы добавили объект user в запрос res в middleWare в app.js
  req.user
    .removeFromCart(prodId)
    .then((result) => {
      res.redirect('/cart')
    })
    .catch((err) => {
      console.log('Error from postCartDeleteProduct: ', err)

      const error = new Error(err)
      error.httpStatusCode = 500

      return next(error)
    })
}

// Создать заказ
exports.postOrder = (req, res, next) => {
  req.user
    // Наполнить поле productId данными о связанном объекте
    .populate('cart.items.productId')
    .then((user) => {
      const products = user.cart.items.map((item) => {
        return {
          quantity: item.quantity,
          // _doc позволит нам получить все данные по связонному продукту
          product: { ...item.productId._doc },
        }
      })

      const order = new Order({
        user: {
          // Мы добавили объект user в запрос res в middleWare в app.js
          email: req.user.email,
          // Mongoose сам вытащит из user его _id
          userId: req.user,
        },
        products: products,
      })

      return order.save()
    })
    .then((result) => {
      return req.user.clearCart()
    })
    .then(() => {
      res.redirect('/orders')
    })
    .catch((err) => {
      console.log('Error from controller shop postOrder: ', err)

      const error = new Error(err)
      error.httpStatusCode = 500

      return next(error)
    })
}

// Получение списка заказов для конкретного пользователя
exports.getOrders = (req, res, next) => {
  Order.find({ 'user.userId': req.user._id })
    .then((orders) => {
      //   console.log(orders[0].products[0].orderItem)
      res.render('shop/orders', {
        pageTitle: 'Your Orders',
        path: '/orders',
        orders: orders,
      })
    })
    .catch((err) => {
      console.log('Error from getOrders: ', err)

      const error = new Error(err)
      error.httpStatusCode = 500

      return next(error)
    })
}

exports.getInvoice = (req, res, next) => {
  const orderId = req.params.orderId

  Order.findById(orderId)
    .then((order) => {
      if (!order) {
        return next(new Error('No order found'))
      }

      // Если инвойс не принадлежит пользователю, тогда прокидываем ошибку
      if (order.user.userId.toString() !== req.user._id.toString()) {
        return next(new Error('Unauthorized requset for invoice'))
      }

      const invoiceName = 'invoice-' + orderId + '.pdf'
      const invoicePath = path.join('data', 'invoices', invoiceName)

      const pdfDoc = new PDFDocument()

      res.setHeader('Content-type', 'application/pdf')
      // Указывает браузеру, что делать с файлом
      // inline - открыть в браузере
      // filename - имя файла, которое будет дано скачиваемому файлу
      res.setHeader('Content-disposition', 'inline; filename="' + invoiceName + '"')

      // Создаем поток через pipe для записи этого файла через поток диск
      pdfDoc.pipe(fs.createWriteStream(invoicePath))
      // Параллельно создаем pipe для отправки этого файла
      pdfDoc.pipe(res)

      pdfDoc.fontSize(26).text('Invoice', {
        underline: true,
      })

      pdfDoc.text('--------------------------------------')

      let totalPrice = 0
      order.products.forEach((prod) => {
        totalPrice += prod.quantity * prod.product.price

        pdfDoc.fontSize(14).text(prod.product.title + ' - ' + prod.quantity + ' x ' + '$' + prod.product.price)
      })

      pdfDoc.text('------')
      pdfDoc.fontSize(20).text('Total Price: $' + totalPrice)

      // end скажет, что запись закончена и можно отсылать файл
      pdfDoc.end()

      // Синхронное чтение и отправка
      //   fs.readFile(invoicePath, (err, data) => {
      //     if (err) {
      //       return next(err)
      //     }

      //     res.setHeader('Content-type', 'application/pdf')
      //     res.setHeader('Content-disposition', 'inline; filename="' + invoiceName + '"')
      //     res.send(data)
      //   })

      //   // Асинхронное чтение и отправка
      //   const file = fs.createReadStream(invoicePath)
      //   res.setHeader('Content-type', 'application/pdf')
      //   res.setHeader('Content-disposition', 'inline; filename="' + invoiceName + '"')

      //   // Направляем считанную часть данных сразу в объект response, создавая поток между сервером и браузером
      //   file.pipe(res)
    })
    .catch((err) => {
      console.log('Error from getInvoice: ', err)

      next(err)
    })
}
