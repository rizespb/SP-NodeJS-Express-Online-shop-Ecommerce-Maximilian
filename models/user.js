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

module.exports = mongoose.model('User', userSchema)
