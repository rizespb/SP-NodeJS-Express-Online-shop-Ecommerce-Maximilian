const Product = require('../models/product')

exports.getAddProduct = (req, res, next) => {
  // Метод render добавляется движком шаблонизатора
  // edit-product - универсальная форма для добавления или роедактирования продукта
  res.render('admin/edit-product', {
    pageTitle: 'Add Product',
    path: '/admin/add-product',
    // Фалаг editing указывает на то, является ли это режимом редактирования (true) существующего товара или режимом добавления (false) нового товара
    editing: false,
    isAuthenticated: req.session.isLoggedIn,
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
    })
}

exports.getProducts = (req, res, next) => {
  // find - метод из mongoose
  Product.find()
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
        isAuthenticated: req.session.isLoggedIn,
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
        isAuthenticated: req.session.isLoggedIn,
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

  Product.findById(prodId)
    // Мы получили product и благодаря mongoose можем мутировать этот объек, а потом вызвать save()
    .then((product) => {
      product.title = updatedTitle
      product.price = updatedPrice
      product.description = updatedDesc
      product.imageUrl = updatedImageUrl

      return product.save()
    })
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

  // findByIdAndRemove - метод из mongoose
  Product.findByIdAndRemove(prodId)
    .then(() => {
      console.log('DESTROYED PRODUCT')
      res.redirect('/admin/products')
    })
    .catch((err) => console.log('Error from postDeleteProduct: ', err))
}
