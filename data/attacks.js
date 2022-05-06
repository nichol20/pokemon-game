let attacks = {}

const getMovesUrl = id => `https://pokeapi.co/api/v2/move/${id}`

const generateMovesPromises = async () => await Promise.all(Array(826).fill().map(async (_, index) => {
  const response = await fetch(getMovesUrl(index + 1))
  return response.json()
}))

const generateMoves = async () => {
  const movesData = await generateMovesPromises()
  const moves = movesData.reduce((accumulator, { name, power, type }) => {
    accumulator = {
      ...accumulator,
      [name]: {
        name,
        damage: power,
        type: type.name
      }
    }
    return accumulator
  }, {})
  attacks = { ...moves }
} 
