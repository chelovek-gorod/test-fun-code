import { Sprite } from "pixi.js"
import { sprites } from "./engine/loader"
import { DIRECTION, ITEM_TYPES, STONE_SPEED, CEIL_OFFSET } from "./constants"
import { EventHub, events } from './engine/events'
import { tickerAdd, tickerRemove } from "./engine/application"

export default class Stone extends Sprite {
    constructor() {
        super(sprites.static_stone)
        this.anchor.set(0.5, 0.75)
        this.position.set(0, 0)

        this.type = ITEM_TYPES.stone

        this.targetX = 0
        this.targetY = 0
        this.targetCeil = null
        this.direction = ''

        this.speed = STONE_SPEED

        EventHub.on( events.restart, this.restart, this )
    }

    restart() {
        tickerRemove(this)
        this.position.set(0, 0)
        this.targetX = 0
        this.targetY = 0
        this.targetCeil = null
        this.direction = ''
    }

    move( direction, ceil ) {
        this.direction = direction

        this.targetCeil = ceil

        if (CEIL_OFFSET[this.direction].dy > 0) {
            this.parent.removeChild(this)
            this.targetCeil.addChild(this)
            this.targetX = 0
            this.targetY = 0
            this.position.set(-CEIL_OFFSET[this.direction].dx, -CEIL_OFFSET[this.direction].dy)
        } else {
            this.targetX = CEIL_OFFSET[this.direction].dx
            this.targetY = CEIL_OFFSET[this.direction].dy
        }

        this.targetCeil.isOpen = false
        this.targetCeil.item = this

        tickerAdd(this)
    }

    endMove() {
        tickerRemove(this)

        if (CEIL_OFFSET[this.direction].dy < 0) {
            this.parent.removeChild(this)
            this.targetCeil.addChild(this)
            this.position.set(0, 0)
        }

        this.targetCeil = null
        this.direction = ''
    }

    tick(time) {
        switch( this.direction ) {
            case DIRECTION.left:
                this.position.x -= this.speed * time.deltaMS
                this.position.y -= this.speed * 0.5 * time.deltaMS
                if (this.position.x <= this.targetX) return this.endMove()
                break
            case DIRECTION.right:
                this.position.x += this.speed * time.deltaMS
                this.position.y += this.speed * 0.5 * time.deltaMS
                if (this.position.x >= this.targetX) return this.endMove()
                break
            case DIRECTION.up:
                this.position.x += this.speed * time.deltaMS
                this.position.y -= this.speed * 0.5 * time.deltaMS
                if (this.position.y <= this.targetY) return this.endMove()
                break
            case DIRECTION.down:
                this.position.x -= this.speed * time.deltaMS
                this.position.y += this.speed * 0.5 * time.deltaMS
                if (this.position.y >= this.targetY) return this.endMove()
                break
        }
    }
}