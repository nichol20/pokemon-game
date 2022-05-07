const generatePromises = async (amountOfUrl, url) => await Promise.all(Array(amountOfUrl).fill().map(async (_, index) => {
  const response = await fetch(url(index + 1))
  return response.json()
}))