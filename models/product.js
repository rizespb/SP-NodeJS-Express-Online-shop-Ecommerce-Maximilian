const mongoose = require('mongoose')

const Schema = mongoose.Schema

const productSchema = new Schema({
  //   title: String,
  title: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  imageUrl: {
    type: String,
    required: true,
  },
})

// 1st - Model name
// 2nd Schema
module.exports = mongoose.model('Product', productSchema)

// const mongodb = require('mongodb')
// const getDb = require('../util/database').getDb

// class Product {
//   constructor(title, price, description, imageUrl, prodId, userId) {
//     this.title = title
//     this.price = price
//     this.description = description
//     this.imageUrl = imageUrl
//     // _id Добавили для возможности обновления продукта
//     this._id = prodId ? new mongodb.ObjectId(prodId) : null
//     // Для понимания, какой пользователь создал объект
//     this.userId = userId
//   }

//   // Метод для сохранения в БД нового объекта и редактирования существующего
//   save() {
//     const db = getDb()
//     let dbOperation

//     if (this._id) {
//       // Елси _id есть, то обновляем продукт (произошло редактирование Edit)
//       // Монго автоматически формирует _id, но это не JS-тип. Это спец объект ObjectId. Поэтому надо в качестве id передавать сущность класса ObjectId
//       // $set - что изменить в документе
//       dbOperation = db.collection('products').updateOne({ _id: this._id }, { $set: this })
//     } else {
//       // Если _id нет, тогда создаем новый продукт
//       dbOperation = db.collection('products').insertOne(this)
//     }

//     return dbOperation
//       .then((result) => {
//         console.log('Result from save', result)
//       })
//       .catch((err) => console.log('Error from Product.save: ', err))
//   }

//   static fetchAll() {
//     const db = getDb()

//     // return db.collection('products').find({title: 'Book'})
//     return (
//       db
//         .collection('products')
//         .find()
//         //   Cursor – объект, возвращаемый из коллекции, например, методом find. Из коллекции может вернуться миллион документов. Но все они нам не нужны. Поэтому мы получаем Курсор, который поможет нам пройтись по этому объекту и получить, скажем, первые 10 документов.
//         .toArray()
//         .then((products) => {
//           console.log(products)
//           return products
//         })
//         .catch((err) => console.log('Error from Product.fetchAll: ', err))
//     )
//   }

//   static findById(prodId) {
//     const db = getDb()

//     return (
//       db
//         .collection('products')
//         // Монго автоматически формирует _id, но это не JS-тип. Это спец объект ObjectId. Поэтому надо в качестве id передавать сущность класса ObjectId
//         .find({ _id: new mongodb.ObjectId(prodId) })
//         // Cursor – объект, возвращаемый из коллекции, например, методом find. Из коллекции может вернуться миллион документов. Но все они нам не нужны. Поэтому мы получаем Курсор, который поможет нам пройтись по этому объекту и получить, скажем, первые 10 документов.
//         // next возвращает первый (или последний?) из найденных документов
//         .next()
//         .then((product) => {
//           console.log(product)
//           return product
//         })
//         .catch((err) => console.log('Error from Product.findById: ', err))
//     )
//   }

//   static deleteById(prodId) {
//     const db = getDb()

//     return db
//       .collection('products')
//       .deleteOne({ _id: new mongodb.ObjectId(prodId) })
//       .then(() => {
//         console.log('Deleted')
//       })
//       .catch((err) => console.log('Error from Product.deleteById: ', err))
//   }
// }

// module.exports = Product
