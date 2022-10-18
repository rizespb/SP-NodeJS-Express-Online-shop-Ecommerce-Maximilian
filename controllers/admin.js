const Product = require('../models/product')

exports.getAddProduct = (req, res, next) => {
  // Метод render добавляется движком шаблонизатора
  // edit-product - универсальная форма для добавления или роедактирования продукта
  res.render('admin/edit-product', {
    pageTitle: 'Add Product',
    path: '/admin/add-product',
    // Фалаг editing указывает на то, является ли это режимом редактирования (true) существующего товара или режимом добавления (false) нового товара
    editing: false,
  })
}

// Добавление нового продукта
exports.postAddProduct = (req, res, next) => {
  const title = req.body.title
  const imageUrl = req.body.imageUrl
  const price = req.body.price
  const description = req.body.description

  // Product - это модель
  // В модель Product передаем объект в соответствии со схемой productSchema
  const product = new Product({
    title: title,
    price: price,
    description: description,
    imageUrl: imageUrl,
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
    })
}

exports.getProducts = (req, res, next) => {
  Product.fetchAll()
    .then((products) => {
      res.render('admin/products', {
        prods: products,
        pageTitle: 'Admin Products',
        path: 'admin/products',
      })
    })
    .catch((err) => console.log('Error from getProducts: ', err))
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
      if (!product) {
        return res.redirect('/')
      }

      // Метод render добавляется движком шаблонизатора
      // edit-product - универсальная форма для добавления или роедактирования продукта
      res.render('admin/edit-product', {
        pageTitle: 'Edit Product',
        path: '/admin/edit-product',
        // Фалаг editing указывает на то, является ли это режимом редактирования (true) существующего товара или режимом добавления (false) нового товара
        editing: editMode,
        product: product,
      })
    })
    .catch((err) => {
      console.log('Error from getEditProduct: ', err)
    })
}

// Обновление информации о продукте
exports.postEditProduct = (req, res, next) => {
  const prodId = req.body.productId

  const updatedTitle = req.body.title
  const updatedPrice = req.body.price
  const updatedImageUrl = req.body.imageUrl
  const updatedDesc = req.body.description

  // Добавление _id пятым параметром сигнализиррует методу save, что это обновление продукта, а не создание нового
  const product = new Product(updatedTitle, updatedPrice, updatedDesc, updatedImageUrl, prodId)

  product
    .save()
    .then(() => {
      console.log('UPDATED PRODUCT')
      res.redirect('/admin/products')
    })
    .catch((err) => {
      console.log('Error from postEditProduct: ', err)
    })
}

exports.postDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId

  Product.deleteById(prodId)
    .then(() => {
      console.log('DESTROYED PRODUCT')
      res.redirect('/admin/products')
    })
    .catch((err) => console.log('Error from postDeleteProduct: ', err))
}
