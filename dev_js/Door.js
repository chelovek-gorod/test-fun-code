import { AnimatedSprite } from "pixi.js"
import { sprites } from "./engine/loader"
import { ITEM_TYPES } from "./constants"
import { EventHub, events } from './engine/events'

export default class Door extends AnimatedSprite {
    constructor(color, isLefRight) {
        //super(sprites.doors.animations[color + "_close"])
        //this.anchor.set(0.5, 0.8)
        super(sprites['gate_' + color].animations['gate_' + color + '_open'])
        this.anchor.set(0.5, 1)
        if (isLefRight) this.scale.set( -1 , 1 )
        this.color = color

        this.type = ITEM_TYPES.door
        this.isOpen = false

        this.animationSpeed = 0.5
        this.loop = false
        this.gotoAndStop(0)

        EventHub.on( events.restart, this.restart, this )
    }

    restart() {
        this.isOpen = false
        this.gotoAndStop(0)
    }

    open() {
        this.isOpen = true
        this.gotoAndPlay(0)
    }
}