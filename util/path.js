const path = require('path')

// Функция для получения корневой директории
module.exports = path.dirname(process.mainModule.filename)
