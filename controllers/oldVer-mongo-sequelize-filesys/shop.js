const Product = require('../models/product')

exports.getProducts = (req, res, next) => {
  Product.fetchAll()
    .then((products) => {
      res.render('shop/product-list', {
        prods: products,
        pageTitle: 'All Products',
        path: '/products',
      })
    })
    .catch((err) => {
      console.log('ERROR: ', err)
    })
}

exports.getProduct = (req, res, next) => {
  const prodId = req.params.productId

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
  Product.fetchAll()
    .then((products) => {
      res.render('shop/index', {
        prods: products,
        pageTitle: 'Shop',
        path: '/',
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
    .getCart()
    .then((products) => {
      res.render('shop/cart', {
        pageTitle: 'Your cart',
        path: '/cart',
        products: products,
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
    .deleteItemFromCart(prodId)
    .then((result) => {
      res.redirect('/cart')
    })
    .catch((err) => {
      console.log('Error from postCartDeleteProduct: ', err)
    })
}

// Создать заказ
exports.postOrder = (req, res, next) => {
  let fetchedCart

  // Мы добавили объект user в запрос res в middleWare в app.js
  req.user
    .addOrder()
    .then((result) => {
      res.redirect('/orders')
    })
    .catch((err) => {
      console.log('Error from controller shop postOrder: ', err)
    })
}

exports.getOrders = (req, res, next) => {
  // Мы добавили объект user в запрос res в middleWare в app.js
  req.user
    .getOrders()
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
    })
}

/* ВАРИНАТ 1 с хранением в файлах
/// Ниже представлен первоначальный код для работы с файлами в качестве хранилища данных
const Product = require('../models/product')
const Cart = require('../models/cart')

exports.getProducts = (req, res, next) => {
  // Метод render добавляется движком шаблонизатора
  Product.fetchAll((products) => {
    res.render('shop/product-list', {
      prods: products,
      pageTitle: 'All Products',
      path: '/products',
    })
  })
}

exports.getProduct = (req, res, next) => {
  const prodId = req.params.productId

  Product.findById(prodId, (product) => {
    res.render('shop/product-detail', {
      product: product,
      pageTitle: product.title,
      path: '/products',
    })
  })
}

exports.getIndex = (req, res, next) => {
  // Метод render добавляется движком шаблонизатора
  Product.fetchAll((products) => {
    res.render('shop/index', {
      prods: products,
      pageTitle: 'Shop',
      path: '/',
    })
  })
}

exports.getCart = (req, res, next) => {
  // Товары в корзине содержат только id и количество
  // Поэтому нам надо взять id каждого товара и найти его в products.json, чтобы потом на странице cart вывести всю инфу о нем
  Cart.getProducts((cart) => {
    Product.fetchAll((products) => {
      const cartProducts = []

      for (product of products) {
        const cartProductData = cart.products.find((prod) => prod.id === product.id)

        if (cartProductData) {
          cartProducts.push({ productData: product, qty: cartProductData.qty })
        }
      }

      res.render('shop/cart', {
        pageTitle: 'Your cart',
        path: '/cart',
        products: cartProducts,
      })
    })
  })
}

// Добавить товар в корзину
exports.postCart = (req, res, next) => {
  const prodId = req.body.productId

  Product.findById(prodId, (product) => {
    Cart.addProduct(prodId, product.price)
  })

  res.redirect('/cart')
}

// Удаление товара из корзины
exports.postCartDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId

  Product.findById(prodId, (product) => {
    Cart.deleteProduct(prodId, product.price)
    res.redirect('/cart')
  })
}

exports.getOrders = (req, res, next) => {
  res.render('shop/orders', {
    pageTitle: 'Your Orders',
    path: '/orders',
  })
}

exports.getCheckout = (req, res, next) => {
  res.render('shop/checkout', {
    pageTitle: 'Checkout',
    path: '/checkout',
  })
}
*/
