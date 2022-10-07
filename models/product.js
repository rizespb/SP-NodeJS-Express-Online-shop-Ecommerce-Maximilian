const fs = require('fs')
const path = require('path')

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
  constructor(title, imageUrl, description, price) {
    this.title = title
    this.imageUrl = imageUrl
    this.description = description
    this.price = price
  }

  save() {
    // getProductsFromFile принимает коллбэк
    getProductsFromFile((products) => {
      products.push(this)

      fs.writeFile(p, JSON.stringify(products), (err) => {
        console.log(err)
      })
    })
  }

  static fetchAll(callback) {
    getProductsFromFile(callback)
  }
}
