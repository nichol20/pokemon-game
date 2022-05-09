const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')

canvas.width = 1024
canvas.height = 576

let GAMESTATE
const TRAVELLING = 'TRAVELLING'
const BATTLING = 'BATTLING'

const collisionsMap = []
for(let i = 0; i < collisions.length; i += 240) {
  collisionsMap.push(collisions.slice(i, 240 + i))
}

const battleZonesMap = []
for(let i = 0; i < battleZonesData.length; i += 240) {
  battleZonesMap.push(battleZonesData.slice(i, 240 + i))
}

const boundaries = []
const offset = {
  x: 50,
  y: -280
}

// Creating tiles for collision
collisionsMap.forEach((row, i) => {
  row.forEach((symbol, j) => {
    if(symbol === 1025){
      boundaries.push(new Boundary({
        position: {
          x: j * Boundary.width + offset.x,
          y: i * Boundary.height + offset.y
        }
      }))
    }
  })
})

// Creating tiles for battle zones
const battleZones = []
battleZonesMap.forEach((row, i) => {
  row.forEach((symbol, j) => {
    if(symbol === 1025){
      battleZones.push(new Boundary({
        position: {
          x: j * Boundary.width + offset.x,
          y: i * Boundary.height + offset.y
        }
      }))
    }
  })
})

c.fillStyle = '#fff'
c.fillRect(0, 0, canvas.width, canvas.height)

const backgroundImage = new Image()
backgroundImage.src = './assets/pokemonMap.png'

const foregroundImage = new Image()
foregroundImage.src = './assets/foregroundObjects.png'

const playerDownImage = new Image()
playerDownImage.src = './assets/playerDown.png'

const playerUpImage = new Image()
playerUpImage.src = './assets/playerUp.png'

const playerLeftImage = new Image()
playerLeftImage.src = './assets/playerLeft.png'

const playerRightImage = new Image()
playerRightImage.src = './assets/playerRight.png'

const player = new Sprite({
  position: {
    x: canvas.width / 2 - 192 / 2, 
    y: canvas.height / 2 - 68 / 2,
  },
  image: playerDownImage,
  frames: {
    max: 4,
    hold: 10
  },
  sprites: {
    up: playerUpImage,
    left: playerLeftImage,
    right: playerRightImage,
    down: playerDownImage,
  }
})
let playerItems, playerPokemons

const background = new Sprite({
  position: {
    x: offset.x,
    y: offset.y
  },
  image: backgroundImage
})

const foreground = new Sprite({
  position: {
    x: offset.x,
    y: offset.y
  },
  image: foregroundImage
})

const keys = {
  w: {
    pressed: false
  },
  a: {
    pressed: false
  },
  s: {
    pressed: false
  },
  d: {
    pressed: false
  },
}
const movables = [ background, ...boundaries, foreground, ...battleZones ]

const battle = {
  initiated: false
}

// Getting HTML Elements
const showWildPokemonContainerElement = document.querySelector('#show-wild-pokemon-container')
const battleButtonElement             = document.querySelector('#battle-button')
const pokemonImageElement             = document.querySelector('#pokemon-image-that-appeared')
const wildPokemonWarningElement       = document.querySelector('#wild-pokemon-warning')
const inventoryIconElement            = document.querySelector("#inventory-icon")
const pokemonsInventoryElement        = document.querySelector('#pokemons-inventory')
const inventoryContainerElement       = document.querySelector('#inventory-container')
const itemsInventoryElement           = document.querySelector('#items-inventory')
const closeInventoryIconElement       = document.querySelector('.close-inventory-icon')
const pokemonTabElement               = document.querySelector('#pokemons-tab')
const itemsTabElement                 = document.querySelector('#items-tab')
const pokemonDescriptionTabElement    = document.querySelector('#pokemon-description-tab')
const itemDescriptionTabElement       = document.querySelector('#item-description-tab')
const choosePokemonContainerElement   = document.querySelector('#choose-pokemon-container')
const choosePokemonListElement        = document.querySelector('#choose-pokemon-list')
const CancelBattleButonElement        = document.querySelector('#choose-pokemon-cancel-battle-button')
const choosePokemonBattleButtonElement= document.querySelector('#choose-pokemon-battle-button')

inventoryIconElement.addEventListener('click', () => {
  pokemonsInventoryElement.innerHTML = generatePokemonInventoryHTML()
  itemsInventoryElement.innerHTML = generateItemInventoryHTML()

  // Handling pokemon inventory
  const pokemonCards = document.querySelectorAll('.pokemon-card-item')
  pokemonCards.forEach(card => {
    card.addEventListener('click', e => {
      showPokemonInformationInInventory(e.target.dataset.pokemon)
      pokemonCards.forEach(c => c.classList.remove('active'))
      e.target.classList.add('active')
    })
  })

  // Handling item inventory
  const itemCards = document.querySelectorAll('.item-card-item')
  itemCards.forEach(card => {
    card.addEventListener('click', e => {
      showItemInformationInInventory(e.target.dataset.item)
      itemCards.forEach(c => c.classList.remove('active'))
      e.target.classList.add('active')
    })
  })
  
  inventoryContainerElement.style.display = 'flex'
})

closeInventoryIconElement.addEventListener('click', () => {
  // close inventory
  inventoryContainerElement.style.display = 'none'

  // reset pokemon tab
  pokemonDescriptionTabElement.style.width = '0px'
  pokemonDescriptionTabElement.style.innerHTML = ''
  pokemonDescriptionTabElement.style.display = 'none'
  
  // reset item tab
  itemDescriptionTabElement.style.width     = '0px'
  itemDescriptionTabElement.style.innerHTML = ''
  itemDescriptionTabElement.style.display   = 'none'
})

pokemonTabElement.addEventListener('click', () => {
  pokemonsInventoryElement.style.display    = 'grid'
  pokemonTabElement.style.borderBottom      = '1px solid #fff'

  // closing item inventory
  itemsInventoryElement.style.display       = 'none'
  itemsTabElement.style.borderBottom        = 'none'
  itemDescriptionTabElement.style.width     = '0px'
  itemDescriptionTabElement.style.innerHTML = ''
  itemDescriptionTabElement.style.display   = 'none'
  document.querySelectorAll('.item-card-item').forEach(c => c.classList.remove('active'))
})

itemsTabElement.addEventListener('click', () => {
  itemsInventoryElement.style.display = 'grid'
  itemsTabElement.style.borderBottom = '1px solid #fff'
  
  // closing pokemon inventory
  pokemonsInventoryElement.style.display = 'none'
  pokemonTabElement.style.borderBottom = 'none'
  pokemonDescriptionTabElement.style.width = '0px'
  pokemonDescriptionTabElement.style.innerHTML = ''
  pokemonDescriptionTabElement.style.display = 'none'
  document.querySelectorAll('.pokemon-card-item').forEach(c => c.classList.remove('active'))
})

CancelBattleButonElement.addEventListener('click', () => {
  audios.map.play()
  audios.battle.stop()
  battle.initiated = false

  animate()
  choosePokemonContainerElement.style.display = 'none'
})

const rectangularCollision = ({ rectangle1, rectangle2 }) => {
  return(
    rectangle1.position.x + rectangle1.width >= rectangle2.position.x
    && rectangle1.position.x <= rectangle2.position.x + rectangle2.width
    && rectangle1.position.y <= rectangle2.position.y + rectangle2.height
    && rectangle1.position.y + rectangle1.height >= rectangle2.position.y
  )
}

const detectPlayerCollisionInBoundaries = (nextX, nextY) => {
  let moving = true
  // Detecting player collision in collision tiles
  for(let i = 0; i < boundaries.length; i++) {
    const boundary = boundaries[i]
    if(rectangularCollision({
      rectangle1: player, 
      rectangle2: {...boundary, position: {
        x: boundary.position.x + nextX,
        y: boundary.position.y + nextY
      }} 
    })){
      moving = false
    }
  }
  return moving
}

const animate = () => {
  GAMESTATE = TRAVELLING
  c.fillStyle = '#B2FBFF'
  c.fillRect(0, 0, canvas.width, canvas.height)

  const animationId = requestAnimationFrame(animate)

  background.draw()

  boundaries.forEach(boundary => {
    boundary.draw()
  })

  battleZones.forEach(battleZone => {
    battleZone.draw()
  })

  player.draw()
  foreground.draw()

  let moving = true
  player.animate = false

  if(battle.initiated) return

  if(keys.w.pressed || keys.a.pressed || keys.s.pressed || keys.d.pressed) {
    let playerInBattleZone = false
    for(let i = 0; i < battleZones.length; i++) {
      const battleZone = battleZones[i]
      const overlappingArea = 
        (
          Math.min(player.position.x + player.width, battleZone.position.x + battleZone.width)
           -
          Math.max(player.position.x, battleZone.position.x)
        )
         *
        (
          Math.min(player.position.y + player.height, battleZone.position.y + battleZone.height)
           -
          Math.max(player.position.y, battleZone.position.y)
        )

      if(rectangularCollision({ rectangle1: player, rectangle2: battleZone})) playerInBattleZone = true
          
      if(
        rectangularCollision({ rectangle1: player, rectangle2: battleZone})
        && overlappingArea > (player.width * player.height) / 2
        && Math.random() < .05
      ){
        // Random pokemon
        const pokemonKeys = Object.keys(pokemons)
        const wildPokemon = pokemons[pokemonKeys[Math.floor(Math.random() * pokemonKeys.length)]]
        
        handlingEventListenerOverload('click', battleButtonElement, () => {
          showWildPokemonContainerElement.style.display = 'none'
          takePlayerIntoBattle(wildPokemon)
        }, 'battleButtonElement1')

        // Showing the player the wild pokemon that appeared
        showWildPokemonContainerElement.style.display = 'flex'
        pokemonImageElement.src = wildPokemon.image.src.front_default
        wildPokemonWarningElement.innerHTML = `A wild ${wildPokemon.name} appeared!`
        
        break
      } 
    }

    if(!playerInBattleZone) showWildPokemonContainerElement.style.display = 'none'
  }

  handlingEventListenerOverload('click', battleButtonElement, () => {
    // Deactivate current animation loop
    cancelAnimationFrame(animationId)
    console.log('battle-button')
  }, 'battleButtonElement2')

  if(keys.w.pressed && lastKey === 'w') {
    player.animate = true
    player.image = player.sprites.up
    moving = detectPlayerCollisionInBoundaries(0, 3)
    if(moving) movables.forEach(movable => movable.position.y += 3)
  }
  else if(keys.a.pressed && lastKey === 'a') {
    player.animate = true
    player.image = player.sprites.left
    moving = detectPlayerCollisionInBoundaries(3, 0)
    if(moving) movables.forEach(movable => movable.position.x += 3)
  }
  else if(keys.s.pressed && lastKey === 's') {
    player.animate = true
    player.image = player.sprites.down
    moving = detectPlayerCollisionInBoundaries(0, -3)
    if(moving) movables.forEach(movable => movable.position.y -= 3)
  }
  else if(keys.d.pressed && lastKey === 'd') {
    player.animate = true
    player.image = player.sprites.right
    moving = detectPlayerCollisionInBoundaries(-3, 0)
    if(moving) movables.forEach(movable => movable.position.x -= 3)
  }
}

const takePlayerIntoBattle = (wildPokemon) => {
  audios.map.stop()
  audios.initBattle.play()
  audios.battle.play()

  battle.initiated = true
  // Animation using gsap library
  gsap.to('#overlapping-div', {
    opacity: 1,
    repeat: 4,
    yoyo: true,
    duration: .4,
    onComplete() {
      gsap.to('#overlapping-div', {
        opacity: 0,
        duration: .4,
        onComplete() {
          choosePokemonContainerElement.style.display = 'flex'
          choosePokemonListElement.innerHTML = generateChoosePokemonListHTML()
          let selectedPokemon

          // Handling the chosen pokemon
          const pokemonCards = document.querySelectorAll('.choose-pokemon-card-item')
          pokemonCards.forEach(card => {
            card.addEventListener('click', e => {
              pokemonCards.forEach(c => c.classList.remove('active'))
              e.target.classList.add('active')
              selectedPokemon = e.target.dataset.pokemon
            })
          })

          // Starting battle
          handlingEventListenerOverload('click', choosePokemonBattleButtonElement, () => {
            initBattle({
              playerSelectedPokemon: selectedPokemon ?? playerPokemons[0], 
              enemySelectedPokemon: wildPokemon.name // Random pokemon
            })
            // active a new animation loop
            animateBatlle()
            choosePokemonContainerElement.style.display = 'none'
          }) 
        }
      })
    }
  })
}

const getPlayerItems = () => {
  playerItems = JSON.parse(localStorage.getItem('bag'))
  playerPokemons = JSON.parse(localStorage.getItem('pokemons'))

  if(!playerItems) {
    playerItems = {
      "poke-ball": {
        held: 10
      },
      "great-ball": {
        held: 5
      },
      "safari-ball": {
        held: 2
      },
      "master-ball": {
        held: 1
      }
    }
    localStorage.setItem('bag', JSON.stringify(playerItems))
  }

  if(!playerPokemons) {
    playerPokemons = ['pikachu']
    localStorage.setItem('pokemons', JSON.stringify(playerPokemons))
  }
}

const showPokemonInformationInInventory = pokemonName => {
  pokemonDescriptionTabElement.style.display = 'flex'
  pokemonDescriptionTabElement.style.width = '220px'

  const pokemon = pokemons[pokemonName]
  const attacksTable = pokemon.attacks.reduce((accumulator, attack) => {
    accumulator += `
      <tr>
        <td>${attack.name}</td>
        <td>${attack.type}</td>
      </tr>
    `
    return accumulator
  }, '')
  pokemonDescriptionTabElement.innerHTML = `
    <img src="${pokemon.image.src.front_default}" id="pokemon-description-tab-pokemon-image">
    <h3 id="pokemon-description-tab-pokemon-name">${pokemon.name}</h3>
    <div id="pokemon-description-tab-stats-container">
      <h4>Stats</h4>
      <table>
        <tr>
          <td>hp</td>
          <td>${pokemon.stats.hp}</td>
        </tr>
        <tr>
          <td>attack</td>
          <td>${pokemon.stats.attack}</td>
        </tr>
        <tr>
          <td>defense</td>
          <td>${pokemon.stats.defense}</td>
        </tr>
      </table>
    </div>
    <div id="pokemon-description-tab-attacks-container">
      <h4>Attacks</h4>
      <table>
        ${attacksTable}
      </table>
    </div>
  `
}

const showItemInformationInInventory = itemName => {
  itemDescriptionTabElement.style.display = 'flex'
  itemDescriptionTabElement.style.width = '220px'

  itemDescriptionTabElement.innerHTML = `
    <img src="${items[itemName].sprites.default}" id="item-description-tab-item-image">
    <h3 id="item-description-tab-item-name">${itemName}</h3>
    <span id="item-description-tab-item-description">${items[itemName].short_effect}</span>
    ${
      items[itemName].characteristics.includes('consumable') 
      && GAMESTATE === BATTLING
      ? `<button id="item-description-tab-consume-button">Use</button>`
      : ''
    }
  `

  const consumeButtonElement = document.querySelector('#item-description-tab-consume-button')
  
  if(consumeButtonElement) {
    handlingEventListenerOverload('click', consumeButtonElement, () => {
      inventoryContainerElement.style.display = 'none'
      playerItems[itemName].held -= 1
      playerPokemons.push(enemyPokemon.name)
      localStorage.setItem('pokemons', JSON.stringify(playerPokemons))
      localStorage.setItem('bag', JSON.stringify(playerItems))
      endBattleAnimation()
    })
  }
}

const generatePokemonInventoryHTML = () => playerPokemons.reduce((accumulator, pokemonName) => {
  const currentPokemon = pokemons[pokemonName]
  accumulator += `
    <li class="pokemon-card-item" data-pokemon="${pokemonName}">
      <img src="${currentPokemon.image.src.front_default}" class="pokemon-card-image" />
      <h3 class="pokemon-card-name">${currentPokemon.name}</h3>
      <span class="pokemon-card-subtitle">${currentPokemon.types.join(' | ')}</span>
    </li>
  `
  return accumulator
}, '')

const generateChoosePokemonListHTML = () => playerPokemons.reduce((accumulator, pokemonName) => {
  const currentPokemon = pokemons[pokemonName]
  accumulator += `
    <li class="choose-pokemon-card-item" data-pokemon="${pokemonName}">
      <img src="${currentPokemon.image.src.front_default}" class="pokemon-card-image" />
      <h3 class="pokemon-card-name">${currentPokemon.name}</h3>
      <span class="pokemon-card-subtitle">${currentPokemon.types.join(' | ')}</span>
    </li>
  `
  return accumulator
}, '')
 
const generateItemInventoryHTML = () => Object.keys(playerItems).reduce((accumulator, key) => {
  accumulator += `
    <li class="item-card-item" data-item="${key}">
      <img src="${items[key].sprites.default}" class="item-card-image">
      <span class="item-card-held">x${playerItems[key].held}</span>
    </li>
  `
  return accumulator
}, '')

const initGame = async () => {
  await generateMoves()
  await generatePokemons()
  await generatePokeballs()
  getPlayerItems()
  animate()
  
  inventoryIconElement.style.display = 'block'
  
  audios.map.play()

  // const pokemonKeys = Object.keys(pokemons)
  // initBattle({ 
  //   playerSelectedPokemon: 'pikachu', 
  //   enemySelectedPokemon: pokemonKeys[Math.floor(Math.random() * pokemonKeys.length)]
  // })
  // animateBatlle()
}

const menu = () => {
  document.querySelector('#start-game-button').addEventListener('click', async () => {
    document.querySelector('#menu-box').style.display = 'none'
    await initGame()
  })
}

menu()

let lastKey = ''
addEventListener('keydown', ({ key }) => {
  switch(key) {
    case 'w':
      keys.w.pressed = true
      lastKey = 'w'
      break
    case 'a':
      keys.a.pressed = true
      lastKey = 'a'
      break
    case 's':
      keys.s.pressed = true
      lastKey = 's'
      break
    case 'd':
      keys.d.pressed = true
      lastKey = 'd'
      break
    default:
      break
  }
})

addEventListener('keyup', ({ key }) => {
  switch(key) {
    case 'w':
      keys.w.pressed = false
      break
    case 'a':
      keys.a.pressed = false
      break
    case 's':
      keys.s.pressed = false
      break
    case 'd':
      keys.d.pressed = false
      break
    default:
      break
  }
})
