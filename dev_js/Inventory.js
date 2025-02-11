import { Container, Graphics, Sprite, TilingSprite } from "pixi.js"
import { EventHub, events } from './engine/events'
import { getAppScreen, sceneAdd, tickerAdd } from "./engine/application"
import { sprites } from "./engine/loader"
import { CEIL_SIZE, CEIL_HALF_SIZE, CEIL_QUARTER_SIZE, MAP_OFFSET_TOP, ACTIONS }  from "./constants"

const slots = 5

export default class Inventory extends Container {
    constructor() {
        super()

        this.slots = []
        this.collectedItems = []

        for (var i = 0; i < slots; i++) {
            const slot =  new Sprite(sprites.inventory_box)
            slot.position.set(i * CEIL_SIZE, 0)
            this.addChild( slot )
        }

        tickerAdd(this)
    }

    addItem( item, item_name ) {
        this.addChild( item )
        this.collectedItems.push( item )
        item.targetPoint = {
            x: this.position.x + CEIL_HALF_SIZE + this.slots.length * CEIL_HALF_SIZE,
            y: this.position.x + CEIL_HALF_SIZE
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
            const speed = time.deltaMS * 0.1

            if(item.x < item.targetPoint.x) {
                item.position.x += speed
                if (item.x >= item.targetPoint.x) item.position.x = item.targetPoint.x
            }
            else if(item.x > item.targetPoint.x) {
                item.position.x -= speed
                if (item.x <= item.targetPoint.x) item.position.x = item.targetPoint.x
            }

            if(item.y < item.targetPoint.y) {
                item.position.y += speed
                if (item.y >= item.targetPoint.y) item.position.y = item.targetPoint.y
            }
            else if(item.y > item.targetPoint.y) {
                item.position.y -= speed
                if (item.y <= item.targetPoint.y) item.position.y = item.targetPoint.y
            }
        })

        this.collectedItems = this.collectedItems.filter(
            item => (item.x !== item.targetPoint.x || item.y !== item.targetPoint.y)
        )
    }
}
