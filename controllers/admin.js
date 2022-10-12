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

  const product = new Product(null, title, imageUrl, description, price)
  product
    .save()
    .then(() => {
      res.redirect('/')
    })
    .catch((err) => console.log(err))
}

exports.getEditProduct = (req, res, next) => {
  // Доп проверка на то, что продукт реактируется - передача в query-параметре edit = 'true'
  const editMode = req.query.edit

  if (!editMode) {
    return res.redirect('/')
  }

  const prodId = req.params.productId

  // Ищем в БД продукт по ID. Если нашли, возвращаем форму для редактирования и передаем в этот шаблон данные о продукте
  Product.findById(prodId, (product) => {
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
}

// Обновление информации о продукте
exports.postEditProduct = (req, res, next) => {
  const prodId = req.body.productId
  const updatedTitle = req.body.title
  const updatedPrice = req.body.price
  const updatedImageUrl = req.body.imageUrl
  const updatedDesc = req.body.description

  const updatedProduct = new Product(prodId, updatedTitle, updatedImageUrl, updatedDesc, updatedPrice)

  updatedProduct.save()

  res.redirect('/admin/products')
}

exports.getProducts = (req, res, next) => {
  // Метод render добавляется движком шаблонизатора
  Product.fetchAll((products) => {
    res.render('admin/products', {
      prods: products,
      pageTitle: 'Admin Products',
      path: 'admin/products',
    })
  })
}

exports.postDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId

  Product.deleteById(prodId)
  res.redirect('/admin/products')
}
