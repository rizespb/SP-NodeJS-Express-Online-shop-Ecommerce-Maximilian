const mongodb = require('mongodb')
const getDb = require('../util/database').getDb

const ObjectId = mongodb.ObjectId

class User {
  constructor(username, email, cart, id) {
    this.name = username
    this.email = email
    this.cart = cart // {items:[]}
    this._id = id
  }

  save() {
    const db = getDb()

    return db.collection('users').insertOne(this)
  }

  addToCart(product) {
    const cartProductIndex = this.cart.items.findIndex((cartProduct) => {
      // Чтобы убедиться, что оба id имееют один тип, приводим их к строке
      return cartProduct.productId.toString() === product._id.toString()
    })

    let newQuantity = 1
    const updatedCartItems = [...this.cart.items]

    // Если в корзине уже есть товар, то увеличиваем количество на 1
    // Если нет, то newQuantity = 1
    if (cartProductIndex >= 0) {
      newQuantity = this.cart.items[cartProductIndex].quantity + 1

      updatedCartItems[cartProductIndex].quantity = newQuantity
    } else {
      updatedCartItems.push({
        productId: new ObjectId(product._id),
        quantity: newQuantity,
      })
    }

    const udpatedCart = {
      items: updatedCartItems,
    }

    const db = getDb()

    return db.collection('users').updateOne(
      { _id: new ObjectId(this._id) },
      {
        // На найденном по ID документе user в БД мы обновляем только одно поле cart
        // Т.е. в set передаем объект с полями, которые надо обновить
        $set: {
          cart: udpatedCart,
        },
      }
    )
  }

  getCart() {
    const db = getDb()

    const productIds = this.cart.items.map((item) => {
      return item.productId
    })

    // Получение всех продуктов, чей ID содержится в массиве $in
    // Получаем в виде объекта cursor, который трансформируем с помощью toArray()
    return db
      .collection('products')
      .find({
        _id: {
          $in: productIds,
        },
      })
      .toArray()
      .then((products) => {
        // Добавляем в каждый продукт количество этого продукта в корзине
        return products.map((product) => {
          // Возвращаем объект продукта с количеством этого продукта в корзине
          return {
            ...product,
            // Получаем количество продукта в корзине
            quantity: this.cart.items.find((item) => {
              // Чтобы убедиться, что оба id имееют один тип, приводим их к строке
              return item.productId.toString() === product._id.toString()
            }).quantity,
            //
          }
        })
      })
  }

  deleteItemFromCart(productId) {
    const updatedCartItems = this.cart.items.filter((item) => {
      // Чтобы убедиться, что оба id имееют один тип, приводим их к строке
      return item.productId.toString() !== productId.toString()
    })

    const db = getDb()

    return db.collection('users').updateOne(
      { _id: new ObjectId(this._id) },
      {
        // На найденном по ID документе user в БД мы обновляем только одно поле cart
        // Т.е. в set передаем объект с полями, которые надо обновить
        $set: {
          cart: { items: updatedCartItems },
        },
      }
    )
  }

  addOrder() {
    const db = getDb()

    // Добавляем доп данные в заказ: данные о user, расширенные данные о товарах (название и пр.)
    return (
      this.getCart()
        .then((products) => {
          const order = {
            items: products,
            user: {
              _id: new ObjectId(this._id),
              name: this.name,
            },
          }

          return db.collection('orders').insertOne(order)
        })
        // Очищаем корзину после формирования заказа
        .then((result) => {
          this.cart = {
            items: [],
          }

          return db.collection('users').updateOne(
            { _id: new ObjectId(this._id) },
            {
              // На найденном по ID документе user в БД мы обновляем только одно поле cart
              // Т.е. в set передаем объект с полями, которые надо обновить
              $set: {
                cart: { items: [] },
              },
            }
          )
        })
    )
  }

  getOrders() {
    const db = getDb()

    // return db.collection('orders').
  }

  static findById(userId) {
    const db = getDb()

    // next возвращает первый (или последний?) из найденных документов
    return db
      .collection('users')
      .findOne({ _id: new ObjectId(userId) })
      .then((user) => {
        return user
      })
      .catch((err) => console.log('Error from User.findById: ', err))
  }
}

module.exports = User

/*
/////////////////////////////////// ВАРИНАТ Sequelize //////////////////////////
/// Ниже представлен второй вариант кода для работы с sql БД через Sequelize
const Sequelize = require('sequelize')
const Sequelize = require('sequelize')

const sequelize = require('../util/database')

// 1st - 'user' - имя модели
// 2st - Описание структуры таблицы - полей и пр.
const User = sequelize.define('user', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    // id будет являться первичным ключом, по которому будут выстраиваться связи между таблицами
    primaryKey: true,
  },
  name: Sequelize.STRING,
  email: Sequelize.STRING,
})

module.exports = User
*/
