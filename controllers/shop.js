const Product = require('../models/product')
const Order = require('../models/Order')

exports.getProducts = (req, res, next) => {
    // find - метод из mongoose
  Product.find()
    .then((products) => {
      res.render('shop/product-list', {
        prods: products,
        pageTitle: 'All Products',
        path: '/products',
        isAuthenticated: req.session.isLoggedIn,
      })
    })
    .catch((err) => {
      console.log('ERROR: ', err)
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
        isAuthenticated: req.session.isLoggedIn,
      })
    })
    .catch((err) => console.log(err))
}

exports.getIndex = (req, res, next) => {
  // find - метод из mongoose
  Product.find()
    .then((products) => {
      res.render('shop/index', {
        prods: products,
        pageTitle: 'Shop',
        path: '/',
        isAuthenticated: req.session.isLoggedIn,
      })
    })
    .catch((err) => {
      console.log('Error from getIndex: ', err)
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
        isAuthenticated: req.session.isLoggedIn,
      })
    })
    .catch((err) => {
      console.log('Error from controllers.shop getCart: ', err)
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
          name: req.user.name,
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
        isAuthenticated: req.session.isLoggedIn,
      })
    })
    .catch((err) => {
      console.log('Error from getOrders: ', err)
    })
}
