import { AnimatedSprite } from "pixi.js"
import { CLOUDS } from "./constants"
import { tickerAdd } from "./engine/application"
import { EventHub, events } from "./engine/events"
import { sprites } from "./engine/loader"

export default class Bird extends AnimatedSprite {
    constructor() {
        super(sprites.bird.animations.fly)
        this.anchor.set(0.5)

        this.minSpeed = 0.2
        this.maxSpeed = 0.4

        this.speed = this.minSpeed + Math.random() * (this.maxSpeed - this.minSpeed)
        this.speedX = this.speed * 0.5
        this.speedY = this.speed * 0.3

        this.isReady = false

        tickerAdd(this)
    }

    setSizes(width, height, scale) {
        if (!this.isReady) {
            this.position.set(Math.random() * width, Math.random() * height)
            this.isReady = true
            this.play()
        }

        this.minX = -this.width * 0.5
        this.minY = -this.height * 0.5

        this.maxX = width + this.width * 0.5
        this.maxY = height + this.height * 0.5

        this.scale.set(scale)
    }

    tick( time ) {
        this.position.x -= this.speedX * time.deltaMS
        this.position.y -= this.speedY * time.deltaMS

        if (this.position.x < this.minX || this.position.y < this.minY) {
            if (Math.random() < 0.5) {
                this.position.x = this.maxX
                this.position.y = this.minY + Math.random() * this.maxY
            } else {
                this.position.x = this.minX + Math.random() * this.maxX
                this.position.y = this.maxY
            }
        }
    }
}