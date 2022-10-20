const mongoose = require('mongoose')

const Schema = mongoose.Schema

const orderSchema = new Schema({
  products: {
    type: [
      {
        product: { type: Object, required: true },
        quantity: { type: Number, required: true },
      },
    ],
  },
  user: {
    name: {
      type: String,
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      // Устанавливаем связь с моделью User (с соответствующим user по _id)
      ref: 'User',
    },
  },
})

module.exports = mongoose.model('Order', orderSchema)
