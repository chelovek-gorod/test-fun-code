import { Container, Graphics, Sprite, TilingSprite } from "pixi.js"
import { EventHub, events } from './engine/events'
import { tickerAdd } from "./engine/application"
import { sprites } from "./engine/loader"
import { CEIL_SIZE, CEIL_HALF_SIZE, CEIL_QUARTER_SIZE, MAP_OFFSET_TOP, ACTIONS }  from "./constants"

const slots = 5

export default class Inventory extends Container {
    constructor(items_list) {
        super()

        this.restartSlots = [...items_list]
        this.slots = items_list
        this.collectedItems = []

        this.itemsTargetX = 0
        this.itemsTargetY = CEIL_SIZE

        for (var i = 0; i < slots; i++) {
            const slot = new Sprite(sprites.inventory_box)
            slot.position.set(i * CEIL_SIZE, 0)
            this.addChild( slot )
        }

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
            x: CEIL_HALF_SIZE + this.slots.length * CEIL_HALF_SIZE,
            y: CEIL_HALF_SIZE
        }
        item.moveRate = {
            x: (this.itemsTargetX - item.x) / 600,
            y: (this.itemsTargetY - item.y) / 600
        }
        this.slots.push(item_name)
        console.log('Inventory:', this.slots)
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
