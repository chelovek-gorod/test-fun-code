import { AnimatedSprite } from "pixi.js"
import { sprites } from "./engine/loader"
import { tickerAdd, tickerRemove } from "./engine/application"

export default class Flower extends AnimatedSprite {
    constructor() {
        super(sprites.flower.animations.open)
        this.anchor.set(0.45, 0.8)
        this.scale.set(0)
        this.alpha = 1
        this.loop = false
        this.gotoAndStop(0)

        this.isGrow = true
        this.growSpeed = 0.001
        this.animationSpeed = 0.5

        setTimeout( () => tickerAdd(this), 1200)

        //tickerAdd(this)
    }

    tick(time) {
        if (this.isGrow) {
            this.scale.set(this.scale.x + this.growSpeed * time.deltaMS)
            console.log(this.scale.x)
            if (this.scale.x >= 1) {
                this.isGrow = false
                this.scale.set(1)
                tickerRemove(this)
                this.gotoAndPlay(0)
                this.onComplete = () => {
                    setTimeout( () => tickerAdd(this), 2400)
                }
            }
            
            return
        }

        this.alpha -= this.growSpeed * time.deltaMS
        
        if (this.alpha <= 0) {
            this.scale.set(0)
            this.alpha = 1
            this.isGrow = true

            this.gotoAndStop(0)

            setTimeout( () => tickerAdd(this), 1200)
            tickerRemove(this)
        }
    }
}