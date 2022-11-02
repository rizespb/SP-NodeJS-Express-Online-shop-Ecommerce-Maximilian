const deleteProduct = (btn) => {
  // Получаем id товара, который хранится в input с типом hidden
  const prodId = btn.parentNode.querySelector('[name=productId').value

  // Получаем nокен для защиты от CSRF-атак (межсайтовая подделка запроса)
  const csrf = btn.parentNode.querySelector('[name=_csrf').value

  // Карточка товара
  const productElement = btn.closest('article')

  fetch('/admin/product/' + prodId, {
    method: 'DELETE',
    // При работе с формой отправляли токен в body, Но у DELETE body нет
    // Либа csurf парсит и body, и заголовки
    headers: {
      'csrf-token': csrf,
    },
  })
    .then((result) => {
      console.log(result)
      return result.json()
    })
    .then((data) => {
      console.log(data)
      // productElement.parentNode.removeChild(productElement)
      // remove не работает в IE
      productElement.remove()
    })
    .catch((err) => {
      console.log('Error from script admin.js deleteProduct: ', err)
    })
}
