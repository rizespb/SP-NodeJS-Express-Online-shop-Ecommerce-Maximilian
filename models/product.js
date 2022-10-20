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
  // Устанавливаем связи
  userId: {
    type: Schema.Types.ObjectId,
    // Указываем, с какой моделью связана модель Product
    ref: 'User',
    required: true,
  },
})

// 1st - Model name
// 2nd Schema
module.exports = mongoose.model('Product', productSchema)
