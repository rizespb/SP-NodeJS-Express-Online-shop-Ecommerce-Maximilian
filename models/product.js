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
