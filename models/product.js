const mongodb = require('mongodb')
const getDb = require('../util/database').getDb

class Product {
  constructor(title, price, description, imageUrl, id) {
    this.title = title
    this.price = price
    this.description = description
    this.imageUrl = imageUrl
    // _id Добавили для возможности обновления продукта
    this._id = id ? new mongodb.ObjectId(id) : null
  }

  // Метод для сохранения в БД нового объекта и редактирования существующего
  save() {
    const db = getDb()
    let dbOperation

    if (this._id) {
      // Елси _id есть, то обновляем продукт (произошло редактирование Edit)
      // Монго автоматически формирует _id, но это не JS-тип. Это спец объект ObjectId. Поэтому надо в качестве id передавать сущность класса ObjectId
      // $set - что изменить в документе
      dbOperation = db.collection('products').updateOne({ _id: this._id }, { $set: this })
    } else {
      // Если _id нет, тогда создаем новый продукт
      dbOperation = db.collection('products').insertOne(this)
    }

    return dbOperation
      .then((result) => {
        console.log('Result from save', result)
      })
      .catch((err) => console.log('Error from Product.save: ', err))
  }

  static fetchAll() {
    const db = getDb()

    // return db.collection('products').find({title: 'Book'})
    return (
      db
        .collection('products')
        .find()
        //   Cursor – объект, возвращаемый из коллекции, например, методом find. Из коллекции может вернуться миллион документов. Но все они нам не нужны. Поэтому мы получаем Курсор, который поможет нам пройтись по этому объекту и получить, скажем, первые 10 документов.
        .toArray()
        .then((products) => {
          console.log(products)
          return products
        })
        .catch((err) => console.log('Error from Product.fetchAll: ', err))
    )
  }

  static findById(prodId) {
    const db = getDb()

    return (
      db
        .collection('products')
        // Монго автоматически формирует _id, но это не JS-тип. Это спец объект ObjectId. Поэтому надо в качестве id передавать сущность класса ObjectId
        .find({ _id: new mongodb.ObjectId(prodId) })
        // Cursor – объект, возвращаемый из коллекции, например, методом find. Из коллекции может вернуться миллион документов. Но все они нам не нужны. Поэтому мы получаем Курсор, который поможет нам пройтись по этому объекту и получить, скажем, первые 10 документов.
        // next возвращает последний из найденных документов
        .next()
        .then((product) => {
          console.log(product)
          return product
        })
        .catch((err) => console.log('Error from Product.findById: ', err))
    )
  }

  static deleteById(prodId) {
    const db = getDb()

    return db
      .collection('products')
      .deleteOne({ _id: new mongodb.ObjectId(prodId) })
      .then(() => {
        console.log('Deleted')
      })
      .catch((err) => console.log('Error from Product.deleteById: ', err))
  }
}

module.exports = Product

/*
/////////////////////////////////// ВАРИНАТ Sequelize //////////////////////////
/// Ниже представлен второй вариант кода для работы с sql БД через Sequelize
const Sequelize = require('sequelize')

const sequelize = require('../util/database')

// 1st - 'product' - имя модели
// 2st - Описание структуры таблицы - полей и пр.
const Product = sequelize.define('product', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    // id будет являться первичным ключом, по которому будут выстраиваться связи между таблицами
    primaryKey: true,
  },
  title: Sequelize.STRING,
  price: {
    type: Sequelize.DOUBLE,
    allowNull: false,
  },
  imageUrl: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  description: {
    type: Sequelize.STRING,
    allowNull: false,
  },
})

module.exports = Product


*/

/*
/////////////////////////////////// ВАРИНАТ SQL ////////////////////////////////
/// Ниже представлен второй вариант кода для работы с sql БД напрямую
const db = require('../util/database')

const Cart = require('./cart')

module.exports = class Product {
  constructor(id, title, imageUrl, description, price) {
    this.id = id
    this.title = title
    this.imageUrl = imageUrl
    this.description = description
    this.price = price
  }

  save() {
    // Создать новую запись в таблице
    // id не передаем, он будет сгененрирован автоматически
    // Для обеспечения безопасности
    // Вторым параметром в execute передаем значения
    return db.execute('INSERT INTO products (title, price, imageUrl, description) VALUES (?, ?, ?, ?)', [
      this.title,
      this.price,
      this.imageUrl,
      this.description,
    ])
  }

  static deleteById(id) {}

  static fetchAll() {
    // Получить все поля из products
    return db.execute('SELECT * FROM products')
  }

  static findById(id) {
    return db.execute('SELECT * FROM products WHERE products.id = ?', [id])
  }
}
*/

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/*
/// Ниже представлен первоначальный код для работы с файлами в качестве хранилища данных
const fs = require('fs')
const path = require('path')

const Cart = require('./cart')

// p - путь к файлу - корневой каталог / data / products.json
const p = path.join(path.dirname(process.mainModule.filename), 'data', 'products.json')

const getProductsFromFile = (callback) => {
  fs.readFile(p, (err, fileContent) => {
    if (err) {
      callback([])
    } else {
      callback(JSON.parse(fileContent))
    }
  })
}

module.exports = class Product {
  constructor(id, title, imageUrl, description, price) {
    this.id = id
    this.title = title
    this.imageUrl = imageUrl
    this.description = description
    this.price = price
  }

  save() {
    // getProductsFromFile принимает коллбэк
    getProductsFromFile((products) => {
      // Для создания нового прдукта или обновления существующего будет использоваться один метод save
      // Но каждый раз все равно создаем новый экземпляр Product.
      // Если передали ID в constructor- тогда это обновление существующего
      // Если передали null в качестве ID - добавление нового продукта
      if (this.id) {
        const existingProductIndex = products.findIndex((prod) => prod.id === this.id)

        const updatedProducts = [...products]
        updatedProducts[existingProductIndex] = this

        fs.writeFile(p, JSON.stringify(updatedProducts), (err) => {
          console.log(err)
        })
      } else {
        // Использование Math.random не оптимально, но достаточно в рамках текущего проекта
        this.id = Math.random().toString()

        products.push(this)

        fs.writeFile(p, JSON.stringify(products), (err) => {
          console.log(err)
        })
      }
    })
  }

  static deleteById(id) {
    getProductsFromFile((products) => {
      const product = products.find((prod) => prod.id === id)

      const updatedProducts = products.filter((product) => product.id !== id)

      fs.writeFile(p, JSON.stringify(updatedProducts), (err) => {
        if (!err) {
          Cart.deleteProduct(id, product.price)
        }
      })
    })
  }

  static fetchAll(callback) {
    getProductsFromFile(callback)
  }

  static findById(id, callback) {
    getProductsFromFile((products) => {
      const product = products.find((product) => product.id === id)

      callback(product)
    })
  }
}
*/
