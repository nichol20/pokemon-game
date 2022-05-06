let pokemons = {}

const getPokemonUrl = id => `https://pokeapi.co/api/v2/pokemon/${id}`

const pokemonPromises = async () => await Promise.all(Array(500).fill().map(async (_, index) => 
  await fetch(getPokemonUrl(index + 1)).then(response => response.json())))

const generatePokemons = async () => {
  const pokemonsData = await pokemonPromises()
  
  const allPokemons = pokemonsData.reduce((accumulator, { name, moves, sprites, types }) => {
    const moveNames = moves.splice(0,4).map(move => move.move.name)
    const elementTypes = types.map(typeInfo => typeInfo.type.name)
    accumulator = {
      ...accumulator,
      [name]: {
        image: {
          src: sprites,
        },
        frames: {
          max: 1,
          hold: 30
        },
        animate: false,
        name,
        attacks: moveNames.map(move => attacks[move]),
        types: elementTypes
      }
    } 
    return accumulator
  }, {})

  pokemons = { ...allPokemons }
}

