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

function rectangularCollision({ rectangle1, rectangle2 }) {
  return(
    rectangle1.position.x + rectangle1.width >= rectangle2.position.x
    && rectangle1.position.x <= rectangle2.position.x + rectangle2.width
    && rectangle1.position.y <= rectangle2.position.y + rectangle2.height
    && rectangle1.position.y + rectangle1.height >= rectangle2.position.y
  )
}

const battle = {
  initiated: false
}

function animate() {
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

  // Active a battle
  if(keys.w.pressed || keys.a.pressed || keys.s.pressed || keys.d.pressed) {
    for(let i = 0; i < battleZones.length; i++) {
      const battleZone = battleZones[i]
      const overlappingArea = 
        (Math.min(
          player.position.x + player.width,
          battleZone.position.x + battleZone.width
        ) -
          Math.max(player.position.x, battleZone.position.x)) *
        (Math.min(
          player.position.y + player.height,
          battleZone.position.y + battleZone.height
        ) -
          Math.max(player.position.y, battleZone.position.y))
          
      if(rectangularCollision({
        rectangle1: player, 
        rectangle2: battleZone
      }) && overlappingArea > (player.width * player.height) / 2
      && Math.random() < .1
      ){
        // Deactivate current animation loop
        cancelAnimationFrame(animationId)
        
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
                initBattle()
                animateBatlle()
              }
            })
          }
        })

        break
      }
    }
  }

  if(keys.w.pressed && lastKey === 'w') {
    player.animate = true
    player.image = player.sprites.up

    // Detecting player collision in collision tiles
    for(let i = 0; i < boundaries.length; i++) {
      const boundary = boundaries[i]
      if(rectangularCollision({
        rectangle1: player, 
        rectangle2: {...boundary, position: {
          x: boundary.position.x,
          y: boundary.position.y + 3
        }} 
      })){
        moving = false
        break
      }
    }

    if(moving) movables.forEach(movable => movable.position.y += 3)
  }
  else if(keys.a.pressed && lastKey === 'a') {
    player.animate = true
    player.image = player.sprites.left

    // Detecting player collision in collision tiles
    for(let i = 0; i < boundaries.length; i++) {
      const boundary = boundaries[i]
      if(rectangularCollision({
        rectangle1: player, 
        rectangle2: {...boundary, position: {
          x: boundary.position.x + 3,
          y: boundary.position.y
        }} 
      })){
        moving = false
        break
      }
    }
    if(moving) movables.forEach(movable => movable.position.x += 3)
  }
  else if(keys.s.pressed && lastKey === 's') {
    player.animate = true
    player.image = player.sprites.down

    // Detecting player collision in collision tiles
    for(let i = 0; i < boundaries.length; i++) {
      const boundary = boundaries[i]
      if(rectangularCollision({
        rectangle1: player, 
        rectangle2: {...boundary, position: {
          x: boundary.position.x,
          y: boundary.position.y - 3
        }} 
      })){
        moving = false
        break
      }
    }
    if(moving) movables.forEach(movable => movable.position.y -= 3)
  }
  else if(keys.d.pressed && lastKey === 'd') {
    player.animate = true
    player.image = player.sprites.right

    // Detecting player collision in collision tiles
    for(let i = 0; i < boundaries.length; i++) {
      const boundary = boundaries[i]
      if(rectangularCollision({
        rectangle1: player, 
        rectangle2: {...boundary, position: {
          x: boundary.position.x - 3,
          y: boundary.position.y
        }} 
      })){
        moving = false
        break
      }
    }
    if(moving) movables.forEach(movable => movable.position.x -= 3)
  }
}

animate()

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

let musicStarted = false
addEventListener('click', () => {
  if(!musicStarted) {
    audios.map.play()
    musicStarted = true
  }
})