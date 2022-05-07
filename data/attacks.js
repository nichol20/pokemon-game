let attacks = {}

const getMovesUrl = id => `https://pokeapi.co/api/v2/move/${id}`

const generateMoves = async () => {
  const movesData = await generatePromises(826, getMovesUrl)
  movesData.forEach(({ name, power, type }) => {
    attacks = {
      ...attacks,
      [name]: {
        name,
        damage: power,
        type: type.name
      }
    }
  })
} 
