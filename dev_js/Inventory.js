import { Container, AnimatedSprite, Sprite } from "pixi.js"
import { EventHub, events } from './engine/events'
import { tickerAdd } from "./engine/application"
import { sprites } from "./engine/loader"
import { CEIL_SIZE, CEIL_HALF_SIZE, KEY_COLORS, ITEM_TYPES }  from "./constants"

const slots = 5

export default class Inventory extends Container {
    constructor(items_list) {
        super()

        this.restartSlots = []
        this.slots = []
        this.collectedItems = []

        this.itemsTargetX = 0
        this.itemsTargetY = CEIL_SIZE

        for (var i = 0; i < slots; i++) {
            const slot = new Sprite(sprites.inventory_box)
            slot.position.set(i * CEIL_SIZE, 0)
            this.addChild( slot )
        }

        items_list.forEach( itemName => {
            if (itemName.indexOf('key') > -1) {
                for( let color in KEY_COLORS) {
                    if (itemName.indexOf(color) === 4) {
                        const key = new AnimatedSprite( sprites.keys.animations[ color ] )
                        key.anchor.set(0.5, 0.7)
                        key.gotoAndPlay( Math.floor( Math.random() * key.textures.length ) )
                        key.type = ITEM_TYPES.key
                        key.color = color
                        key.position.set(CEIL_HALF_SIZE + this.slots.length * CEIL_SIZE, CEIL_HALF_SIZE)
                        this.addChild( key )

                        this.restartSlots.push('key_' + color)
                        this.slots.push('key_' + color)
                    }
                }
            }
        })

        tickerAdd(this)

        EventHub.on( events.restart, this.restart, this )
    }

    restart() {
        this.slots = [...this.restartSlots]
        this.collectedItems = []
    }

    addItem( item, item_name ) {
        this.collectedItems.push( item )
        item.targetPoint = {
            x: CEIL_HALF_SIZE + this.slots.length * CEIL_SIZE,
            y: CEIL_HALF_SIZE
        }
        item.moveRate = {
            x: (this.itemsTargetX - item.x) / 600,
            y: (this.itemsTargetY - item.y) / 600
        }
        this.slots.push(item_name)
    }

    checkItem( item_name ) {
        return (this.slots.indexOf(item_name) > -1)
    }

    tick(time) {
        if (this.collectedItems.length === 0) return

        this.collectedItems.forEach( item => {
            if(item.x < this.itemsTargetX) {
                item.position.x += item.moveRate.x * time.deltaMS
                if (item.x >= this.itemsTargetX) item.position.x = this.itemsTargetX
            }
            else if(item.x > this.itemsTargetX) {
                item.position.x += item.moveRate.x * time.deltaMS
                if (item.x <= this.itemsTargetX) item.position.x = this.itemsTargetX
            }

            if(item.y > this.itemsTargetY) {
                item.position.y += item.moveRate.y * time.deltaMS
                if (item.y <= this.itemsTargetY) item.position.y = this.itemsTargetY
            }

            // add item in slots
            if (item.x === this.itemsTargetX && item.y === this.itemsTargetY) {
                item.parent.removeChild( item )
                this.addChild(item)
                item.position.set(item.targetPoint.x, item.targetPoint.y)
                item.targetPoint = null
            }
        })

        this.collectedItems = this.collectedItems.filter(item => item.targetPoint !== null)
    }
}
