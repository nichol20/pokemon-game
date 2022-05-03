const battleBackgroundImage = new Image()
battleBackgroundImage.src = './assets/battleBackground.png'
const battleBackground = new Sprite({
  position: {
    x: 0,
    y: 0
  },
  image: battleBackgroundImage,
})

let draggle 
let emby
let renderedSprites
let battleAnimationId
let queue

function initBattle() {
  document.querySelector('#battle-interface').style.display = 'block'
  document.querySelector('#dialogue-box').style.display = 'none'
  document.querySelector('#player-health-bar').style.width = '100%'
  document.querySelector('#enemy-health-bar').style.width = '100%'
  document.querySelector('#attacks-box').replaceChildren()

  draggle = new Monster(monsters.Draggle)
  emby = new Monster(monsters.Emby)
  renderedSprites = [ draggle,emby ]
  queue = []

  emby.attacks.forEach(attack => {
    const button = document.createElement('button')
    button.innerHTML = attack.name
    document.querySelector('#attacks-box').append(button)
  })

  
// Attack buttons
document.querySelectorAll('button').forEach(button => {
  button.addEventListener('click', e => {
    const selectedAttack = attacks[e.currentTarget.innerHTML]
    emby.attack({
      attack: selectedAttack,
      recipient: draggle,
      renderedSprites
    })

    if(draggle.health <= 0) {
      queue.push(() => {
        draggle.faint()
      })
      queue.push(() => {
        // Fade back to black
        gsap.to('#overlapping-div',{
          opacity: 1,
          onComplete: () => {
            cancelAnimationFrame(battleAnimationId)
            animate()
            document.querySelector('#battle-interface').style.display = 'none'
            gsap.to('#overlapping-div', {
              opacity: 0
            })
            battle.initiated = false
            audios.map.play()
          }
        })
      })
    }

    // Enemy attacks
    const randomAttack = draggle.attacks[Math.floor(Math.random() * draggle.attacks.length)]

    queue.push(() => {
      draggle.attack({
        attack: randomAttack,
        recipient: emby,
        renderedSprites
      })
    })

    if(emby.health <= 0) {
      queue.push(() => {
        emby.faint()
      })
      queue.push(() => {
        // Fade back to black
        gsap.to('#overlapping-div',{
          opacity: 1,
          onComplete: () => {
            cancelAnimationFrame(battleAnimationId)
            animate()
            document.querySelector('#battle-interface').style.display = 'none'
            gsap.to('#overlapping-div', {
              opacity: 0
            })
            battle.initiated = false
            audios.map.play()
          }
        })
      })
    }
  })

  button.addEventListener('mouseenter', e => {
    const selectedAttack = attacks[e.currentTarget.innerHTML]
    document.querySelector('#attack-type').innerHTML = selectedAttack.type
  })
})
}

function animateBatlle() {
  battleAnimationId = requestAnimationFrame(animateBatlle)
  battleBackground.draw()
  renderedSprites.forEach(sprite => {
    sprite.draw()
  })
}

// animate()
// initBattle()
// animateBatlle()

document.querySelector('#dialogue-box').addEventListener('click', e => {
  if(queue.length > 0) {
    queue[0]()
    queue.shift()
  } else e.currentTarget.style.display = 'none'
})