const mongoose = require('mongoose')

const Schema = mongoose.Schema

const userSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  cart: {
    items: [
      {
        // productId - id продукта, которое создается автоматически Mongo и обуспечит в дальнейшем связь между документами в коллекциях
        // ref - ссылка на модель, с которой устанвлена связь
        productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
        quantity: { type: Number, required: true },
      },
    ],
  },
})

// Добавление товара в корзину
userSchema.methods.addToCart = function (product) {
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
      productId: product._id,
      quantity: newQuantity,
    })
  }

  const updatedCart = {
    items: updatedCartItems,
  }

  this.cart = updatedCart

  return this.save()
}

// Удаление товара из корзины
userSchema.methods.removeFromCart = function (productId) {
  const updatedCartItems = this.cart.items.filter((item) => {
    // Чтобы убедиться, что оба id имееют один тип, приводим их к строке
    return item.productId.toString() !== productId.toString()
  })

  this.cart.items = updatedCartItems
  return this.save()
}

module.exports = mongoose.model('User', userSchema)
