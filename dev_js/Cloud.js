import { Sprite } from "pixi.js"
import { CLOUDS } from "./constants"
import { tickerAdd } from "./engine/application"
import { sprites } from "./engine/loader"

export default class Cloud extends Sprite {
    constructor(textureIndex) {
        super(sprites.clouds.textures["cloud_" + textureIndex])
        this.anchor.set(0.5)

        this.scaleRateX = Math.random() < 0.5 ? -CLOUDS.scale : CLOUDS.scale
        this.scaleRateY = Math.random() < 0.5 ? -CLOUDS.scale : CLOUDS.scale

        this.speed = CLOUDS.minSpeed + Math.random() * (CLOUDS.maxSpeed - CLOUDS.minSpeed)
        this.speedX = this.speed * CLOUDS.speedRateX
        this.speedY = this.speed * CLOUDS.speedRateY

        this.isReady = false

        tickerAdd(this)
    }

    setSizes(width, height, scale) {
        if (!this.isReady) {
            this.position.set(Math.random() * width, Math.random() * height)
            this.isReady = true
        }

        this.scale.x = scale * this.scaleRateX
        this.scale.y = scale * this.scaleRateY
        
        this.minX = -this.width * 0.5
        this.minY = -this.height * 0.5

        this.maxX = width + this.width * 0.5
        this.maxY = height + this.height * 0.5
    }

    tick( time ) {
        this.position.x += this.speedX * time.deltaMS
        this.position.y += this.speedY * time.deltaMS

        if (this.position.x > this.maxX || this.position.Y < this.minY) {
            if (Math.random() < 0.5) {
                this.position.x = this.minX
                this.position.y = this.minY + Math.random() * this.maxY
            } else {
                this.position.x = this.minX + Math.random() * this.maxX
                this.position.y = this.maxY
            }
        }
    }
}