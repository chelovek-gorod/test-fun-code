import { Container, Sprite } from "pixi.js"
import { sprites } from "./engine/loader"
import { ITEM_TYPES }  from "./constants"
import { EventHub, events } from './engine/events'

export default class Ceil extends Container {
    constructor(x, y, isOpen = true, item = null) {
        super()
        this.ceil = new Sprite( sprites.ceil )
        this.ceil.anchor.set(0.5, 0.2)
        this.addChild(this.ceil)

        this.restartIsOpen = isOpen
        this.isOpen = isOpen
        this.item = item
        if (this.item) this.addChild(this.item)

        this.position.set(x, y)

        EventHub.on( events.restart, this.restart, this )
    }

    restart() {
        this.isOpen = this.restartIsOpen
        if (this.item) {
            this.addChild( this.item )
            this.item.position.set(0, 0)
        }
    }

    checkOpen() {
        if (this.item) {
            if (this.item.type === ITEM_TYPES.key
            || this.item.type === ITEM_TYPES.gun) {
                this.removeChild(this.item)
                this.item.addToInventory()
            }
        }
        return this.isOpen
    }
}