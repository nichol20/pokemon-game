const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')

canvas.width = 1024
canvas.height = 576

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
const battleButtonElement = document.querySelector('#battle-button')
const pokemonImageElement = document.querySelector('#pokemon-image-that-appeared')
const wildPokemonWarningElement = document.querySelector('#wild-pokemon-warning')
const inventoryIconElement = document.querySelector("#inventory-icon")
const pokemonsInventoryElement = document.querySelector('#pokemons-inventory')
const inventoryContainerElement = document.querySelector('#inventory-container')

let battleButtonEventToStartBattle, battleButtonEventToCancelAnimation

battleButtonElement.addEventListener('click', battleButtonEventToStartBattle)
battleButtonElement.addEventListener('click', battleButtonEventToCancelAnimation)

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
        
        battleButtonElement.removeEventListener('click', battleButtonEventToStartBattle)
        battleButtonEventToStartBattle = () => {
          showWildPokemonContainerElement.style.display = 'none'
          takePlayerIntoBattle(wildPokemon)
        }
        battleButtonElement.addEventListener('click', battleButtonEventToStartBattle)

        // Showing the player the wild pokemon that appeared
        showWildPokemonContainerElement.style.display = 'flex'
        pokemonImageElement.src = wildPokemon.image.src.front_default
        wildPokemonWarningElement.innerHTML = `A wild ${wildPokemon.name} appeared!`
        
        break
      } 
    }

    if(!playerInBattleZone) showWildPokemonContainerElement.style.display = 'none'
  }

  battleButtonElement.removeEventListener('click', battleButtonEventToCancelAnimation)
  battleButtonEventToCancelAnimation = () => {
    // Deactivate current animation loop
    cancelAnimationFrame(animationId)
    console.log('battle-button')
  }
  battleButtonElement.addEventListener('click', battleButtonEventToCancelAnimation)

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
          // active a new animation loop
          initBattle({
            playerSelectedPokemon: playerPokemons[0], 
            enemySelectedPokemon: wildPokemon.name// Random pokemon
          })
          animateBatlle()
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
      pokeball: 10
    }
    localStorage.setItem('bag', JSON.stringify(playerItems))
  }

  if(!playerPokemons) {
    playerPokemons = ['pikachu']
    localStorage.setItem('pokemons', JSON.stringify(playerPokemons))
  }
}

const generatePokemonInventoryHTML = () => playerPokemons.reduce((accumulator, pokemonName) => {
  const currentPokemon = pokemons[pokemonName]
  accumulator += `
    <li class="pokemon-card-item">
      <img src="${currentPokemon.image.src.front_default}" class="pokemon-card-image" />
      <h3 class="pokemon-card-name">${currentPokemon.name}</h3>
      <span class="pokemon-card-subtitle">${currentPokemon.types.join(' | ')}</span>
    </li>
  `
  return accumulator
}, '')

const initGame = async () => {
  await generateMoves()
  await generatePokemons()
  getPlayerItems()
  animate()
  inventoryIconElement.style.display = 'block'
  inventoryIconElement.addEventListener('click', () => {
    pokemonsInventoryElement.innerHTML = generatePokemonInventoryHTML()
    inventoryContainerElement.style.display = 'flex'
  })
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
