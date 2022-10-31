const fs = require('fs')

// Функция для удаления файла по переданному пути
// Если не удастся удалить, то прокинем ошибку
const deleteFile = (filePath) => {
  fs.unlink(filePath, (err) => {
    if (err) {
      throw err
    }
  })
}

exports.deleteFile = deleteFile
