const battleBackgroundImage = new Image()
battleBackgroundImage.src = './assets/battleBackground.png'
const battleBackground = new Sprite({
  position: {
    x: 0,
    y: 0
  },
  image: battleBackgroundImage,
})

let enemyPokemon 
let playerPokemon
let renderedSprites
let battleAnimationId
let queue
let pokemon

const initBattle = ({ playerSelectedPokemon, enemySelectedPokemon }) => {
  document.querySelector('#battle-interface').style.display = 'block'
  document.querySelector('#dialogue-box').style.display = 'none'
  document.querySelector('#player-health-bar').style.width = '100%'
  document.querySelector('#enemy-health-bar').style.width = '100%'
  document.querySelector('#enemy-health-bar').style.backgroundColor = '#00ff00'
  document.querySelector('#player-health-bar').style.backgroundColor = '#00ff00'
  document.querySelector('#attacks-box').replaceChildren()

  enemyPokemon = new Monster({
    ...pokemons[enemySelectedPokemon],
    position: {
      x: 460,
      y: 40
    },
    frames: {
      max: 1,
      hold: 30
    },
    animate: false,
    width: 192,
    height: 192,
    isEnemy: true
  })
  playerPokemon = new Monster({
    ...pokemons[playerSelectedPokemon],
    position: {
      x: 500,
      y: 240
    },
    frames: {
      max: 1,
      hold: 30
    },
    animate: false,
    width: 192,
    height: 192,
  })

  
  renderedSprites = [ enemyPokemon, playerPokemon ]
  queue = []

  // Entry animation
  gsap.to(playerPokemon.position, {
    x: playerPokemon.position.x - 300,
    duration: .4
  })
  gsap.to(enemyPokemon.position, {
    x: enemyPokemon.position.x + 300,
    duration: .4
  })
  
  // player hp text
  document.querySelector('#player-hp-text').innerHTML = `${playerPokemon.stats.hp}/${playerPokemon.stats.hp}`
  // Inserting pokemon names into HTML document
  document.querySelector('#enemy-name').innerHTML =
   enemySelectedPokemon[0].toUpperCase() + enemySelectedPokemon.slice(1) // Capitalizing first letter
  document.querySelector('#player-name').innerHTML =
   playerSelectedPokemon[0].toUpperCase() + playerSelectedPokemon.slice(1) // Capitalizing first letter

  // Inserting attack names into buttons
  playerPokemon.attacks.forEach(attack => {
    const button = document.createElement('button')
    button.classList.add('attack-buttons')
    button.innerHTML = attack.name
    document.querySelector('#attacks-box').append(button)
  })
  
  // Attack buttons
  document.querySelectorAll('.attack-buttons').forEach(button => {
    button.addEventListener('click', e => {
      const selectedAttack = attacks[e.currentTarget.innerHTML]
      playerPokemon.attack({
        attack: selectedAttack,
        recipient: enemyPokemon,
        renderedSprites
      })

      if(enemyPokemon.health <= 0) {
        queue.push(() => enemyPokemon.faint())
        queue.push(() => endBattleAnimation())
      }

      // Enemy attacks
      const randomAttack = enemyPokemon.attacks[Math.floor(Math.random() * enemyPokemon.attacks.length)]

      queue.push(() => {
        enemyPokemon.attack({
          attack: randomAttack,
          recipient: playerPokemon,
          renderedSprites
        })
        if(playerPokemon.health <= 0) {
          queue.push(() => playerPokemon.faint())
          queue.push(() => endBattleAnimation())
        }
      })

    })

    button.addEventListener('mouseenter', e => {
      const selectedAttack = attacks[e.currentTarget.innerHTML]
      document.querySelector('#attack-type').innerHTML = selectedAttack.type
    })

    button.addEventListener('mouseout', () => {
      document.querySelector('#attack-type').innerHTML = 'Attack Type'
    })
  })
}

const animateBatlle = () => {
  GAMESTATE = BATTLING
  battleAnimationId = requestAnimationFrame(animateBatlle)
  battleBackground.draw()
  renderedSprites.forEach(sprite => {
    sprite.draw()
  })
}

const endBattleAnimation = () => { 
  audios.battle.stop()
  audios.endOfBattle.play()
  // Fade back to black
  gsap.to('#overlapping-div',{
    opacity: 1,
    onComplete: () => {
      cancelAnimationFrame(battleAnimationId)
      
      animate()
      audios.map.play()

      document.querySelector('#battle-interface').style.display = 'none'
      gsap.to('#overlapping-div', {
        opacity: 0
      })
      battle.initiated = false
    }
  })
}

document.querySelector('#dialogue-box').addEventListener('click', e => {
  if(queue.length > 0) {
    queue[0]()
    queue.shift()
  } else e.currentTarget.style.display = 'none'
})