class Sprite {
  constructor({
     position, 
     image, 
     frames={ max: 1, hold: 10 }, 
     sprites, 
     animate = false,  
     rotation = 0,
     isEnemy = false,
     width,
     height,
    }) {
    this.position = position
    this.image = new Image()
    this.frames = { ...frames, val: 0, elapsed: 0 }
    this.image.onload = () => {
      this.width = this.image.width / this.frames.max
      this.height = this.image.height

      this.imageWidth = width ?? this.width
      this.imageHeight = height ?? this.height
    }
    this.isEnemy = isEnemy

    if(isEnemy) this.image.src = image.src.front_default
    else this.image.src = image.src.back_default ?? image.src

    this.animate = animate
    this.sprites = sprites
    this.opacity = 1
    this.rotation = rotation
    
  }

  draw() {
    c.save()
    c.translate(this.position.x + this.width / 2, this.position.y + this.height / 2)
    c.rotate(this.rotation)
    c.translate(-this.position.x - this.width / 2, -this.position.y - this.height / 2)
    c.globalAlpha = this.opacity
    c.drawImage(
      this.image,
      this.width * this.frames.val,
      0,
      this.width,
      this.height, 
      this.position.x,
      this.position.y,
      this.imageWidth,
      this.imageHeight, 
    )
    c.restore()

    if(!this.animate) return this.frames.val = 0

    if(this.frames.max > 1) {
      this.frames.elapsed++
    }

    if(this.frames.elapsed % this.frames.hold === 0) {
      if(this.frames.val < this.frames.max - 1) this.frames.val++
      else this.frames.val = 0
    }
  }

}

class Monster extends Sprite {
  constructor({
    name,
    isEnemy,
    position, 
    image, 
    frames={ max: 1, hold: 10 }, 
    sprites, 
    animate = false,  
    rotation = 0, 
    attacks,
    width,
    height,
  }){
    super({
      position,
      image,
      frames,
      sprites,
      animate, 
      rotation,
      isEnemy,
      width,
      height,
    })
    this.name = name
    this.health = 100
    this.attacks = attacks
  }

  faint() {
    document.querySelector('#dialogue-box').innerHTML = `${this.name} fainted!`
    gsap.to(this.position, {
      y: this.position.y + 20
    })

    gsap.to(this, {
      opacity: 0
    })
  }

  attack({ attack, recipient, renderedSprites }) {
    document.querySelector('#dialogue-box').style.display = 'block'
    document.querySelector('#dialogue-box').innerHTML =
     `▼ ${this.name} used ${attack.name} and did ${attack.damage ?? 0} HP damage`

    let healthBar = '#enemy-health-bar'
    if(this.isEnemy) healthBar = '#player-health-bar'

    let rotation = 1
    if(this.isEnemy) rotation = -2.2

    recipient.health -= attack.damage
    
    const tl = gsap.timeline()
    
    let movementDistance = 20
    if(this.isEnemy) movementDistance = -20

    tl.to(this.position, {
      x: this.position.x - movementDistance
    }).to(this.position, {
      x: this.position.x + movementDistance * 2,
      duration: .1,
      onComplete: () => {
        // Enemy gets hit
        audios.tackleHit.play()
        gsap.to(healthBar, {
          width: recipient.health + '%'
        })

        gsap.to(recipient.position, {
          x: recipient.position.x + 10,
          yoyo: true,
          repeat: 5,
          duration: .08
        })

        gsap.to(recipient, {
          opacity: 0,
          yoyo: true,
          repeat: 5,
          duration: .08
        })
      }
    }).to(this.position, {
      x: this.position.x
    })
  }
}

class Boundary {
  static width = 48
  static height = 48
  constructor({ position }) {
    this.position = position
    this.width = 48
    this.height = 48
  }

  draw() {
    c.fillStyle = 'rgba(255, 0, 0, 0)'
    c.fillRect(this.position.x, this.position.y, this.width, this.height)
  }
}