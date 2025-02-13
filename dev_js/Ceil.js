import { Container, Sprite } from "pixi.js"
import { sprites } from "./engine/loader"
import { ITEM_TYPES }  from "./constants"
import { EventHub, events } from './engine/events'

export default class Ceil extends Container {
    constructor(x, y, isBright, item = null) {
        super()
        const ceilName = 'ceil_' + Math.ceil(Math.random() * 3) + (isBright ? 'w' : 'b')
        this.ceil = new Sprite( sprites[ ceilName ] )
        this.ceil.anchor.set(0.5)
        this.addChild(this.ceil)

        this.isOpen = (item === null || item.type === ITEM_TYPES.target) ? true : false
        this.item = item

        this.restartIsOpen = this.isOpen
        this.restartItem = item

        if (this.item) this.addChild(this.item)

        this.position.set(x, y)

        EventHub.on( events.restart, this.restart, this )
    }

    restart() {
        if (this.item && this.item !== this.restartItem) {
            this.removeChild(this.item)
        }
        this.isOpen = this.restartIsOpen
        this.item = this.restartItem
        if (this.item) {
            this.addChild( this.item )
            this.item.position.set(0, 0)
        }
    }

    removeItem() {
        if (!this.item) return null

        this.isOpen = true
        this.removeChild(this.item)
        const item = this.item
        item.position.set(this.position.x, this.position.y)
        this.item = null
        return item
    }

    checkMove( inventory ) {
        if (this.isOpen) return this.isOpen

        if (this.item.type === ITEM_TYPES.gun) {
            this.isOpen = true
            const gun = this.removeItem()
            this.parent.addChild(gun)
            inventory.addItem(gun, 'gun')
            return true
        }

        if (this.item.type === ITEM_TYPES.key) {
            this.isOpen = true
            const key = this.removeItem()
            this.parent.addChild(key)
            inventory.addItem(key, 'key_' + key.color)
            return true
        }

        if (this.item.type === ITEM_TYPES.door
        && inventory.checkItem( 'key_' + this.item.color )) {
            this.isOpen === true
            this.item.open()
            return true
        }

        return this.isOpen
    }
}