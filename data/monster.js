let pokemons = {}

const getPokemonUrl = id => `https://pokeapi.co/api/v2/pokemon/${id}`

const generatePokemons = async () => {
  const pokemonsData = await generatePromises(500, getPokemonUrl)
  
  pokemonsData.forEach(({ name, moves, sprites, types, stats }) => {
    const moveNames = moves.splice(0,4).map(move => move.move.name)
    const elementTypes = types.map(typeInfo => typeInfo.type.name)
    pokemons = {
      ...pokemons,
      [name]: {
        image: {
          src: sprites,
        },
        name,
        attacks: moveNames.map(move => attacks[move]),
        types: elementTypes,
        stats: {
          hp: stats[0].base_stat,
          attack: stats[1].base_stat,
          defense: stats[2].base_stat,
        }
      }
    } 
  })

}

