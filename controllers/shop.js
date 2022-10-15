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
    .then((cart) => {
      return cart
        .getProducts()
        .then((products) => {
          res.render('shop/cart', {
            pageTitle: 'Your cart',
            path: '/cart',
            products: products,
          })
        })
        .catch((err) => {
          console.log('Error from cart.getProducts: ', err)
        })
    })
    .catch((err) => {
      console.log('Error from getCart: ', err)
    })
}

// Добавить товар в корзину
exports.postCart = (req, res, next) => {
  const prodId = req.body.productId

  let fetchedCart

  let newQuantity = 1

  // Мы добавили объект user в запрос res в middleWare в app.js
  req.user
    .getCart()
    .then((cart) => {
      fetchedCart = cart

      // Метод getCart у юзеров после установления связей в app.js Cart.belongsTo(User)
      return cart.getProducts({ where: { id: prodId } })
    })
    .then((products) => {
      let product

      if (products.length > 0) {
        product = products[0]
      }

      if (product) {
        const oldQuantity = product.cartItem.quantity

        newQuantity = oldQuantity + 1

        return product
      }

      // Ищем продукт по primary key в таблице Product
      return Product.findByPk(prodId)
    })
    .then((product) => {
      return fetchedCart.addProduct(product, {
        through: {
          quantity: newQuantity,
        },
      })
    })
    .then(() => {
      res.redirect('/cart')
    })
    .catch((err) => {
      console.log('Error from postCart: ', err)
    })
}

// Удаление товара из корзины
exports.postCartDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId

  // Мы добавили объект user в запрос res в middleWare в app.js
  req.user
    .getCart()
    .then((cart) => {
      return cart.getProducts({ where: { id: prodId } })
    })
    .then((products) => {
      const product = products[0]
      return product.cartItem.destroy()
    })
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
    .getCart()
    .then((cart) => {
      fetchedCart = cart
      return cart.getProducts()
    })
    .then((products) => {
      return req.user
        .createOrder()
        .then((order) => {
          // Добавляем в заказ продукт из корзины, предварительно добавляя количество этого продукта в корзине
          return order.addProducts(
            products.map((product) => {
              product.orderItem = { quantity: product.cartItem.quantity }

              return product
            })
          )
        })
        .then((result) => {
          // Очищаем корзину после формирования заказа
          return fetchedCart.setProducts(null)
        })
        .then((result) => {
          res.redirect('/orders')
        })
        .catch((err) => {
          console.log('Error from req.user.createOrder: ', err)
        })
    })
    .catch((err) => {
      console.log('Error from postOrder: ', err)
    })
}

exports.getOrders = (req, res, next) => {
  // Мы добавили объект user в запрос res в middleWare в app.js
  req.user
    .getOrders({ include: ['products'] })
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
