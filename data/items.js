let items = {}

const getPocketItemsUrl = id => `https://pokeapi.co/api/v2/item-pocket/${id}`

// POKEBALLS
const generatePokeballs = async () => {
  const pocketItemsData = await generatePromises(8, getPocketItemsUrl)
  const { categories } = pocketItemsData.filter(pocketItem => pocketItem.name === "pokeballs")[0]

  // Standard-balls
  const standardBallsPromise = await fetch(categories.filter(category => category.name === 'standard-balls')[0].url)
  const standardBallsData = await standardBallsPromise.json()

  const allStandardBall = await Promise.all(standardBallsData.items.map(async ({ url }) => {
    const response = await fetch(url)
    return response.json()
  }))
  allStandardBall.forEach(({ name, sprites, cost, attributes, effect_entries }) => {
    const characteristics = attributes.map(attribute => attribute.name)
    const shortEffect = effect_entries[0].short_effect
    items = {
      ...items,
      [name]: {
        name,
        cost,
        sprites,
        characteristics,
        short_effect: shortEffect
      }
    }
  })

} 