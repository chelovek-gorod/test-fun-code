import { AnimatedSprite } from "pixi.js"
import { sprites } from "./engine/loader"
import { tickerAdd, tickerRemove } from "./engine/application"
import { EventHub, events } from './engine/events'
import { ITEM_TYPES } from "./constants"

export default class Monster extends AnimatedSprite {
    constructor(side) {
        super(sprites.monster.animations.monster)
        if (side < 3) this.scale.set(-1, 1)
        this.anchor.set(0.5, 0.9)
        this.animationSpeed = 0.5
        this.play()

        this.type = ITEM_TYPES.monster

        EventHub.on( events.restart, this.restart, this )
    }

    restart() {
        tickerRemove(this)
        this.alpha = 1
    }

    getShut() {
        this.parent.removeItem( this )
        tickerAdd(this)
    }

    tick(time) {
        this.alpha -= 0.0001 * time.deltaMS
        if (this.alpha <= 0) {
            this.alpha = 0
            tickerRemove(this)
        }
    }
}