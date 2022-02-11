import platform from './../assets/platform.png'
import platformSmallTall from './../assets/platformSmallTall.png'
import hills from './../assets/hills.png'
import background from './../assets/background.png'

import spriteRunLeft from './../assets/spriteRunLeft.png'
import spriteRunRight from './../assets/spriteRunRight.png'
import spriteStandLeft from './../assets/spriteStandLeft.png'
import spriteStandRight from './../assets/spriteStandRight.png'

// Prepare canvas
const canvas = document.querySelector('canvas')
const context = canvas.getContext('2d')

canvas.width = 1024 //window.innerWidth
canvas.height = 576 //window.innerHeight

const gravity = 0.5
const parallax = .55

// player class
class Player {

    constructor() {
        this.position = {
            x: 200,
            y: 100
        }
        this.width = 66
        this.height = 150
        this.velocity = {
            x: 0,
            y: 0
        }
        this.speed = 8

        this.image = createImage(spriteStandRight)
        this.frames = 0
        this.sprites = {
            stand: {
                right: createImage(spriteStandRight),
                left: createImage(spriteStandLeft),
                cropWidth: 177,
                width:66
            },
            run: {
                right: createImage(spriteRunRight),
                left: createImage(spriteRunLeft),
                cropWidth: 341,
                width: 127.875
            }
        }
        this.currentSprite = this.sprites.stand.right
        this.currentCropWidth = 177
    }

    draw() {
        context.drawImage(
            this.currentSprite, 
            this.currentCropWidth * this.frames,
            0,
            this.currentCropWidth,
            400,
            this.position.x, 
            this.position.y, 
            this.width, 
            this.height
        )
    }

    update() {
        this.frames++
        if(this.frames == 59 && (this.currentSprite == this.sprites.stand.right || this.currentSprite == this.sprites.stand.left)) {
            this.frames = 0
        } else if(this.frames > 29 && (this.currentSprite == this.sprites.run.right || this.currentSprite == this.sprites.run.left)) {
            this.frames = 0
        }

        this.draw()
        this.position.x += this.velocity.x
        this.position.y += this.velocity.y

        // Control the gravity
        if(this.position.y + this.height + this.velocity.y <= canvas.height) {
            this.velocity.y += gravity
        } /*else { // Stop at bottom of window
            this.velocity.y = 0
        }*/
    }
}

class Platform {

    constructor({x, y, image}) {
        this.position = {
            x,
            y
        }
        this.image = image
        this.width = image.width
        this.height = image.height
        
    }

    draw() {
        context.drawImage(this.image, this.position.x, this.position.y)
    }
}

class GenericObject {

    constructor({x, y, image}) {
        this.position = {
            x,
            y
        }
        this.image = image
        this.width = image.width
        this.height = image.height
        
    }

    draw() {
        context.drawImage(this.image, this.position.x, this.position.y)
    }
}

function createImage(imageSrc) {
    const image = new Image()
    image.src = imageSrc
    return image
}

// Create the character
let player = new Player()

// Create the platforms array
let platforms = []
// Platform image
let platformImage = createImage(platform)
// Platform taller image
let platformTall = createImage(platformSmallTall)
// Create background and hills array
let genericObjects = []

let lastKey

const keys = {
    left: {
        pressed: false
    },
    right: {
        pressed: false
    }
}

let scrollOffset = 0

// To reset the game
function init() {
    player = new Player()

    // Create background and hills
    genericObjects = [
        new GenericObject({x:-1, y:-1, image:createImage(background)}),
        new GenericObject({x:-1, y:-1, image:createImage(hills)})
    ]

    // Create the platforms
    platforms = [
        new Platform({x:0, y:canvas.height-platformImage.height, image:platformImage}),
        new Platform({x:platformImage.width-2, y:canvas.height-platformImage.height, image:platformImage}),
        new Platform({x:platformImage.width*2-4, y:canvas.height-platformImage.height, image:platformImage}),
        new Platform({x:platformImage.width*3+250, y:canvas.height-(platformTall.height+55), image:platformTall}),
        new Platform({x:platformImage.width*3+100, y:canvas.height-platformImage.height, image:platformImage}),
        new Platform({x:platformImage.width*4+98, y:canvas.height-platformImage.height, image:platformImage}),
        new Platform({x:platformImage.width*5+300, y:canvas.height-platformImage.height, image:platformImage}),
        new Platform({x:platformImage.width*7-100, y:canvas.height-platformTall.height, image:platformTall})
    ]

    scrollOffset = 0
}


function animate() {
    requestAnimationFrame(animate)
    context.fillRect(0, 0, canvas.width, canvas.height)
    context.fillStyle = 'white'
    
    // Background and hills
    genericObjects.forEach(genericObject => {
        genericObject.draw()
    })
    // Platforms
    platforms.forEach(platform => {
        platform.draw()
    })
    //platform.draw()

    player.update()

    if(keys.right.pressed && player.position.x <= 500) {
        player.velocity.x = player.speed
    } else if ((keys.left.pressed && player.position.x >= 200) || (keys.left.pressed && scrollOffset === 0 && player.position.x > 0)) {
        player.velocity.x = -player.speed
    } else {
        player.velocity.x = 0
        //Do horizontal scroll platform
        if(keys.right.pressed) {
            scrollOffset += player.speed
            platforms.forEach(platform => {
                platform.position.x -= player.speed
            })

            // Parallax effect hills
            genericObjects.forEach(genericObject => {
                genericObject.position.x -= player.speed * parallax
            })
        } else if(keys.left.pressed && scrollOffset > 0) { // Prevent the player fall the left side at walk to left on init
            scrollOffset -= player.speed
            platforms.forEach(platform => {
                platform.position.x += player.speed
            })

            // Parallax effect hills
            genericObjects.forEach(genericObject => {
                genericObject.position.x += player.speed * parallax
            })
        }
    }

    // Platform collision detection.
    platforms.forEach(platform => {
        if(player.position.y + player.height <= platform.position.y 
            && player.position.y + player.height + player.velocity.y >= platform.position.y 
            && player.position.x + player.width >= platform.position.x 
            && player.position.x <= platform.position.x + platform.width) {
            player.velocity.y = 0
        }
    })

    // Sprite switching
    if(keys.right.pressed && lastKey == 'right' && player.currentSprite !== player.sprites.run.right) {
        player.frames = 1
        player.currentSprite = player.sprites.run.right
        player.currentCropWidth = player.sprites.run.cropWidth
        player.width = player.sprites.run.width
    } else if(keys.left.pressed && lastKey == 'left' && player.currentSprite !== player.sprites.run.left) {
        player.currentSprite = player.sprites.run.left
        player.currentCropWidth = player.sprites.run.cropWidth
        player.width = player.sprites.run.width
    } else if(!keys.left.pressed && lastKey == 'left' && player.currentSprite !== player.sprites.stand.left) {
        player.currentSprite = player.sprites.stand.left
        player.currentCropWidth = player.sprites.stand.cropWidth
        player.width = player.sprites.stand.width
    } else if(!keys.right.pressed && lastKey == 'right' && player.currentSprite !== player.sprites.stand.right) {
        player.currentSprite = player.sprites.stand.right
        player.currentCropWidth = player.sprites.stand.cropWidth
        player.width = player.sprites.stand.width
    }

    // Win condition
    if(scrollOffset > 4000) {
        window.alert('YOU WIN')
    }
    // Lose condition
    if(player.position.y > canvas.height) {
        init()
    }
}

init()
animate()

window.addEventListener('keydown', ({ keyCode }) => {
    switch(keyCode) {
        case 37:
            console.log('left')
            keys.left.pressed = true
            lastKey = 'left'
            break
        case 38:
            console.log('up')
            player.velocity.y -= 13
            break
        case 39:
            console.log('right')
            keys.right.pressed = true
            lastKey = 'right'
            break
        case 40:
            console.log('down')
            break
    }
})

window.addEventListener('keyup', ({ keyCode }) => {
    switch(keyCode) {
        case 37:
            console.log('left')
            keys.left.pressed = false
            break
        case 38:
            console.log('up')
            break
        case 39:
            console.log('right')
            keys.right.pressed = false
            
            break
        case 40:
            console.log('down')
            break
    }
})